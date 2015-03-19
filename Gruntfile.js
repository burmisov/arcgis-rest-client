module.exports = function (grunt) {
    var jsSources = ['Gruntfile.js', 'index.js', 'lib/**/*.js', 'test/**/*.js', '!lib/arcgis.old.js'];

    grunt.initConfig({
        jshint: {
            all: {
                options: {
                    jshintrc: true
                },
                src: jsSources
            }
        },

        jasmine_node: {
            all: ['test/']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jasmine-node');

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['lint', 'jasmine_node']);

    grunt.registerTask('default', ['lint']);
};
