# Introduction

Standard set of Grunt configuration for Brightspot projects using the following:

- [Autoprefixer](https://github.com/ai/autoprefixer)
- [Brightspot](http://www.brightspotcms.com/)
- [Grunt](http://gruntjs.com/)
- [LESS](http://lesscss.org/)
- [RequireJS](http://requirejs.org/)
  - [r.js](http://requirejs.org/docs/optimization.html)

# Usage

## NPM

`package.json` (for Grunt dependencies):

    {
      "name": "foo",
      "devDependencies": {
        "bsp-grunt": "1.0.6"
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

To change the supported list of browsers (see [https://github.com/ai/autoprefixer#browsers](https://github.com/ai/autoprefixer#browsers) for the) syntax):

    module.exports = function(grunt) {
      require('bsp-grunt')(grunt, {
        ...,
        autoprefixer: {
          process: {
            options: {
              browsers: [ 'last 1 version', '> 1%', 'Explorer 7' ]
            }
          }
        }
      });

## HTML

While developing locally, use the following to compile LESS and apply Autoprefixer on the fly:

    <script type="text/javascript" src="/assets/scripts/less-dev.js"></script>
    <script type="text/javascript" src="/assets/scripts/less.js"></script>
