./ffmpeg -i a9427d44-4765-4e78-940b-bf4eb32f83e5.wav -acodec pcm_s16le -ar 16000 output.wav

FFmpeg can take input of raw audio types by specifying the type on the command line. For instance, to convert a "raw" audio type to a ".wav" file:

ffmpeg -f pcm_s32le input_filename.raw output.wav
You can specify number of channels, etc. as well, ex:

ffmpeg -f u16le -ar 44100 -ac 1 -i input.raw output.wav
The default for muxing into WAV files is pcm_s16le. You can change it by specifying the audio codec and using the WAV file extension:

ffmpeg -i input -c:a pcm_s32le output.wav
which will create a WAV file containing audio with that codec (not a raw file). There are also other containers that can contain raw audio packets, like pcm_bluray.

If you want to create a raw file, don't use the WAV format, but the raw one (as seen in the table above), e.g. s16le, and the appropriate audio codec:

ffmpeg -i input -f s16le -c:a pcm_s16le output.raw

# https://trac.ffmpeg.org/wiki/audio%20types

# agirl

> agirl

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
