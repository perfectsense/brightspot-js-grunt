module.exports = function(grunt) {
    grunt.task.registerTask('bsp-autoprefixer', 'Configure build destination.', function() {

        if (grunt.config('bsp.styles.autoprefixer') || grunt.config('bsp.styles.options.autoprefixer'))  {
            grunt.log.writeln('Running autoprefixer');
            grunt.task.run(['postcss:autoprefixer']);
        } else {
            grunt.log.writeln('No bsp.styles.autoprefixer so skipping it...');
        }

    });
}
