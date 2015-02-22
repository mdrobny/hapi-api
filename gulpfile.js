var gulp = require('gulp'),
    nodemon = require('gulp-nodemon');

gulp.task('developServer', function () {
    nodemon({
        script: 'index.js',
        ext: 'js',
        ignore: ['node_modules/']
    });
});

gulp.task('default', ['developServer']);