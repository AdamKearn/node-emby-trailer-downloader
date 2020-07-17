const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function getTrailerStreams(key) {
  return new Promise(async function(resolve, reject) {
    const videoInfo = await ytdl.getInfo(key);
    const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audioonly');
    const videoFormats = ytdl.filterFormats(videoInfo.formats, 'videoonly');

    resolve({
      audio: audioFormats[0],
      video: videoFormats[0]
    });
  });
}

function downloadStreams(key, streams) {
  return new Promise(async function(resolve, reject) {
    const audioOutput = __dirname + '\\sound.mp4'
    const videoOutput = __dirname + '\\video.mp4'

    const onProgress = (chunkLength, downloaded, total) => {
      const percent = downloaded / total;
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
      process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)`);
    };

    console.log('Starting Audio Download...');
    ytdl(key, { quality: streams.audio.itag })
      .on('error', console.error)
      .on('progress', onProgress)
      .pipe(fs.createWriteStream(audioOutput))
      .on('finish', () => {
        console.log('\nStarting Video Download...');
        ytdl(key, { quality: streams.video.itag })
          .on('error', console.error)
          .on('progress', onProgress)
          .pipe(fs.createWriteStream(videoOutput))
          .on('finish', () => {
            resolve({
              audio: audioOutput,
              video: videoOutput
            });
          });
      });
  });
}

function mergeStreams(files) {
  return new Promise(async function(resolve, reject) {
    const mainOutput = __dirname + '\\output.mp4'

    ffmpeg(files.video)
    .addInput(files.audio)
    .on("start", function(commandLine) {
      console.log("\n\n[FFMPEG]: Spawned FFmpeg with command:\n" + commandLine);
    })
    .on('error', function(err, stdout, stderr) {
      console.log('[FFMPEG]: Cannot process video: ' + err.message);
    })
    .on('end', function(stdout, stderr) {
      console.log('\n[FFMPEG]: Transcoding succeeded!');
      console.log('Removing Temporary files...')
      fs.unlink(files.video, function (err) { if (err) throw err; });
      fs.unlink(files.audio, function (err) { if (err) throw err; });
      resolve(mainOutput);
    })
    .saveToFile(mainOutput)
  });
}

async function getTrailer(key, path) {
  return new Promise(async function(resolve, reject) {
    // As youtube doesn't stream HD videos with audio we will
    // have to download them separately.
    const steams = await getTrailerStreams(key);
    const files = await downloadStreams(key, steams);

    // Now we have the Audio and Video we can merge these together using FFMPEG.
    const trailer = await mergeStreams(files);

    resolve(trailer);
  });
}

module.exports = { getTrailer }
