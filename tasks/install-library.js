var bower = require('bower');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');

module.exports = function(grunt) {
    grunt.registerTask('install-library', 'Installs a Bower component as a Brightspot FE library.', function() {
        var done = this.async();
        var endpoint = grunt.option('endpoint');

        if (!endpoint) {
            grunt.fail.fatal('--endpoint option required!');
        }

        var overwrite = grunt.option('overwrite');

        bower.commands.install([ endpoint ], { save: true }).
            on('end', function (installed) {
                _.forEach(installed, function (component) {
                    var files = component.pkgMeta['brightspot-library-files'];

                    if (files) {
                        files.forEach(function (filePath) {
                            var sourcePath = path.join(component.canonicalDir, filePath);

                            if (!fs.existsSync(sourcePath)) {
                                grunt.log.warn(sourcePath + " doesn't exist!");

                            } else {
                                if (!overwrite && fs.existsSync(filePath)) {
                                    grunt.log.warn("Won't overwrite " + filePath + " without --overwrite option!");

                                } else {
                                    grunt.file.copy(sourcePath, filePath);
                                    grunt.log.writeln('Copied file: ' + filePath);
                                }
                            }
                        });
                    }
                });

                done();
            });
    });
};
