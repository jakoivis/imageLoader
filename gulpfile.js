// include gulp
var gulp = require('gulp'); 
 
// include plug-ins
var jshint = require('gulp-jshint');
var changed = require('gulp-changed');

 
// JS hint task
gulp.task('jshint', function() {
  gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// include plug-ins
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
 
// JS concat, strip debugging and minify
gulp.task('scripts', function() {
  gulp.src(['./src/*.js'])
    .pipe(concat('imageLoader.min.js'))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(gulp.dest('./build/'));
});

// default gulp task
gulp.task('default', ['scripts'], function() {
 
  // watch for JS changes
  gulp.watch('./src/*.js', function() {
    gulp.run('jshint', 'scripts');
  });

});