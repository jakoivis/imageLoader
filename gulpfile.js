var sourceFiles = './src/*.js';
var testFiles = './test/*.test.js';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
// var istanbul = require('gulp-istanbul');
var jasmine = require('karma-jasmine');
var karma = require('gulp-karma');

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

gulp.task("test", function() {


    var karmaOptions = {
        configFile: 'karma.conf.js',
        action: 'run'
    };

    return gulp.src([sourceFiles, testFiles])
        .pipe(gulp.dest('./coverage'))
        .pipe(karma(karmaOptions));
});



gulp.task('default', ['test', 'scripts'], function() {

	// watch for JS changes
	gulp.watch(sourceFiles, function() {
		gulp.run('jshint', 'scripts');
	});
});