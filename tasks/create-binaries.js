var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {
	grunt.registerTask('create-binaries', 'Creates helper binaries.', function() {
        var realNodePath = path.join('node', 'node');

        if (!fs.existsSync(realNodePath)) {
            return;
        }

        var targetPath = grunt.config('bsp.maven.targetDir');
        
		if (!targetPath) {
            return;
        }

        var binDirPath = path.join(targetPath, 'bin');
        realNodePath = path.relative(binDirPath, realNodePath);
        var nodeBinPath = path.join(binDirPath, 'node'); 

        grunt.file.write(nodeBinPath, '#/bin/sh\n"$(dirname $0)/' + realNodePath + '" "$@"');
        fs.chmodSync(nodeBinPath, 0755);
        grunt.file.write(nodeBinPath + '.cmd', '@echo off\n%~dp0' + realNodePath + ' %*\n@echo on');
        grunt.log.writeln('Created binary: node');

        grunt.file.expand(path.join(__dirname, '..', 'node_modules/*/bin/*')).forEach(function (namePath) {
            var name = path.basename(namePath);
            var binPath = path.join(binDirPath, name);

            grunt.file.write(binPath, '#/bin/sh\n$(dirname $0)/' + realNodePath + ' $(dirname $0)/' + path.relative(binDirPath, namePath) + ' "$@"');
            fs.chmodSync(binPath, 0755);
            grunt.file.write(binPath + '.cmd', '@echo off\n%~dp0' + realNodePath + ' %~dp0' + path.relative(binDirPath, namePath) + ' %*\n@echo on');
            grunt.log.writeln('Created binary: ' + name);
        });
	});
};
