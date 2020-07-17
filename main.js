const { embyAPI, tmdbAPI } = require('./config');
const request = require('request-json');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const emby = request.createClient(embyAPI.endpoint);
emby.headers['X-Emby-Token'] = embyAPI.api_key;

const tmdb = request.createClient(tmdbAPI.endpoint);

function getItemsFromParentID(id) {
  return new Promise(function(resolve, reject) {
    console.log('Sending request to EMBY API...');
    emby.get(`Items?ParentId=${id}&Fields=ProviderIds%2C%20Path`, function(err, res, body) {
      console.log('[EMBY]: Found all items under ParentID:', id)
      resolve(body.Items)
    });
  });
}

// I didn't know how to do this.
// Source: https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const start = async () => {
  // Hard coded for now.
  const items = await getItemsFromParentID('b8bb41f1a97845838e5f6494486d7b62');
  await asyncForEach(items, async (item) => {
    const key = await getTrailerKey(item.Type, item.ProviderIds.Tmdb, tmdbAPI.lang);
    const downloadComplete = await downloadTrailer(key, "path");

    if (downloadComplete) { console.log('\n' + '='.repeat(30) + '\n'); }
  });
}
start();

function getTrailerKey(type, id, lang) {
  return new Promise(function(resolve, reject) {
    if (type === 'Series') { type = 'tv' }
    else if (type === 'Movie') { type = 'movie' }
    else {
      throw new Error(`Could not process type: ${type}.` +
                      `\nPlease use a type supported by TMDB.\n`);
    }

    console.log('Sending request to TMDB...');
    tmdb.get(`${type}/${id}/videos?language=${lang}&api_key=${tmdbAPI.api_key}`, function(err, res, body) {
      const result = body.results[0].key;
      console.log('[TMDB]: Found trailer for requested item. [YT]:', result)
      resolve(result);
    });
  });
}

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
