const dotenv = require('dotenv');
const environmentVariables = dotenv.config();

if ( environmentVariables.error ) { throw environmentVariables.error; }

const embyAPI = {
  api_key: process.env.emby_api_key || undefined,
  host: process.env.emby_host || undefined,
}

if (embyAPI.api_key == undefined ) { throw new Error('[EMBY]: API_KEY is required.'); }
if (embyAPI.host == undefined ) { throw new Error('[EMBY]: Server IP/FQDN was not supplied.') }
embyAPI.url = `${embyAPI.host}/emby/`

const tmdbAPI = {
  api_key: process.env.tmdb_api_key || undefined,
  url: 'https://api.themoviedb.org/3/',
  lang: process.env.language || 'en'
}

if (tmdbAPI.api_key == undefined ) { throw new Error('[TMDB]: API_KEY is required.'); }

module.exports = { embyAPI, tmdbAPI };
