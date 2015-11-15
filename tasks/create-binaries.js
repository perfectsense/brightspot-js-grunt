var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {
	grunt.registerTask('create-binaries', 'Creates helper binaries.', function() {
        var targetPath = grunt.config('bsp.maven.targetDir');

		if (!targetPath) {
            return;
        }

        var binDirPath = path.join(targetPath, 'bin');
        var realNodePath = path.join('node', 'node');
        var shRealNodePath;
        var cmdRealNodePath;

        if (fs.existsSync(realNodePath)) {
            realNodePath = path.relative(binDirPath, realNodePath);
            shRealNodePath = '"$(dirname $0)/' + realNodePath + '"';
            cmdRealNodePath = '%~dp0' + realNodePath;

        } else {
            shRealNodePath = cmdRealNodePath = 'node';
        }

        var nodeBinPath = path.join(binDirPath, 'node');

        grunt.file.write(nodeBinPath, '#/bin/sh\n' + shRealNodePath + ' "$@"');
        fs.chmodSync(nodeBinPath, 0755);
        grunt.file.write(nodeBinPath + '.cmd', '@echo off\n' + cmdRealNodePath + ' %*\n@echo on');
        grunt.log.writeln('Created binary: node');

        grunt.file.expand([ path.resolve(__dirname, '..').split(path.sep).join('/') + '/node_modules/*/bin/*', 'node_modules/*/bin/*' ]).forEach(function (namePath) {
            var name = path.basename(namePath);
            var binPath = path.join(binDirPath, name);

            grunt.file.write(binPath, '#/bin/sh\n' + shRealNodePath + ' $(dirname $0)/' + path.relative(binDirPath, namePath) + ' "$@"');
            fs.chmodSync(binPath, 0755);
            grunt.file.write(binPath + '.cmd', '@echo off\n' + cmdRealNodePath + ' %~dp0' + path.relative(binDirPath, namePath) + ' %*\n@echo on');
            grunt.log.writeln('Created binary: ' + name);
        });
	});
};
