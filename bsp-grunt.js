module.exports = function(grunt, config) {
    var BOWER = require('bower');
    var EXTEND = require('extend');
    var _ = require('lodash');
    var PATH = require('path');

    grunt.initConfig(EXTEND(true, { }, {
        bsp: {
            maven: {
                srcDir: 'src/main/webapp',
                targetDir: 'target',
                destDir: '<%= bsp.maven.targetDir %>/' + grunt.option('bsp-maven-build-finalName')
            },

            bower: {
            },

            styles: {
                dir: '',
                less: [ ],
                ext: '.min.css',
                srcDir: '<%= bsp.maven.srcDir %>/<%= bsp.styles.dir %>',
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
                        src: '**/*.css'
                    }
                ]
            }
        },

        less: {
            compile: {
                files: [
                    {
                        cwd: '<%= bsp.styles.srcDir %>',
                        dest: '<%= bsp.styles.minDir %>',
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

        requirejs: {
            dynamic: {
                options: {
                    baseUrl: '<%= bsp.scripts.devDir %>',
                    dir: '<%= bsp.scripts.minDir %>',
                    mainConfigFile: grunt.option('bsp.scripts.rjsConfig') ? '<%= bsp.scripts.srcDir %>/<%= bsp.scripts.rjsConfig %>' : null,
                    modules: '<%= bsp.scripts.rjsModules %>',
                    optimize: 'uglify2'
                }
            }
        }
    }, (config || { })));

    grunt.loadNpmTasks('grunt-bower-install-simple');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

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
                            var prefix = file.type === 'styles' ? '<%= bsp.styles.minDir %>' : '<%= bsp.scripts.devDir %>';

                            if (_.isPlainObject(file)) {
                                file.dest = prefix + (file.dest ? '/' + file.dest : '');

                            } else {
                                file = {
                                    dest: prefix,
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
        'less:compile',
        'bower-prune',
        'bower-install-simple',
        'bower-configure-copy',
        'copy:requirejs',
        'copy:bower',
        'copy:scripts',
        'requirejs:dynamic',
        'copy:styles'
    ]);
};
