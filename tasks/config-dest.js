var fs = require('fs');
var parser = require('xml2json');

module.exports = function(grunt) {
	grunt.registerTask('bsp-config-dest', 'Configures destination directory', function() {
		if (!grunt.config('bsp.maven.destDir')) {
			var pom = grunt.config('bsp.maven.pom');
			var buildName;
			var xml;
			if (fs.existsSync(pom)) {
				xml = parser.toJson( fs.readFileSync(pom), { object: true } );
				buildName = xml.project.artifactId + '-' + xml.project.version;
				grunt.config('bsp.maven.destDir', '<%= bsp.maven.targetDir %>/' + buildName);
				grunt.log.writeln( grunt.config('bsp.maven.destDir') );
			} else {
				grunt.fail.fatal(pom + ' not found, is required to configure the target directory');
			}
		}
	});
};
