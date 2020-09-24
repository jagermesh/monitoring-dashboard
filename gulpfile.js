const gulp   = require('gulp');
const concat = require('gulp-concat');
const jshint = require('gulp-jshint');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const merge  = require('merge-stream');

const config = {
  jshint: { src: ['*.js', '!node_modules/**/*.js'] }
, concat: [
    { src: [ 'www/3rdparty/jquery/jquery.min.js'
           , 'www/3rdparty/bootstrap/js/bootstrap.bundle.min.js'
           , 'www/3rdparty/handlebars/handlebars.min.js'
           , 'www/3rdparty/flot/jquery.flot.js'
           , 'www/3rdparty/socket.io/socket.io.js'
           , 'www/3rdparty/requirejs/require.js'
           , 'www/js/src/renderers/Renderer_Custom.js'
           , 'www/js/src/renderers/Renderer_LineChart.js'
           , 'www/js/src/renderers/Renderer_Progress.js'
           , 'www/js/src/renderers/Renderer_Table.js'
           , 'www/js/src/renderers/Renderer_Table.js'
           , 'www/js/src/index.js'
           ]
    , name: 'bundle.js'
    , dest: 'www/js/dist/'
    }
  ]
, terser: [
    { dest: 'www/js/dist/', src: 'www/js/dist/bundle.js' }
  ]
};

gulp.task('concat', function() {
  const tasks = config.concat.map(function(task) {
    return gulp.src(task.src)
               .pipe(concat(task.name, { newLine: '\r\n' }))
               .pipe(gulp.dest(task.dest));
  });
  return merge(tasks);
});

gulp.task('terser', function() {
  const tasks = config.terser.map(function(task) {
    return gulp.src(task.src)
               .pipe(terser())
               .pipe(rename({ suffix: '.min' }))
               .pipe(gulp.dest(task.dest));
  });
  return merge(tasks);
});

gulp.task('jshint', function() {
  return gulp.src(config.jshint.src)
             .pipe(jshint())
             .pipe(jshint.reporter('default'))
             .pipe(jshint.reporter('fail'));
});

gulp.task('build', gulp.series('jshint', 'concat', 'terser'));
