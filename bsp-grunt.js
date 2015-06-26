module.exports = function(grunt, config) {
  var BOWER = require('bower');
  var EXTEND = require('extend');
  var _ = require('lodash');
  var PATH = require('path');
  var Builder = require('systemjs-builder');
  var builder = new Builder();

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
      },

      systemjs: {
        minify: true,
        sourceMaps: true
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

      systemjs: {
        files: [
          {
            src: __dirname + '/node_modules/babel-core/browser.min.js',
            dest: '<%= bsp.scripts.devDir %>/babel.js'
          },
          {
            src: __dirname + '/node_modules/systemjs/dist/system.js',
            dest: '<%= bsp.scripts.devDir %>/system.js'
          },
          {
            src: __dirname + '/lib/systemjs-build.js',
            dest: '<%= bsp.scripts.devDir %>/systemjs-build.js'
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
  grunt.loadNpmTasks('grunt-contrib-less');

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

  /** @todo convert this to use generic task in tasks folder */
  grunt.registerTask('systemjs-main', 'Compile the main systemjs app', function() {
    var done = this.async();
    var outPathRelative = grunt.config('bsp.scripts.minDir') + '/main.js';
    var outPath = PATH.resolve(outPathRelative);
    var child = grunt.util.spawn({
      cmd: 'node',
      args: [
        'systemjs-build.js',
        'main.js',
        PATH.resolve( grunt.config('bsp.scripts.minDir') ) + '/main.js',
        'config.js',
        grunt.config('bsp.systemjs.minify'),
        grunt.config('bsp.systemjs.sourceMaps')
      ],
      opts: {
        cwd: grunt.config('bsp.scripts.devDir')
      }
    }, function(err) {
      if (err) {
        grunt.log.writeln('System JS main build failed');
        grunt.fail.fatal(err);
      }
      if (!grunt.file.exists(outPath)) {
        grunt.fail.fatal('System JS main build failed to create ' + outPathRelative);
      }
      if (grunt.config('bsp.systemjs.sourceMaps')) {
        if ( grunt.file.exists(outPath + '.map') ) {
          grunt.log.writeln('File', (outPathRelative+'.map').cyan, 'created');
        } else {
          grunt.fail.fatal('System JS main build failed to create ', outPathRelative+'.map' );
        }
      }
      grunt.log.writeln('File', outPathRelative.cyan, 'created');
    });
  });

  grunt.registerTask('bsp', [
    'bsp-config-dest',
    'bower-prune',
    'bower-install-simple:all',
    'bower-configure-copy',
    'copy:bower',
    'copy:styles',
    'less:compile',
    'autoprefixer:process',
    'copy:scripts',
    'copy:systemjs',
    'systemjs-main',
    'copy:less',
    'browserify:autoprefixer'
  ]);

  grunt.registerTask('default', [
    'bsp'
  ]);
};
