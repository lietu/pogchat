var gulp = require('gulp');
var watch = require('gulp-watch');

gulp.task('watch', function () {
    gulp.watch(TYPESCRIPT_GLOB, {verbose: true}, ['compile-typescript']);
    gulp.watch(HTMLJS_GLOBS, {verbose: true}, ['html-js']);
    gulp.watch(STYLES_GLOB, {verbose: true}, ['styles']);
});
