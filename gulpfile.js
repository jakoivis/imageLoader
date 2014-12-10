
var releaseName = 'imageLoader';

var unminifiedFileName = releaseName + '.js';
var minifiedFileName = releaseName + '.min.js';

var sourceFiles = './src/*.js';
var testFiles = './test/*.test.js';
var imageFiles = './test/assets/*.png';
var unminifiedFile = './build/' + unminifiedFileName;
var minifiedFile = './build/' + minifiedFileName;

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var jasmine = require('karma-jasmine');
var karma = require('gulp-karma');
var connect = require('gulp-connect');
var wrap = require('gulp-wrap');

gulp.task('jshint', function() {
	gulp.src(sourceFiles)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('scripts', function() {

    var wrapperFunction = ';(function(undefined) {\n"use strict";\n<%= contents %>})();';

    gulp.src([sourceFiles])
		.pipe(concat(minifiedFileName))
        .pipe(wrap(wrapperFunction))
		.pipe(stripDebug())
		.pipe(uglify())
		.pipe(gulp.dest('./build/'));

	gulp.src([sourceFiles])
		.pipe(concat(unminifiedFileName))
        .pipe(wrap(wrapperFunction))
		.pipe(stripDebug())
		.pipe(gulp.dest('./build/'));
});

var karmaSingleRunOptions = { configFile: 'karma.conf.js', action: 'run' };

gulp.task('test', function() {

	connect.server({port: 8080});

    return gulp.src([sourceFiles, testFiles])
        .pipe(karma(karmaSingleRunOptions))
		.on('end', function () {
			connect.serverClose();
		})
		.on('error', function (err) {
			throw err;
		});
});

gulp.task('test-unminified', function() {

    connect.server({port: 8080});

    return gulp.src([unminifiedFile, testFiles])
        .pipe(karma(karmaSingleRunOptions))
        .on('end', function () {
            connect.serverClose();
        })
        .on('error', function (err) {
            throw err;
        });
});

gulp.task('test-minified', function() {

    connect.server({port: 8080});

    return gulp.src([minifiedFile, testFiles])
        .pipe(karma(karmaSingleRunOptions))
        .on('end', function () {
            connect.serverClose();
        })
        .on('error', function (err) {
            throw err;
        });
});

gulp.task('default', ['scripts'], function() {

	// watch for JS changes
	gulp.watch(sourceFiles, function() {
		gulp.run('jshint', 'scripts');
	});
});