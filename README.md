# videojs-hlsjs-quality-selector
[![npm version](https://badge.fury.io/js/videojs-hlsjs-quality-selector.svg)](https://badge.fury.io/js/videojs-hls-quality-selector)

This is a branch of the [videojs-hls-quality-selector][videojs-hls-quality-selector] (ver. 1.0.5) library, created by Chris Busted (chris@forgemotion.com).

Adds a quality selector menu for HLS sources played in videojs, with videojs-contrib-hls.js support. 
Requires (`videojs-contrib-hls.js` or `videojs-contrib-hls`) and videojs-contrib-quality-levels plugins.

**Note:** v1.x.x is Only compatible with VideoJS 7.x and hls libs `videojs/http-streaming` or `videojs-contrib-hls.js`. 

## Description

Adds a quality selector menu for HLS sources played in videojs.  
Requires `videojs-contrib-quality-levels` plugins.

Any HLS manifest with multiple playlists/renditions should be selectable from within the added control.  

**Native HLS**

Does not yet support browsers using native HLS (Safari, Edge, etc).  To enable plugin in browsers with native HLS, you must force non-native HLS playback:

![Example](example.png)

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Installation

- [Installation](#installation)
- [Usage](#usage)
  - [`<script>` Tag](#script-tag)
  - [Browserify/CommonJS](#browserifycommonjs)
  - [RequireJS/AMD](#requirejsamd)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Installation

```sh
npm install --save videojs-hlsjs-quality-selector
```

## Usage

To include videojs-hlsjs-quality-selector on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-contrib-hlsjs.min.js"></script>
<script src="//path/to/videojs-contrib-quality-levels.js"></script>
<script src="//path/to/videojs-hlsjs-quality-selector.min.js"></script>
<script>
  var player = videojs('my-video');

  player.hlsJsQualitySelector();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-hlsjs-quality-selector via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-contrib-hls.js');
require('videojs-contrib-quality-levels');
require('videojs-hlsjs-quality-selector');

var player = videojs('my-video');

player.hlsJsQualitySelector();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-contrib-hls.js', 'videojs-contrib-quality-levels', 'videojs-hlsjs-quality-selector'], function(videojs) {
  var player = videojs('my-video');

  player.hlsJsQualitySelector();
});
```

## License

MIT. Copyright (c) Taras Prokofiev (xttitanx@gmail.com)


[videojs]: http://videojs.com/
[videojs-hls-quality-selector]: https://www.npmjs.com/package/videojs-hls-quality-selector
