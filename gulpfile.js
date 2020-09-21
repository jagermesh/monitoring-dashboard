/* global require */
/* global exports */
/* global process */

const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const jshint = require('gulp-jshint');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const shell = require('gulp-shell');
const merge = require('merge-stream');
const child_process = require('child_process');

const configs = { jshint: { src: ['server/**/*.js', 'www/**/*.js', '!node_modules/**/*.js'] }
                };

gulp.task('jshint', function() {
  return gulp.src(configs.jshint.src)
             .pipe(jshint())
             .pipe(jshint.reporter('default'))
             .pipe(jshint.reporter('fail'));
});

gulp.task('build',
  gulp.series( 'jshint' ));
