# Node Emby Trailer Downloader

A simple node project that uses the Emby API with TMDB API to download trailers for your media collection.

## Installation
Download the source using Git.

```bash
git clone https://github.com/AdamKearn/node-emby-trailer-downloader.git
cd node-emby-trailer-downloader
```

## Usage
Before you can use the program you will need to set you API details as environment variables or in the `.env` file.

```bash
node .
```

## Requirements
As this project uses the Emby API and TMDB to get the trailers you will need to make an API key.
See the below steps to signup/create a key.

#### 1. How to get an Emby API key:
1. Open the Emby Settings
2. Click on "API Keys"
3. Click on "New API Key"
4. Enter a name to call your key. e.g. TrailerDownloader

#### 2. How to get an TMDB API key:
1. Sign up for an TMDB account [here](https://www.themoviedb.org/account/signup)
2. Click on your avatar or initials in the main navigation
3. Click the "Settings" link
4. Click the "API" link in the left sidebar
5. Click "Create" or "click here" on the API page

#### 3. Install FFMPEG
For Windows users download FFMPEG [here](https://ffmpeg.org/download.html)
```bash
sudo apt-get install FFmpeg
```

## Contributing
Pull requests are more than welcome.  :)

 
##
Thanks for checking out my little project.\
I will continue to update this in my spare time.
