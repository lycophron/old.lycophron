/*globals require */
/**
 * @author https://github.com/lattmann
 */

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    shell = require('gulp-shell'),
    runSequence = require('run-sequence'),
    sourcePattern = ['public/scripts/*.js', 'lib/**/*.js', 'locale/**/*.js'],
    allPatterns = sourcePattern.concat([
        'public/scripts/*.jsx',
        'public/libs/*.jsx',
        'public/styles/**/*',
        'public/**/*.html',
        'public/auth/**/*',
        'locale/**/*.js',
        'locale/**/*.tar.gz'
    ]),
    browserify = require('gulp-browserify'),
    react = require('gulp-react');

gulp.task('update-dictionaries', shell.task(['node lib/update_dictionaries.js']));


gulp.task('jsx', function () {
    'use strict';

    return gulp.src('./public/scripts/main.jsx')
        .pipe(react({harmony: true}))
        .pipe(gulp.dest('./public/scripts/'));
});

// Basic usage
gulp.task('browserify', ['update-dictionaries', 'jsx'], function () {
    'use strict';

    // copy over all required files
    gulp.src(['public/auth/**/*']).pipe(gulp.dest('build/auth'));
    gulp.src(['public/libs/**/*']).pipe(gulp.dest('build/libs'));
    gulp.src(['public/styles/**/*']).pipe(gulp.dest('build/styles'));
    gulp.src(['public/*.html']).pipe(gulp.dest('build'));
    gulp.src(['locale/**/*.js*']).pipe(gulp.dest('build/locale'));

    // Single entry point to browserify
    gulp.src('public/scripts/app.js')
        .pipe(browserify({
            insertGlobals : true,
            debug : true
        }))
        .pipe(gulp.dest('build/scripts'));

    gulp.src('public/auth/**/*.js')
        .pipe(browserify({
            insertGlobals : true,
            debug : true
        }))
        .pipe(gulp.dest('build/auth/'));
});

gulp.task('lint', function () {
    'use strict';

    gulp.src(sourcePattern)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

function changeNotification(event) {
    'use strict';

    console.log('File', event.path, 'was', event.type, ', running tasks...');
}

function build(cb) {
    'use strict';

    var jsWatcher = gulp.watch(sourcePattern, [/*'js',*/ 'lint']);

    jsWatcher.on('change', changeNotification);

    return cb;
}

gulp.task('jsx-build', function () {
    'use strict';

    return gulp.src('./public/scripts/main.jsx')
        .pipe(react({harmony: true}))
        .pipe(gulp.dest('./public/scripts/'));
});

gulp.task('register-watchers', [], function (cb) {
    'use strict';

    gulp.watch(allPatterns, ['browserify', 'lint']);

    return cb;
});

gulp.task('dev', function (cb) {
    'use strict';

    runSequence('browserify', 'register-watchers', cb);
});

gulp.task('test_cover', shell.task(['npm run test_cover']));
gulp.task('test_watch', ['test_cover'], function (cb) {
    'use strict';

    gulp.watch(allPatterns.concat('test/**/*.js'), ['test_cover']);

    return cb;
});

gulp.task('compile-all', ['browserify'], function () {
    'use strict';

});

gulp.task('default', [/*'js',*/ 'lint'], build);