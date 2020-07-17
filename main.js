const { language } = require('./config');
const { getItemsFromParentID } = require('./lib/embyAPIRequests.js');
const { getTrailerKey } = require('./lib/tmdbAPIRequests.js');
const { downloadTrailer } = require('./lib/trailerHandler.js');

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
    const key = await getTrailerKey(item.Type, item.ProviderIds.Tmdb, language);
    const downloadComplete = await downloadTrailer(key, "path");

    if (downloadComplete) { console.log('\n' + '='.repeat(30) + '\n'); }
  });
}
start();
