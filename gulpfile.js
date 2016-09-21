var gulp = require('gulp');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');


gulp.task('default', function () {

    gulp.src('app/index.html')
        .pipe(useref({newLine:'yesIam'}))
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', minifyCSS()))
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
    gulp.src('dist/*')
        .pipe(clean());

    console.log('666');
});
