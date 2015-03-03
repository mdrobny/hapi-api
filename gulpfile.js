'use strict';
var gulp = require('gulp'),
    nodemon = require('gulp-nodemon');

gulp.task('developServer', function () {
    nodemon({
        script: 'index.js',
        ext: 'js',
        ignore: ['node_modules/'],
        nodeArgs: ['--debug=8090']
    });
});

gulp.task('default', ['developServer']);