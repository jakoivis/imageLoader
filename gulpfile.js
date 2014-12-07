var sourceFiles = './src/*.js';
var testFiles = './test/*.test.js';
var imageFiles = './test/assets/*.png';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var jasmine = require('karma-jasmine');
var karma = require('gulp-karma');
var connect = require('gulp-connect');

gulp.task('jshint', function() {
	gulp.src(sourceFiles)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('scripts', function() {
	gulp.src([sourceFiles])
		.pipe(concat('imageloader.min.js'))
		.pipe(stripDebug())
		.pipe(uglify())
		.pipe(gulp.dest('./build/'));

	gulp.src([sourceFiles])
		.pipe(concat('imageloader.js'))
		.pipe(stripDebug())
		.pipe(gulp.dest('./build/'));
});

gulp.task('test', function() {

	connect.server({port: 8080});

    var karmaOptions = {
        configFile: 'karma.conf.js',
        action: 'run'
    };

    return gulp.src([sourceFiles, testFiles])
        .pipe(karma(karmaOptions))
		.on('end', function () {
			connect.serverClose();
		})
		.on('error', function (err) {
			throw err;
		})
});

gulp.task('default', ['scripts'], function() {

	// watch for JS changes
	gulp.watch(sourceFiles, function() {
		gulp.run('jshint', 'scripts');
	});
});