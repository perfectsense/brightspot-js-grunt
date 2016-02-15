# Introduction

NOTE: Starting with version 2.0.0, bsp-grunt compiles [ECMAScript 6 modules](http://exploringjs.com/es6/ch_modules.html) instead of [RequireJS modules](http://requirejs.org/). Work in 1.x.x if you need RequireJS.

A standard set of Grunt configuration for Brightspot projects includes the following:

- [Brightspot](http://www.brightspotcms.com/)
- [Grunt](http://gruntjs.com/)
- [LESS](http://lesscss.org/)
- [Autoprefixer](https://github.com/postcss/autoprefixer)
- [SystemJS Builder](https://github.com/systemjs/builder)

# Usage

## NPM

`package.json` (for Grunt dependencies):

    {
      "name": "foo",
      "devDependencies": {
        "bsp-grunt": "1.1.1"
      }
    }

## Bower

`bower.json` (for project-specific dependencies):

    {
      "name": "foo",
      "dependencies": {
        "jquery": "~1.11.0"
      }
    }

## Grunt

`Gruntfile.js`:

    module.exports = function(grunt) {
      require('bsp-grunt')(grunt, {
        bsp: {
          styles: {
            dir: "assets/styles",
            less: "foo.less"
          },
          scripts: {
            dir: "assets/scripts",
            rjsModules: [
                {
                    name: "foo"
                }
            ]
          }
        }
      });
    };

Note that `require('bsp-grunt')(grunt, { ... })` replaces `grunt.initConfig({ ... })`. For example, to use  `grunt-contrib-uglify` and provide its configuration:

    module.exports = function(grunt) {
      require('bsp-grunt')(grunt, {
        ...,
        uglify: { ... }
      });

      grunt.loadNpmTasks('grunt-contrib-uglify');

      grunt.registerTask('default', [
        'bsp',
        'uglify'
      ])
    };

## Autoprefixer

If you want to run autoprefixer on your compiled CSS, set bsp.styles.autoprefixer to `true`. Since autoprefixer can use a `browserlist` file to do it's compilation, if you do not want the default `last 2 versions`, create a `browserlist` file in your root folder based on the following syntax: [Browserlist](https://github.com/ai/browserslist)

## HTML

While developing locally, use the following to compile LESS and apply Autoprefixer on the fly:

    <script type="text/javascript" src="/assets/scripts/less-dev.js"></script>
    <script type="text/javascript" src="/assets/scripts/less.js"></script>
