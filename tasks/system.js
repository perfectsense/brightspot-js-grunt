var _ = require('lodash');
var path = require('path');
var Builder = require('systemjs-builder');

module.exports = function(grunt) {
    grunt.registerMultiTask('systemjs', 'Compiles systemjs apps', function() {
        var bspGruntDir = path.resolve(__dirname, '..');

        var config = {
            minify: true,
            polyfills: true,
            sourceMaps: true
        };

        var filesCount = 0;
        var filesDone = 0;
        var done = this.async();
        var options = this.options();

        if (!options.configFile || !grunt.file.exists(options.configFile)) {
            done();
            return;
        }

        if (options.configOverrides) {
            config = _.extend({}, config, options.configOverrides);
        }

        this.files.forEach(function(file) {
            filesCount++;

            var polyfillFiles = [bspGruntDir + '/lib/browser-polyfill.js'];
            var polyfillsConcat = '';

            var builder = new Builder(
                path.dirname(file.src[0]),
                path.resolve(options.configFile)
            );

            builder
                .buildStatic(path.basename(file.src[0]), path.resolve(file.dest), config)
                .then(function() {

                    // Check that the minified file was generated, otherwise throw
                    if (grunt.file.exists(file.dest)) {
                        grunt.log.writeln('Wrote:', file.dest.cyan);
                    } else {
                        grunt.fail.fatal('Failed to write: ' + file.dest.red);
                    }

                    // Append the specified polyfil files to the minified source
                    if (config.polyfills) {
                        if (config.polyfillFiles) {
                            polyfillFiles = config.polyfillFiles;
                            _.forEach(polyfillFiles, function(file) {
                                polyfillsConcat += grunt.file.read(file);
                            });
                            grunt.file.write(file.dest, polyfillsConcat + grunt.file.read(file.dest));
                            grunt.log.writeln('Prepended polyfills to: ', file.dest.cyan);
                        }
                    }

                    // Check that the sourcemap file was generated, otherwise throw
                    if (config.sourceMaps) {
                        if (grunt.file.exists(file.dest + '.map')) {
                            grunt.log.writeln('Wrote: ', (file.dest+'.map').cyan);
                        } else {
                            grunt.fail.fatal('Failed to write: ', (file.dest+'.map').red);
                        }
                    }

                    filesDone++;
                    if (filesDone === filesCount) {
                        done();
                    }
                })

            .catch(function(err) {
                if (err) {
                    grunt.log.writeln('SystemJS build failed!'.red);
                    grunt.fail.fatal(err);
                }
            });
        });
    });
};
