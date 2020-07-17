const { tmdbAPI } = require('../config');
const request = require('request-json');

const tmdb = request.createClient(tmdbAPI.endpoint);

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

module.exports = { getTrailerKey }
