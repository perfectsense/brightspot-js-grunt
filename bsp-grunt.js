// Load environment specific variables (fails silently)
require('dotenv').config({silent: true});

module.exports = function(grunt, config) {
    var EXTEND = require('extend');
    var Builder = require('systemjs-builder');
    var builder = new Builder();

    grunt.initConfig(EXTEND(true, { }, {
        bsp: {

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

            less: {
                files: {
                    '<%= bsp.scripts.devDir %>/less.js':
                            __dirname + '/node_modules/grunt-contrib-less/node_modules/less/' +
                            grunt.file.readJSON(__dirname + '/node_modules/grunt-contrib-less/node_modules/less/bower.json').main
                }
            }
        },

        clean: {
            destCSS: [
                '<%= bsp.styles.minDir %>'
            ],
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
                            map: grunt.config('bsp.styles.options.map'),
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
                files: ['<%= bsp.styles.srcDir %>' + '/**/*.less', '<%= bsp.styles.srcDir %>' + '/**/*.vars'],
                tasks: ['bsp-config-dest', 'copy:styles', 'less:compile', 'bsp-autoprefixer', 'copy:compiledCSS']
            },

            js: {
                files: [
                    '<%= bsp.scripts.srcDir %>' + '/**/*.js',
                    '!<%= bsp.scripts.srcDir %>' + '/**/*.min.js',
                    '!<%= bsp.scripts.srcDir %>' + '/**/*.min.js.map'
                ],
                tasks: ['bsp-config-dest', 'copy:scripts', 'systemjs']
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
        }

    }, (config || { })));

    grunt.file.expand(__dirname + '/node_modules/grunt-*/tasks').forEach(grunt.loadTasks);

    grunt.loadTasks(__dirname + '/tasks');

    grunt.registerTask('bsp', [
        'bsp-config-dest', // configure the destination that maven creates
        'clean:destCSS', // clean the entire dest dir (in case any files have been renamed or deleted)
        'clean:sourceCSS', // clean up the source directories of any compiled CSS that were copied there by a watcher
        'bower-prune',
        'bower-install-simple:all',
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
