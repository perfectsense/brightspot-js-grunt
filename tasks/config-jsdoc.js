var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {
	grunt.registerTask('configure-jsdoc', 'Configures the jsdoc options.', function() {
        var sources = [
            '<%= bsp.maven.srcDir %>/<%= bsp.scripts.dir %>/**/*.js'
        ];

        // Prepend additional jsdoc sources that were enabled via Bower
        if (grunt.config.get('jsdocBowerSrc')) {
            sources.unshift('<%= jsdocBowerSrc %>/<%= bsp.maven.srcDir %>/**/*.js');
        }

        grunt.config('jsdoc', {
            dist : {
                src: sources,
                options: {
                    configure: 'node_modules/bsp-grunt/jsdocConfig.json',
                    destination: '<%= bsp.maven.destDir %>/jsdocs'
                }
            }
        });
	});
};
