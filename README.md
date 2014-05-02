# Introduction

Standard set of Grunt configuration for Brightspot projects using the following:

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
        "bsp-grunt": "~1.0.2"
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

`bower.json` (for project-specific dependencies):

    {
      "name": "foo",
      "dependencies": {
        "jquery": "~1.11.0"
      }
    }
