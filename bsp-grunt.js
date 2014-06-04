module.exports = function(grunt, config) {
  var BOWER = require('bower');
  var EXTEND = require('extend');
  var _ = require('lodash');
  var PATH = require('path');

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
        minDir: '<%= bsp.maven.destDir %>/<%= bsp.styles.dir %>'
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
            cwd: '<%= bsp.maven.destDir %>/<%= bsp.scripts.dir %>',
            dest: '<%= bsp.maven.destDir %>/<%= bsp.styles.dir %>',
            expand: true,
            src: [
                '**',
                '!**/*.js'
            ]
          }
        ]
      },

      less: {
        files: {
          '<%= bsp.scripts.devDir %>/less.js':
              'node_modules/grunt-contrib-less/node_modules/less/' +
              grunt.file.readJSON('node_modules/grunt-contrib-less/node_modules/less/bower.json')['main']
        }
      }
    },

    less: {
      compile: {
        files: [
          {
            cwd: '<%= bsp.styles.srcDir %>',
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
            src: '**/*'
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
            dest: '<%= bsp.scripts.devDir %>/autoprefixer.js',
            src: 'node_modules/grunt-autoprefixer/node_modules/autoprefixer/lib/autoprefixer.js'
          }
        ],
        options: {
          bundleOptions: {
            standalone: 'autoprefixer'
          }
        }
      }
    }
  }, (config || { })));

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-bower-install-simple');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.task.registerTask('bsp-config-dest', 'Configure build destination.', function() {
    if (!grunt.config('bsp.maven.destDir')) {
      var buildName = grunt.option('bsp-maven-build-finalName');
      var buildFile = grunt.config('bsp.maven.targetDir') + '/grunt-dest';

      if (buildName) {
        grunt.file.write(buildFile, buildName);

      } else {
        buildName = grunt.file.read(buildFile);
      }

      grunt.config('bsp.maven.destDir', '<%= bsp.maven.targetDir %>/' + buildName);
    }

    grunt.log.writeln('Build destination: ' + grunt.config('bsp.maven.destDir'));
  });

  grunt.task.registerTask('bsp-config-requirejs', 'Configure RequireJS.', function() {
    if (!grunt.config('requirejs.dynamic.options.mainConfigFile')) {
      var config = grunt.config('bsp.scripts.rjsConfig');

      if (!config) {
        var firstModule = (grunt.config('requirejs.dynamic.options.modules') || [ ])[0];

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
          grunt.log.writeln("Pruned extraneous Bower packages.");
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
        var bowerDirectory = BOWER.config.directory;
        var bowerFiles = grunt.config('copy.bower.files') || [ ];

        _.each(pathsByName, function(paths, name) {
          var logs = [ ];
          var cwd = PATH.join(bowerDirectory, name);
          var files = (grunt.config('bsp.bower') || { })[name];

          if (files) {
            _.each(_.isArray(files) ? files : [ files ], function(file) {
              if (_.isPlainObject(file)) {
                file.dest = '<%= bsp.scripts.devDir %>' + (file.dest ? '/' + file.dest : '');

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

          grunt.log.writeln("Configured " + name + ": " + logs.join(", "));
        });

        grunt.config('copy.bower.files', bowerFiles);
        done();
      }).

      on('error', function(error) {
        grunt.fail.warn(error);
      });
  });

  grunt.registerTask('default', [
    'bsp-config-dest',
    'bsp-config-requirejs',
    'less:compile',
    'autoprefixer:process',
    'bower-prune',
    'bower-install-simple',
    'bower-configure-copy',
    'copy:requirejs',
    'copy:bower',
    'copy:scripts',
    'requirejs:dynamic',
    'copy:less',
    'browserify:autoprefixer',
    'copy:styles'
  ]);
};
