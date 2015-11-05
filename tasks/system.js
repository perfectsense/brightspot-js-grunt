var _ = require('lodash');
var path = require('path');

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
		var buildDeps = [
			{ src: bspGruntDir + '/lib/browser.js', dest: 'babel.js' },
			{ src: bspGruntDir + '/lib/browser-polyfill.js', dest: 'browser-polyfill.js' },
			{ src: bspGruntDir + '/lib/systemjs-build.js', dest: 'systemjs-build.js' },
			{ src: bspGruntDir + '/lib/system.js', dest: 'system.js' }
		];
		if (!options.configFile || !grunt.file.exists(options.configFile)) {
			return;
		}
		if (options.configOverrides) {
			config = _.extend({}, config, options.configOverrides);
		}
		this.files.forEach(function() {
			filesCount++;
		});
		this.files.forEach(function(file) {
			var args = [
				'systemjs-build.js',
				'--input=' + path.basename(file.src[0]),
				'--output=' + path.resolve(file.dest),
				'--config=' + path.basename(options.configFile)
			];
			var child;
			var fileBaseDir = path.resolve( path.dirname(file.src[0]) );
			var polyfillFiles = [bspGruntDir + '/lib/browser-polyfill.js'];
			var polyfillsConcat = '';
			
			/** script must be run from app root because of bug in systemjs-builder */
			buildDeps.forEach(function(dep) {
				grunt.file.copy(dep.src, fileBaseDir + '/' + dep.dest);
			});

			_.forEach(config, function(val, key) {
				args.push('--' + key + '=' + val);
			});

			child = grunt.util.spawn({
				cmd: 'node',
				args: args,
				opts: {
					cwd: fileBaseDir,
					stdio: 'inherit'
				}
			}, function(err) {
				if (err) {
					grunt.log.writeln('SystemJS build failed'.red);
					grunt.fail.fatal(err);
				}
				if (grunt.file.exists(file.dest)) {
					grunt.log.writeln('Wrote',file.dest.cyan);
				} else {
					grunt.fail.fatal('Failed to write' + file.dest.red);
				}
				if (config.polyfills) {
					if (config.polyfillFiles) {
						polyfillFiles = config.polyfillFiles;
					}
					_.forEach(polyfillFiles, function(file) {
						polyfillsConcat += grunt.file.read(file);
					});
					grunt.file.write(file.dest, polyfillsConcat + grunt.file.read(file.dest));
					grunt.log.writeln('Prepended polyfills to',file.dest.cyan);
				}
				if (config.sourceMaps) {
					if (grunt.file.exists(file.dest + '.map')) {
						grunt.log.writeln('Wrote',(file.dest+'.map').cyan);
					} else {
						grunt.fail.fatal('Failed to write ', (file.dest+'.map').red);
					}
				}
				filesDone++;
				
				if (filesDone === filesCount) {
					done();
				}
			});
		});
	});
};
