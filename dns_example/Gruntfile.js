'use strict';

module.exports = function (grunt) {

    // Load all Grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                'src/scripts/*.js',
                '!src/scripts/jquery.js'
            ]
        },
        jscs: {
            src: [
                'src/scripts/*.js',
                '!src/scripts/jquery.js'
            ],
            options: {
                config: '.jscsrc'
            }
        }
    });

    /**
     * grunt test - to run the test suite for js linters, broken links and  w3c validators
     */
    grunt.registerTask('test', [
        'jshint:all',
        'jscs'
    ]);
};