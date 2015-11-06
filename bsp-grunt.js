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
        pom: process.cwd() + '/pom.xml',
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
        minDir: '<%= bsp.scripts.devDir %>'
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

      compiledJSForWatcher: {
        files: [
          {
            cwd: '<%= bsp.scripts.minDir %>',
            dest: '<%= bsp.scripts.srcDir %>',
            expand: true,
            src: '**/*.min.js'
          },
          {
            cwd: '<%= bsp.scripts.minDir %>',
            dest: '<%= bsp.scripts.srcDir %>',
            expand: true,
            src: '**/*.min.js.map'
          }
        ]
      },

      less: {
        files: {
          '<%= bsp.scripts.devDir %>/less.js':
              __dirname + '/node_modules/grunt-contrib-less/node_modules/less/' +
              grunt.file.readJSON(__dirname + '/node_modules/grunt-contrib-less/node_modules/less/bower.json').main
        }
      }
    },

    clean: {
      sourceCSS: [
        '<%= bsp.styles.srcDir %>' + '**/*<%= bsp.styles.ext %>'
      ],
      sourceJS: [
        '<%= bsp.scripts.srcDir %>' + '**/*.min.js',
        '<%= bsp.scripts.srcDir %>' + '**/*.min.js.map'
      ]
    },

    jsonlint: {
      all: {
        src: [ 'styleguide/**/*.json' ]
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

    postcss: {
          options: {
              map: true,
              processors: [
                  require('autoprefixer')()
              ]
          },
          autoprefixer: {
              src: '<%= bsp.styles.compiledLessDir %>/**/*.css'
          }
      },

    watch: {

      less: {
        files: ['<%= bsp.styles.srcDir %>' + '/**/*.less'],
        tasks: ['bsp-config-dest', 'copy:styles', 'less:compile', 'bsp-autoprefixer', 'copy:compiledCSSForWatcher']
      },

      js: {
        files: [
          '<%= bsp.scripts.srcDir %>' + '/**/*.js',
          '!<%= bsp.scripts.srcDir %>' + '/**/*.min.js',
          '!<%= bsp.scripts.srcDir %>' + '/**/*.min.js.map'
        ],
        tasks: ['bsp-config-dest', 'copy:scripts', 'systemjs', 'copy:compiledJSForWatcher']
      },

      json: {
        files : [
            'styleguide/**/*.json'
        ],
        tasks: ['jsonlint']
      }
    },

    systemjs: {
      dist: {
        options: {
          configFile: '<%= bsp.systemjs.configFile %>',
          configOverrides: '<%= bsp.systemjs.configOverrides %>'
        },
        files: [
          { '<%= bsp.systemjs.destFile %>': '<%= bsp.systemjs.srcFile %>' }
        ]
      }
    },

    'brightspot-base': {
      options: {
        enable: '<%= bsp.brightspotBase.enable %>'
      }
    }

  }, (config || { })));

  grunt.file.expand(__dirname + '/node_modules/grunt-*/tasks').forEach(grunt.loadTasks);
  grunt.loadTasks(__dirname + '/tasks');

  grunt.task.registerTask('bsp-autoprefixer', 'Configure build destination.', function() {

    if (grunt.config('bsp.styles.autoprefixer')) {
        grunt.log.writeln('Running autoprefixer');
        grunt.task.run(['postcss:autoprefixer']);
    } else {
       grunt.log.writeln('No bsp.styles.autoprefixer so skipping it...');
    }

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
        var defaultFiles = { };

        Object.keys(pathsByName).forEach(function (name) {
          var files = grunt.file.readJSON(PATH.join(bowerDirectory, name, 'bower.json'))['brightspot-grunt-files'];

          if (files) {
            EXTEND(defaultFiles, files);
          }
        });

        var bowerFiles = grunt.config('copy.bower.files') || [ ];

        _.each(pathsByName, function(paths, name) {
          var logs = [ ];
          var cwd = PATH.join(bowerDirectory, name);
          var files = (grunt.config('bsp.bower') || { })[name] || defaultFiles[name];

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
              } else {
                // we are in this conditional if the main entry has a * selector
                logs.push(path);

                bowerFiles.push({
                  dest: '<%= bsp.scripts.devDir %>',
                  src: path,
                  expand: true,
                    flatten: true
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

  grunt.task.registerTask('brightspot-base', 'Copies brightspot base files to build directory', function() {
    if (this.options().enable) {
      grunt.task.run(['copy:brightspotBase']);

      // here we setup so bower copy tasks so that the gruntfile for a brightspot base project can be clean
      // these get copied into the target, and base uses them, so we include them in here every time
      // if someone chooses to not use font awesome or bsp-carousel, it's ok, as they will only live in the
      // target folder and not be used rather than junking up the project repo
      //
      // on the other hand, if you're not using bootstrap, it means you are rewriting a LOT of CSS, so you
      // should instead just fork brightspot-base rather than trying to use this boilerplate
      if(!grunt.config.get('bsp.bower.fontawesome')) {
        grunt.config.set('bsp.bower.fontawesome', [
            {
                src: 'less/*',
                dest: '../styles/bower/fontawesome',
                expand: true,
                flatten: true
            },
            {
                src: 'fonts/*',
                dest: '../fonts',
                expand: true,
                flatten: true
            }
        ]);
      }

    } else {
      grunt.log.writeln('brightspot-base disabled, skipping');
    }
  });

  grunt.registerTask('bsp', [
    'bsp-config-dest', // configure the destination that maven creates
    'clean:sourceCSS', // clean up the source directories of any compiled CSS that were copied there by a watcher
    'bower-prune',
    'bower-install-simple:all',
    'brightspot-base',
    'bower-configure-copy',
    'copy:bower',
    'create-binaries',
    'copy:styles',
    'less:compile',
    'bsp-autoprefixer',
    'copy:scripts',
    'systemjs',
    'copy:less', // this copies less.js to allow for client side compilation
    'copy:compiledCSS' // copies the compiled CSS to the target dir
  ]);

  grunt.registerTask('default', [
    'bsp'
  ]);

};
