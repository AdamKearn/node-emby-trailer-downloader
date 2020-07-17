const { embyAPI } = require('../config');
const request = require('request-json');

const emby = request.createClient(embyAPI.endpoint);
emby.headers['X-Emby-Token'] = embyAPI.api_key;

function getItemsFromParentID(id) {
  return new Promise(function(resolve, reject) {
    console.log('Sending request to EMBY API...');
    emby.get(`Items?ParentId=${id}&Fields=ProviderIds%2C%20Path`, function(err, res, body) {
      console.log('[EMBY]: Found all items under ParentID:', id)
      resolve(body.Items)
    });
  });
}

module.exports = { getItemsFromParentID }
