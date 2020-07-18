const { MultiSelect } = require('enquirer');

const { language } = require('./config');
const { getMediaFolders, getItemsFromParentID } = require('./lib/embyAPIRequests.js');
const { getTrailerKey } = require('./lib/tmdbAPIRequests.js');
const { getTrailer } = require('./lib/trailerHandler.js');

function selectMediaFolders() {
  return new Promise(async function(resolve, reject) {
    const mediaFolders = await getMediaFolders();
    const choices = []

    for (const folder in mediaFolders) {
      choices.push({
        name: mediaFolders[folder].Name,
        value: mediaFolders[folder].Id
      });
    }

    const prompt = new MultiSelect({
      message: 'Select the media folders that you would like to download trailers for:',
      choices: choices,
      result(names) {
        if (names.length <= 0) { reject(new Error('You MUST select at least one media folder.')); }

        return Object.values(this.map(names));
      }
    });

    prompt.run()
    .then(answers => resolve(answers))
    .catch(console.error);
  });
}

// I didn't know how to do this.
// Source: https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function getSelectedFoldersItems(mediaFolders) {
  return new Promise(async function(resolve, reject) {
    const allItems = [];

    for (const folder of mediaFolders) {
      const folderItems = await getItemsFromParentID(folder);

      await asyncForEach(folderItems, async (item) => {
        allItems.push({
          name: item.Name,
          type: item.Type,
          tmdb: item.ProviderIds.Tmdb
        });
      });
    }

    resolve(allItems);
  });
}

const start = async () => {
  const mediaFolders = await selectMediaFolders();
  const items = await getSelectedFoldersItems(mediaFolders)

  await asyncForEach(items, async (item) => {
    const key = await getTrailerKey(item.type, item.tmdb, language);
    const trailer = await getTrailer(key, "path");

    if (trailer) { console.log('\n' + '='.repeat(30) + '\n'); }
  });
}
start();
