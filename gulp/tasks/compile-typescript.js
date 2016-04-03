var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var tsify = require('tsify');
var glob = require('glob');

gulp.task('compile-typescript', function () {
    var bundler = browserify({
        basedir: TYPESCRIPT,
        debug: true,
        paths: [
            "vendor/blocks/dist"
        ]
    });

    // Load all the definitions
    var definitions = glob.sync(TYPESCRIPT + "/definitions/**/*.d.ts");
    definitions.forEach(function (file) {
        file = file.replace(new RegExp("^" + TYPESCRIPT + "/"), '');
        bundler.add(file);
    });

    // Load the main script
    bundler.add('main.ts');

    bundler.plugin(tsify, {noImplicitAny: true});

    return bundler.bundle()
        .on('error', function (err) {
            console.log(err.toString());
            this.emit("end");
        })
        .pipe(source("script.js"))
        .pipe(gulp.dest(PUBLIC));
});