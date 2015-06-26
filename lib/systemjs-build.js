/**
 * Have to break this out into a separate script because of
 * cwd issue with systemjs-builder. This script is copied to
 * the script target dir. Expects babel.js to be in the same
 * directory. Expects to be run from same directory as the
 * script root.
 * 
 * node systemjs-build.js --input=<input> --output=<output> --config=<config> --otheropt=value --otheropt2=value
 * 
 * Ex:
 * node systemjs-build.js --input=in.js --output=out.js --config=config.js --minify=true --sourceMaps=true
 */
var _ = require('lodash');
var args = process.argv.slice(2);
var config = {};
var Builder = require('systemjs-builder');
var builder = new Builder();
var pathFileIn;
var pathFileOut;
var pathConfig;

_.forEach(args, function(arg) {
  var argParts = arg.split('=');
  var key = argParts[0].replace('--', '');
  var value = argParts[1];
  if (key === 'input') {
    pathFileIn = value;
  } else if (key === 'output') {
    pathFileOut = value;
  } else if (key === 'config') {
    pathConfig = value;
  } else {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    config[key] = value;
  }
});

builder.loadConfig(pathConfig)
  .then(function() {
    builder.config({
      'map': {
        baseURL: '.'
      }
    });
    return builder.buildSFX(pathFileIn, pathFileOut, config);
  })
  .then(function() {
    process.exit(0);
  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });