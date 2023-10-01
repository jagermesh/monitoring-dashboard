const gulp = require('gulp');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const merge = require('merge-stream');

const configs = {
  eslint: {
    src: [
      '*.js',
      'www/src/**/*.js',
    ],
  },
  concat: [{
    src: [
      'www/3rdparty/jquery/jquery.min.js',
      'www/3rdparty/bootstrap/js/bootstrap.bundle.min.js',
      'www/3rdparty/handlebars/handlebars.min.js',
      'www/3rdparty/flot/jquery.flot.js',
      'www/3rdparty/chartjs/Chart.bundle.min.js',
      'www/3rdparty/socket.io/socket.io.js',
      'www/3rdparty/rgbcolor/rgbcolor.js',
      'www/3rdparty/momentjs/moment.min.js',
      'www/3rdparty/d3/d3.min.js',
      'www/3rdparty/c3/c3.min.js',
      'www/js/src/renderers/CustomRenderer.js',
      'www/js/src/renderers/ChartRenderer_C3.js',
      'www/js/src/renderers/ChartRenderer_ChartJS.js',
      'www/js/src/renderers/ProgressRenderer.js',
      'www/js/src/renderers/TableRenderer.js',
      'www/js/src/renderers/ValueRenderer.js',
      'www/js/src/renderers/GaugeRenderer.js',
      'www/js/src/index.js',
    ],
    name: 'bundle.js',
    dest: 'www/js/dist/',
  }],
  terser: [{
    dest: 'www/js/dist/',
    src: 'www/js/dist/bundle.js',
  }],
};

gulp.task('concat', () => {
  const tasks = configs.concat.map((task) => {
    return gulp.src(task.src)
      .pipe(concat(task.name, {
        newLine: '\r\n',
      }))
      .pipe(gulp.dest(task.dest));
  });
  return merge(tasks);
});

gulp.task('terser', () => {
  const tasks = configs.terser.map((task) => {
    return gulp.src(task.src)
      .pipe(terser())
      .pipe(rename({
        suffix: '.min',
      }))
      .pipe(gulp.dest(task.dest));
  });
  return merge(tasks);
});

gulp.task('eslint', () => {
  return gulp.src(configs.eslint.src)
    .pipe(eslint({
      quiet: true,
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('build', gulp.series('eslint', 'concat', 'terser'));