const dotenv = require('dotenv');
const environmentVariables = dotenv.config();

if ( environmentVariables.error ) { throw environmentVariables.error; }

const language = process.env.language || 'en'

const embyAPI = {
  api_key: process.env.emby_api_key || undefined,
  host: process.env.emby_host || undefined,
  // endpoint key and value will be populated later in the code.
}

if (embyAPI.api_key == undefined ) { throw new Error('[EMBY]: API_KEY is required.'); }
if (embyAPI.host == undefined ) { throw new Error('[EMBY]: Server IP/FQDN was not supplied.') }
embyAPI.endpoint = `${embyAPI.host}/emby/`

const tmdbAPI = {
  api_key: process.env.tmdb_api_key || undefined,
  endpoint: 'https://api.themoviedb.org/3/',
}

if (tmdbAPI.api_key == undefined ) { throw new Error('[TMDB]: API_KEY is required.'); }

module.exports = { language, embyAPI, tmdbAPI };
