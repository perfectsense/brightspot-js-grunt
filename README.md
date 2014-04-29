# Introduction

Standard set of Grunt configuration for Brightspot projects using the following:

- [Brightspot](http://www.brightspotcms.com/)
- [Grunt](http://gruntjs.com/)
- [LESS](http://lesscss.org/)
- [RequireJS](http://requirejs.org/)
  - [almond](https://github.com/jrburke/almond)
  - [r.js](http://requirejs.org/docs/optimization.html)

# Usage

`package.json` (for Grunt dependencies):

    {
      "name": "foo",
      "devDependencies": {
        "bsp-grunt": "~1.0.1"
      }
    }

`Gruntfile.js` (single minified CSS file from LESS and single static JS file using RequireJS and almond):

    module.exports = function(grunt) {
      require('bsp-grunt')(grunt, {
        bsp: {
          styles: {
            dir: "assets/styles",
            less: "foo.less"
          },
          scripts: {
            dir: "assets/scripts",
            rjsMain: "foo"
          }
        }
      });
    };

`Gruntfile.js` (multiple minified CSS from LESS and multiple JS modules using RequireJS):

    module.exports = function(grunt) {
      require('bsp-grunt')(grunt, {
        bsp: {
          styles: {
            dir: "assets/styles",
            less: [ "foo.less", "bar.less" ]
          },
          scripts: {
            dir: "assets/scripts",
            rjsModules: [
                {
                    name: "foo"
                },
                {
                    name: "bar"
                }
            ]
          }
        }
      });
    };

`bower.json` (for project-specific dependencies):

    {
      "name": "foo",
      "dependencies": {
        "jquery": "~1.11.0"
      }
    }
