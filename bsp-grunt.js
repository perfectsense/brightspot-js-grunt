module.exports = function(grunt, config) {
  var BOWER = require('bower');
  var EXTEND = require('extend');
  var _ = require('lodash');
  var PATH = require('path');
  var Builder = require('systemjs-builder');
  var builder = new Builder();

  grunt.initConfig(EXTEND(true, { }, {
    bsp: {
      brightspotBase: {
        srcDir: 'bower_components/brightspot-base/src/main/webapp',
        assetsDir: '<%= bsp.brightspotBase.srcDir %>/assets',
        templatesDir: '<%= bsp.brightspotBase.srcDir %>/render',
        enable: false
      },

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
      },

      systemjs: {
        configOverrides: {},
        srcFile: '<%= bsp.scripts.devDir %>/main.js',
        destFile: '<%= bsp.scripts.minDir %>/main.min.js',
        configFile: '<%= bsp.scripts.devDir %>/config.js'
      }
    },

    'bower-install-simple': {
      all: {
      }
    },

    copy: {

      bower: {
        files: [ ]
      },

      brightspotBase: {
        files: [
          {
            cwd: '<%= bsp.brightspotBase.assetsDir %>',
            dest: '<%= bsp.maven.destDir %>/assets',
            expand: true,
            src: '**/*'
          },
          {
            cwd: '<%= bsp.brightspotBase.templatesDir %>',
            dest: '<%= bsp.maven.destDir %>/render',
            expand: true,
            src: '**/*'
          }
        ]
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
          },

          {
            cwd: '<%= bsp.styles.srcDir %>',
            dest: '<%= bsp.styles.minDir %>',
            expand: true,
            src: '**'
          }
        ]
      },

      compiledCSS: {
        files: [
          {
            cwd: '<%= bsp.styles.compiledLessDir %>',
            dest: '<%= bsp.styles.minDir %>',
            expand: true,
            src: '**/*<%= bsp.styles.ext %>'
          }
        ]
      },

      compiledCSSForWatcher: {
        files: [
          {
            cwd: '<%= bsp.styles.compiledLessDir %>',
            dest: '<%= bsp.styles.srcDir %>',
            expand: true,
            src: '**/*<%= bsp.styles.ext %>'
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

    clean: {
      sourceCSS: [
        '<%= bsp.styles.srcDir %>' + '**/*<%= bsp.styles.ext %>'
      ]
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

    watch: {
      less: {
        files: '<%= bsp.styles.srcDir %>' + '/**/*.less',
        tasks: ['bsp-config-dest', 'copy:styles', 'less:compile', 'copy:compiledCSSForWatcher']
      }
    },

    systemjs: {
      dist: {
        options: {
          configFile: '<%= bsp.systemjs.configFile %>',
          configOverrides: grunt.config('bsp.systemjs.configOverrides')
        },
        files: [
          { '<%= bsp.systemjs.destFile %>': '<%= bsp.systemjs.srcFile %>' }
        ]
      }
    },

    'brightspot-base-copy': {
      options: {
        enable: '<%= bsp.brightspotBase.enable %>'
      }
    }

  }, (config || { })));

  grunt.loadNpmTasks('grunt-bower-install-simple');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadTasks(__dirname + '/tasks');
  grunt.loadNpmTasks('grunt-contrib-watch');

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

  grunt.task.registerTask('brightspot-base-copy', 'Copies brightspot base files to build directory', function() {
    if (this.options().enable) {
      grunt.task.run(['copy:brightspotBase']);
    } else {
      grunt.log.writeln('brightspot-base-copy disabled, skipping');
    }
  });

  grunt.registerTask('bsp', [
    'bsp-config-dest', // configure the destination that maven creates
    'clean:sourceCSS', // clean up the source directories of any compiled CSS that were copied there by a watcher
    'bower-prune',
    'bower-install-simple:all',
    'bower-configure-copy',
    'copy:bower',
    'brightspot-base-copy',
    'copy:styles',
    'less:compile',
    'copy:scripts',
    'systemjs',
    'copy:less', // this copies less.js to allow for client side compilation
    'copy:compiledCSS' // copies the compiled CSS to the target dir, this was the task performed by the autoprefixed before we removed it
  ]);

  grunt.registerTask('default', [
    'bsp'
  ]);

};
