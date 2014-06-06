# Introduction

Standard set of Grunt configuration for Brightspot projects using the following:

- [Autoprefixer](https://github.com/ai/autoprefixer)
- [Brightspot](http://www.brightspotcms.com/)
- [Grunt](http://gruntjs.com/)
- [LESS](http://lesscss.org/)
- [RequireJS](http://requirejs.org/)
  - [r.js](http://requirejs.org/docs/optimization.html)

# Usage

`package.json` (for Grunt dependencies):

    {
      "name": "foo",
      "devDependencies": {
        "bsp-grunt": "1.0.6"
      }
    }

`bower.json` (for project-specific dependencies):

    {
      "name": "foo",
      "dependencies": {
        "jquery": "~1.11.0"
      }
    }

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
