'use strict';
var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    lab = require('gulp-lab'),
    exec = require('child_process').exec;

gulp.task('developServer', function () {
    nodemon({
        script: 'src/index.js',
        ext: 'js',
        ignore: ['node_modules/'],
        nodeArgs: ['--debug=8090']
    });
});

gulp.task('test', function () {
    return gulp.src('tests')
        .pipe(lab('--colors --coverage'));
});

gulp.task('default', ['developServer']);
