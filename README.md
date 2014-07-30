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
        "bsp-grunt": "1.0.7"
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

If you specify bower dependencies, but nothing in the gruntfile, the default behavior will use the bower.json of your component to pull the _main and copy it down in the JS folder. If you are using bower for CSS components or something more custom, define that in the bower object. Example below is pulling in the font awesome less files and font:

  require('bsp-grunt')(grunt, {
        bsp: {
          bower: {
            'components-font-awesome':
            [{
              src:'less/*',
              dest:'/assets/styles/font-awesome',
              expand:true,
              flatten: true
            },
            {
              src:'fonts/*',
              dest:'/assets/fonts',
              expand:true,
              flatten: true
            }]
          },
        }
      });
    };



## Grunt

`Gruntfile.js`:

    module.exports = function(grunt) {
      require('bsp-grunt')(grunt, {
        bsp: {
          styles: {
            dir: 'assets/styles',
            less: 'foo.less'
          },
          scripts: {
            dir: 'assets/scripts',
            // to jshint your js source folder, specify the .jshintrc file based on the root path. If no .jshintrc file is passed, there will be no jshint
            jshintrc: '.jshintrc',
            rjsModules: [
                {
                    name: 'foo'
                }
            ]
          }
        }
      });
    };


If you wish to include requirejs into your final compiled scripts file, we copy in a version of require that you can include in the optimizer. You can include it as shown in the example below, and execute your main.js directly vs including your main.js as a data-main of require.js

  scripts: {
      dir: "assets/js",
      rjsConfig: 'main.js',
      rjsModules: [
          {
              name: 'main',
              include: 'require-for-optimizer',
              insertRequire: ['main']
          }
      ]
  },

Note that `require('bsp-grunt')(grunt, { ... })` replaces `grunt.initConfig({ ... })`. For example, to use  `grunt-contrib-uglify` and provide its configuration:

    module.exports = function(grunt) {
      require('bsp-grunt')(grunt, {
        ...,
        uglify: { ... }
      });

      grunt.loadNpmTasks('grunt-contrib-uglify');

      grunt.registerTask('default', [
        'bsp-verify'
        'bsp',
        'uglify'
      ])
    };

jshint is setup as a separate 'bsp-verify' task. It gets run by default before the rest of the build, and will stop both Grunt and Maven if there are JS syntax error. If you do not want this behavior, you can respecify the default task to exclude this.

    grunt.registerTask('default', [
      'bsp',
    ])

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


If you wish to turn off autoprefixer, specify it in your styles definition

    module.exports = function(grunt) {
      require('bsp-grunt')(grunt, {
        bsp: {
          styles: {
            dir: 'assets/styles',
            less: 'foo.less',
            autoprefixer: false
          }
        }
      });
    };

## HTML

While developing locally, use the following to compile LESS and apply Autoprefixer on the fly:

    <script type="text/javascript" src="/assets/scripts/less-dev.js"></script>
    <script type="text/javascript" src="/assets/scripts/less.js"></script>
