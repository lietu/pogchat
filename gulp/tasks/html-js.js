var gulp = require('gulp');

gulp.task('html-js', function () {
    return gulp.src(HTMLJS_GLOBS)
        .pipe(gulp.dest(PUBLIC));
});
