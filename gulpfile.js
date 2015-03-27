/*globals require */
/**
 * @author https://github.com/lattmann
 */

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    shell = require('gulp-shell'),
    runSequence = require('run-sequence'),
    browserify = require('gulp-browserify'),
    jsonminify = require('gulp-jsonminify'),
    rimraf = require('rimraf'),
    templateCache = require('gulp-angular-templatecache'),

    sourcePattern = ['public/app/**/*.js', '!public/app/**/templates.js', 'lib/**/*.js', 'locales/**/*.js'],
    websitePattern = sourcePattern.concat([
        'locales/**/translation.json',
        'public/app/**/*.css',
        'public/**/*.html',
        'public/auth/**/*'
    ]),
    allPatterns = websitePattern.concat([
        'locales/**/*.js',
        'locales/**/*.tar.gz'
    ]);


gulp.task('clean', function (cb) {
    'use strict';

    rimraf('build/', cb);
});

gulp.task('update-dictionaries', shell.task(['node lib/update_dictionaries.js']));

// angular templates
gulp.task('templates', function () {
    'use strict';

    return gulp.src('public/app/**/*.html')
        .pipe(templateCache())
        .pipe(gulp.dest('public/app/'));
});

gulp.task('browserify-website', ['templates'], function () {
    'use strict';

    // copy over all required files
    gulp.src(['locales/**/*.js*']).pipe(gulp.dest('build/locales'));
    gulp.src(['public/auth/**/*']).pipe(gulp.dest('build/auth'));
    gulp.src(['public/app/**/*.css']).pipe(gulp.dest('build/app'));
    gulp.src(['public/libs/**/*']).pipe(gulp.dest('build/libs'));
    gulp.src(['public/*.html']).pipe(gulp.dest('build'));

    // Single entry point to browserify
    gulp.src('public/auth/**/*.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: true
        }))
        .pipe(gulp.dest('build/auth/'));

    // angular app
    gulp.src('public/app/app.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: true
        }))
        .pipe(gulp.dest('build/app/'));

});

gulp.task('browserify-dicts', function (cb) {
    'use strict';
    var translations = {
            'en': ['en-US', 'en-GB'],
            'hu': ['hu-HU']
        },
        key,
        i;

    gulp.src(['locales/**/*.js'])
        .pipe(gulp.dest('build/locales'));

    gulp.src(['locales/**/*.json'])
        .pipe(gulp.dest('build/locales'));

    // TODO: copy translation.json files
    for (key in translations) {
        if (translations.hasOwnProperty(key)) {
            for (i = 0; i < translations[key].length; i += 1) {
                gulp.src(['locales/' + key + '/translation.json'])
                    .pipe(gulp.dest('build/locales/' + translations[key][i] + '/'));
            }
        }
    }

    runSequence('update-dictionaries', cb);
});

gulp.task('browserify', function (cb) {
    'use strict';

    runSequence('browserify-dicts', 'browserify-website', cb);
});

gulp.task('lint', function () {
    'use strict';

    return gulp.src(sourcePattern)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});


gulp.task('register-watchers-website', [], function (cb) {
    'use strict';

    gulp.watch(websitePattern, ['browserify-website', 'lint']);

    return cb;
});

gulp.task('dev-website', function (cb) {
    'use strict';

    runSequence('clean', 'browserify-website', 'register-watchers-website', cb);
});

gulp.task('register-watchers', [], function (cb) {
    'use strict';

    gulp.watch(allPatterns, ['browserify', 'lint']);

    return cb;
});

gulp.task('dev', function (cb) {
    'use strict';

    runSequence('clean', 'browserify', 'register-watchers', cb);
});

gulp.task('test_cover', shell.task(['npm run test_cover']));
gulp.task('test_watch', ['test_cover'], function (cb) {
    'use strict';

    gulp.watch(allPatterns.concat('test/**/*.js'), ['test_cover']);

    return cb;
});

gulp.task('compile-all', function (cb) {
    'use strict';

    runSequence('clean', 'browserify', cb);
});

gulp.task('default', ['compile-all', 'lint'], function () {
    'use strict';
});