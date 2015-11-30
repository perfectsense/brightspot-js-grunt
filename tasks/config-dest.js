var fs = require('fs');
var parseString = require('xml2js').parseString;

module.exports = function(grunt) {
    grunt.registerTask('bsp-config-dest', 'Configures destination directory', function() {
        if (!grunt.config('bsp.maven.destDir')) {
            var pom = grunt.config('bsp.maven.pom');

            if (fs.existsSync(pom)) {
                var done = this.async();

                parseString(fs.readFileSync(pom), function (err, result) {
                    var buildName = result.project.artifactId + '-' + result.project.version;

                    grunt.config('bsp.maven.destDir', '<%= bsp.maven.targetDir %>/' + buildName);
                    grunt.log.writeln(grunt.config('bsp.maven.destDir'));
                    done();
                });

            } else {
                grunt.fail.fatal(pom + ' not found, is required to configure the target directory');
            }
        }
    });
};
