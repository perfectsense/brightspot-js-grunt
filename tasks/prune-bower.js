module.exports = function(grunt) {
    var BOWER = require('bower');

    grunt.task.registerTask('bower-prune', 'Prune extraneous Bower packages.', function() {
        var done = this.async();

        BOWER.commands.prune().

            on('end', function() {
                    grunt.log.writeln("Pruned extraneous Bower packages.");
                    done();
            }).

            on('error', function(error) {
                    grunt.fail.warn(error);
            });
    });
}
