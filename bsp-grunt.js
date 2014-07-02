module.exports = function(grunt, config) {
  var BOWER = require('bower'),
      EXTEND = require('extend'),
      _ = require('lodash'),
      PATH = require('path');

  grunt.initConfig(EXTEND(true, { }, {
    bsp: {
      maven: {
        srcDir: 'src/main/webapp',
        targetDir: 'target'
      },

      bower: {
      },

      styles: {
        dir: '',
        less: [ ],
        ext: '.min.css',
        srcDir: '<%= bsp.maven.srcDir %>/<%= bsp.styles.dir %>',
        compiledLessDir: '<%= bsp.maven.targetDir %>/grunt-compiledLess',
        minDir: '<%= bsp.maven.destDir %>/<%= bsp.styles.dir %>',
        autoprefixer: true
      },

      scripts: {
        dir: '',
        srcDir: '<%= bsp.maven.srcDir %>/<%= bsp.scripts.dir %>',
        devDir: '<%= bsp.maven.destDir %>/<%= bsp.scripts.dir %>',
        minDir: '<%= bsp.scripts.devDir %>.min'
      }
    },

    copy: {
      requirejs: {
        files: {
          '<%= bsp.scripts.devDir %>/require.js': 'node_modules/requirejs/require.js'
        }
      },

      bower: {
        files: [ ]
      },

      scripts: {
        files: [
          {
            cwd: '<%= bsp.scripts.srcDir %>',
            dest: '<%= bsp.scripts.devDir %>',
            expand: true,
            src: '**'
          }
        ]
      },

      styles: {
        files: [
          {
            cwd: '<%= bsp.styles.srcDir %>',
            dest: '<%= bsp.styles.minDir %>',
            expand: true,
            src: [
                '**'
            ]
          }
        ]
      },

      less: {
        files: {
          '<%= bsp.scripts.devDir %>/less.js':
              'node_modules/grunt-contrib-less/node_modules/less/' +
              grunt.file.readJSON('node_modules/grunt-contrib-less/node_modules/less/bower.json').main
        }
      }
    },

    less: {
      compile: {
        files: [
          {
            cwd: '<%= bsp.styles.minDir %>',
            dest: '<%= bsp.styles.compiledLessDir %>',
            expand: true,
            ext: '<%= bsp.styles.ext %>',
            extDot: 'last',
            src: '<%= bsp.styles.less %>'
          }
        ],

        options: {
          cleancss: true,
          compress: true
        }
      }
    },

    autoprefixer: {
      process: {
        files: [
          {
            cwd: '<%= bsp.styles.compiledLessDir %>',
            dest: '<%= bsp.styles.minDir %>',
            expand: true,
            src: '**/*<%= bsp.styles.ext %>'
          }
        ]
      }
    },

    requirejs: {
      dynamic: {
        options: {
          baseUrl: '<%= bsp.scripts.devDir %>',
          dir: '<%= bsp.scripts.minDir %>',
          modules: '<%= bsp.scripts.rjsModules %>',
          optimize: 'uglify2'
        }
      }
    },

    browserify: {
      autoprefixer: {
        files: [
          {
            dest: '<%= bsp.scripts.devDir %>/less-dev.js',
            src: 'node_modules/grunt-autoprefixer/node_modules/autoprefixer/lib/autoprefixer.js'
          }
        ],

        options: {
          bundleOptions: {
            standalone: 'autoprefixer'
          },

          postBundleCB: function(err, src, next) {
            src += 'window.less = window.less || { };';
            src += 'window.less.env = "development";';
            src += 'window.less.postProcessor = function(css) { return autoprefixer(';
            src += _.map(grunt.config('autoprefixer.process.options.browsers') || [ ], function(browser) { return '"' + browser + '"'; }).join(', ');
            src += ').process(css).css; };';
            next(err, src);
          }
        }
      }
    }
  }, (config || { })));

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-bower-install-simple');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.task.registerTask('bsp-config-dest', 'Configure build destination.', function() {
    if (!grunt.config('bsp.maven.destDir')) {
      var buildName = grunt.option('bsp-maven-build-finalName'),
          buildFile = grunt.config('bsp.maven.targetDir') + '/grunt-dest';

      if (buildName) {
        grunt.file.write(buildFile, buildName);

      } else {
        buildName = grunt.file.read(buildFile);
      }

      grunt.config('bsp.maven.destDir', '<%= bsp.maven.targetDir %>/' + buildName);
    }

    grunt.log.writeln('Build destination: ' + grunt.config('bsp.maven.destDir'));
  });

  grunt.task.registerTask('bsp-config-jshint', 'Configure jshint.', function() {

    var jshintrc = grunt.config('bsp.scripts.jshintrc');

    if (typeof(jshintrc) !==  'undefined') {
      grunt.config('jshint.all', ['Gruntfile.js', '<%= bsp.scripts.srcDir %>/**/*.js']);
      grunt.config('jshint.options.jshintrc', jshintrc);

      grunt.log.writeln('jshint: using ' + grunt.config('jshint.options.jshintrc'));
    } else {
      grunt.log.writeln('jshint: no .jshintrc specified, no jshint performed');
      grunt.config('jshint.all', {});
    }

  });

  grunt.task.registerTask('bsp-config-requirejs', 'Configure RequireJS.', function() {
    if (!grunt.config('requirejs.dynamic.options.mainConfigFile')) {
      var config = grunt.config('bsp.scripts.rjsConfig'),
          firstModule;

      if (!config) {
        firstModule = (grunt.config('requirejs.dynamic.options.modules') || [ ])[0];

        if (firstModule) {
          config = firstModule.name + '.js';
        }
      }

      if (config) {
        grunt.config('requirejs.dynamic.options.mainConfigFile', '<%= bsp.scripts.srcDir %>/' + config);
      }
    }

    grunt.log.writeln('RequireJS main config: ' + grunt.config('requirejs.dynamic.options.mainConfigFile'));
  });

  grunt.task.registerTask('bower-prune', 'Prune extraneous Bower packages.', function() {
    var done = this.async();

    BOWER.commands.prune().

      on('end', function() {
          grunt.log.writeln('Pruned extraneous Bower packages.');
          done();
      }).

      on('error', function(error) {
          grunt.fail.warn(error);
      });
  });

  grunt.task.registerTask('bower-configure-copy', 'Configure Bower package files to be copied.', function() {
    var done = this.async();

    BOWER.commands.list({ paths: true }).
      on('end', function(pathsByName) {
        var bowerDirectory = BOWER.config.directory,
            bowerFiles = grunt.config('copy.bower.files') || [ ];

        _.each(pathsByName, function(paths, name) {
          var logs = [ ],
              cwd = PATH.join(bowerDirectory, name),
              files = (grunt.config('bsp.bower') || { })[name];

          if (files) {
            _.each(_.isArray(files) ? files : [ files ], function(file) {

              if (_.isPlainObject(file)) {
                file.dest = '<%= bsp.maven.destDir %>' + (file.dest ? '/' + file.dest : '');
              } else {
                file = {
                  dest: '<%= bsp.scripts.devDir %>',
                  expand: true,
                  flatten: true,
                  src: file
                };
              }

              if (file.expand) {
                file.cwd = cwd + (file.cwd ? '/' + file.cwd : '');
              } else {
                file.src = _.map(_.isArray(file.src) ? file.src : [ file.src ], function(src) {
                    return cwd + (file.cwd ? '/' + file.cwd : '') + '/' + src;
                });
              }

              logs.push(JSON.stringify(file.src));
              bowerFiles.push(file);
            });

          } else if (paths) {
            _.each(_.isArray(paths) ? paths : [ paths ], function(path) {
              if (grunt.file.isFile(PATH.resolve(path))) {
                var basename = PATH.basename(path);

                logs.push(basename);

                bowerFiles.push({
                  dest: '<%= bsp.scripts.devDir %>/' + basename,
                  src: path
                });
              }
            });
          }

          grunt.log.writeln('Configured ' + name + ': ' + logs.join(', '));
        });

        grunt.config('copy.bower.files', bowerFiles);
        done();
      }).

      on('error', function(error) {
        grunt.fail.warn(error);
      });
  });

  if (grunt.config('bsp.styles.autoprefixer')) {
    grunt.registerTask('less-compile', ['less:compile', 'autoprefixer:process', 'browserify:autoprefixer']);
  }
  else {
    grunt.registerTask('less-compile', ['less:compile']);
  }

  grunt.registerTask('bsp', [
    /* configure tasks to figure out correct directories */
    'bsp-config-dest',
    'bsp-config-requirejs',
    /* bower tasks to get packages and setup paths */
    'bower-prune',
    'bower-install-simple',
    'bower-configure-copy',
    /* copy everything down into target, where we will do the build work */
    'copy:requirejs',
    'copy:bower',
    'copy:scripts',
    'copy:less',
    'copy:styles',
    /* creates compiled JS out of the main require file, gets everything into a .min folder by default */
    'requirejs:dynamic',
    /* compiles less and creates the autoprefixer rules on the resulting css file if specified in the config */
    'less-compile'
  ]);

  grunt.registerTask('bsp-verify', [
    'bsp-config-jshint',
    'jshint'
  ]);

  grunt.registerTask('default', [
    'bsp-verify','bsp'
  ]);

};
