module.exports = function(grunt, config) {
    grunt.initConfig(require('extend')(true, { }, {
        bsp: {
            maven: {
                srcDir: 'src/main/webapp',
                targetDir: 'target',
                destDir: '<%= bsp.maven.targetDir %>/' + grunt.option('bsp-maven-build-finalName')
            },

            bower: {
                buildDir: '<%= bsp.maven.targetDir %>/bsp-grunt-bower'
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

        bower: {
            install: {
                options: {
                    cleanBowerDir: true,
                    targetDir: '<%= bsp.bower.buildDir %>'
                }
            }
        },

        copy: {
            almond: {
                files: {
                    '<%= bsp.scripts.devDir %>/almond.js': 'node_modules/almond/almond.js'
                }
            },

            requirejs: {
                files: {
                    '<%= bsp.scripts.devDir %>/require.js': 'node_modules/requirejs/require.js'
                }
            },

            bower: {
                files: [
                    {
                        cwd: '<%= bower.install.options.targetDir %>',
                        dest: '<%= bsp.scripts.devDir %>',
                        expand: true,
                        filter: 'isFile',
                        flatten: true,
                        src: '**'
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
            'static': {
                options: {
                    baseUrl: '<%= bsp.scripts.devDir %>',
                    include: 'almond',
                    name: '<%= bsp.scripts.rjsMain %>',
                    optimize: 'uglify2',
                    out: '<%= bsp.scripts.minDir %>/<%= bsp.scripts.rjsMain %>.js'
                }
            },

            dynamic: {
                options: {
                    baseUrl: '<%= bsp.scripts.devDir %>',
                    dir: '<%= bsp.scripts.minDir %>',
                    modules: '<%= bsp.scripts.rjsModules %>',
                    optimize: 'uglify2'
                }
            }
        }
    }, (config || { })));

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    var hasRjsMain = !!grunt.config('bsp.scripts.rjsMain');

    grunt.registerTask('default', [
        'less:compile',
        'bower:install',
        'copy:' + (hasRjsMain ? 'almond' : 'requirejs'),
        'copy:bower',
        'copy:scripts',
        'requirejs:' + (hasRjsMain ? 'static' : 'dynamic'),
        'copy:styles'
    ]);
};
