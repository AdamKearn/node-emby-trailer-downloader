const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function downloadTrailer(key, path) {
  return new Promise(async function(resolve, reject) {
    const url = `https://www.youtube.com/watch?v=${key}`;
    const audioOutput = __dirname + '\\sound.mp4'
    const videoOutput = __dirname + '\\video.mp4'
    const mainOutput = __dirname + '\\output.mp4'

    let info = await ytdl.getInfo(key);
    let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    let videoFormats = ytdl.filterFormats(info.formats, 'videoonly');

    const onProgress = (chunkLength, downloaded, total) => {
      const percent = downloaded / total;
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
      process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)`);
    };

    console.log('Starting Audio Download...');
    ytdl(url, { quality: audioFormats[0].itag })
      .on('error', console.error)
      .on('progress', onProgress)
      .pipe(fs.createWriteStream(audioOutput))
      .on('finish', () => {
        console.log('\nStarting Video Download...');
        ytdl(url, { quality: videoFormats[0].itag })
          .on('error', console.error)
          .on('progress', onProgress)
          .pipe(fs.createWriteStream(videoOutput))
          .on('finish', () => {
            ffmpeg(videoOutput)
            //.mergeAdd(audioOutput)
            .addInput(audioOutput)
            .on("start", function(commandLine) {
              console.log("\n\n[FFMPEG]: Spawned FFmpeg with command:\n" + commandLine);
            })
            .on('error', function(err, stdout, stderr) {
              console.log('[FFMPEG]: Cannot process video: ' + err.message);
            })
            .on('end', function(stdout, stderr) {
              console.log('\n[FFMPEG]: Transcoding succeeded!');
              console.log('Removing Temporary files...')
              fs.unlink(audioOutput, function (err) { if (err) throw err; });
              fs.unlink(videoOutput, function (err) { if (err) throw err; });
              resolve(true);
            })
            .saveToFile(mainOutput)
          });
      });
  });
}

module.exports = { downloadTrailer }
