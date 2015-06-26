module.exports = function(grunt) {
	grunt.registerMultiTask('systemjs', 'Compiles systemjs apps', function() {
		var config = {
			minify: true,
			sourceMaps: true
		};
		var filesCount = 0;
		var filesDone = 0;
		var done = this.async();
		var options = this.options();
		var buildDeps = [
			{ src: 'node_modules/babel-core/browser.js', dest: 'babel.js' },
			{ src: 'node_modules/bsp-grunt/lib/systemjs-build.js', dest: 'systemjs-build.js' },
			{ src: 'node_modules/systemjs/dist/system.js', dest: 'system.js' }
		];
		if (!options.configFile || !grunt.file.exists(options.configFile)) {
			grunt.fail.fatal('SystemJS tasks needs a vaild configFile option');
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
				path.basename(file.src[0]),
				path.resolve(file.dest),
				path.basename(options.configFile),
				config.minify,
				config.sourceMaps
			];
			var child;
			var fileBaseDir = path.resolve( path.dirname(file.src[0]) );
			var troubleShootCmd = '';
			
			/** script must be run from app root because of bug in systemjs-builder */
			buildDeps.forEach(function(dep) {
				grunt.file.copy(dep.src, fileBaseDir + '/' + dep.dest);
			});

			troubleShootCmd = 'node ' + args.join(' ');

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