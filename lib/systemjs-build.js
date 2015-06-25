/**
 * Have to break this out into a separate script because of
 * cwd issue with systemjs-builder. This script is copied to
 * the script target dir. Expects babel.js to be in the same
 * directory. Expects to be run from same directory as the
 * script root.
 * 
 * node build.js in.js out.js config.js
 */
var Builder = require('systemjs-builder');
var builder = new Builder();
var pathFileIn = process.argv[2];
var pathFileOut = process.argv[3];
var pathConfig = process.argv[4];
var optMinify = process.argv[5];
var optSourceMap = process.argv[6];

if (optMinify === "true") {
  optMinify = true;
} else {
  optMinify = false;
}
if (optSourceMap === "true") {
  optSourceMap = true;
} else {
  optSourceMap = false;
}

builder.loadConfig(pathConfig)
  .then(function() {
    builder.config({
      'map': {
        baseURL: '.'
      }
    });
    return builder.buildSFX(pathFileIn, pathFileOut, { minify: optMinify, sourceMap: optSourceMap });
  })
  .then(function() {
    process.exit(0);
  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });