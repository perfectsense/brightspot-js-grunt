module.exports = function(grunt) {

    grunt.task.registerTask('bower-configure-copy', 'Configure Bower package files to be copied.', function() {
        var _ = require('lodash');
        var EXTEND = require('extend');
        var PATH = require('path');
        var BOWER = require('bower');
        var done = this.async();

        BOWER.commands.list({ paths: true }).
            on('end', function(pathsByName) {
                var bowerDirectory = BOWER.config.directory;
                var defaultFiles = { };

                // we can have a brightspot-copy-overrides entry in our main project.json and this will override any
                // bowered in overrides as well any default main entries
                var bowerProjectOverrides = grunt.file.readJSON('bower.json')['brightspot-copy-overrides'] || {};

                Object.keys(pathsByName).forEach(function (name) {
                    var files = grunt.file.readJSON(PATH.join(bowerDirectory, name, 'bower.json'))['brightspot-copy-overrides'];

                    if (files) {
                        EXTEND(defaultFiles, files);
                    }
                });

                var bowerFiles = grunt.config('copy.bower.files') || [ ];

                _.each(pathsByName, function(paths, name) {
                    var logs = [ ];
                    var cwd = PATH.join(bowerDirectory, name);
                    var files = (grunt.config('bsp.bower') || { })[name] || defaultFiles[name];
                    var bowerOverride = bowerProjectOverrides[name];

                    // if we have an override for this entry, use it, and get out
                    if(bowerOverride) {
                        bowerFiles.push(bowerOverride);

                        _.each(bowerOverride, function(entry){

                            entry.src = PATH.join(bowerDirectory, name) + '/' + entry.src;
                            entry.dest = '<%= bsp.scripts.devDir %>/' + entry.dest;

                            logs.push(JSON.stringify(entry.src));
                        });

                    } else {

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
}
