var gulp = require('gulp');
var connect = require('gulp-connect');
var sourcemaps = require('gulp-sourcemaps');
var stylus = require('gulp-stylus');
var del = require('del');
var runSequence = require('run-sequence');
var proxy = require('proxy-middleware');

var paths = {
  css: ['app/css/**/*.css', 'node_modules/bootstrap/dist/css/**/*.css', 'node_modules/magnific-popup/dist/**/*.css', 'node_modules/animate.css/animate.min.css'],
  stylus: ['app/css/**/*.styl'],
  assets: ['app/index.html', 'app/.htaccess', 'app/img/**/*', 'app/api/**/*']
};

gulp.task('clean', function() {
  return del(['dist']);
});

var watchifyBundle;
var bundle = (function () {
  var browserify = require('browserify');
  var babelify = require('babelify');
  var gutil = require('gulp-util');
  var assign = require('lodash.assign');
  var watchify = require('watchify');
  var buffer = require('vinyl-buffer');
  var source = require('vinyl-source-stream');

  var customOpts = {
    entries: './app/js/app.js',
    debug: true,
    paths: ['./app/js', './node_modules'],
    transform: [babelify.configure({ignore: '/node_modules/', presets: ["es2015", "react"]})]
  };
  var opts = assign({}, watchify.args, customOpts);
  watchifyBundle = watchify(browserify(opts));
  
  var bundleClosure = function () {
    gutil.log("Starting '", gutil.colors.cyan("\bbrowserify"), "\b'...");
    return watchifyBundle.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('dist/js'))
      .pipe(connect.reload());
  };

  watchifyBundle.on('update', bundleClosure);
  watchifyBundle.on('time', function (time) {
    gutil.log("Finished '", gutil.colors.cyan("\bbrowserify"), "\b' after", gutil.colors.magenta(time + " ms"));
  });
  return bundleClosure;
})();

gulp.task('js', bundle);

gulp.task('close', function () {
  if (watchifyBundle !== undefined) watchifyBundle.close();
});

gulp.task('css', function () {
  return gulp.src(paths.css)
    .pipe(gulp.dest('dist/css'))
    .pipe(connect.reload());
});

gulp.task('assets', function () {
  return gulp.src(paths.assets, {base: 'app'})
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('stylus', function () {
  return gulp.src(paths.stylus)
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css'))
    .pipe(connect.reload());
});

gulp.task('usemin', function() {
  var uglify = require('gulp-uglify');
  var cssnano = require('gulp-cssnano');
  var usemin = require('gulp-usemin');
  
  return gulp.src('dist/index.html')
    .pipe(usemin({
      css: [cssnano],
      js: [uglify],
      inlinejs: [uglify],
      inlinecss: [cssnano, 'concat']
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('connect', function () {
  return connect.server({
    root: 'dist',
    port: 8080,
    livereload: true,
    middleware: function () {
      function createProxy(path) {
        return proxy({
          port: 8081,
          pathname: path,
          route: path
        });
      }
      return [createProxy('/api')];
    }
  });
});

gulp.task('watch', function () {
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.stylus, ['stylus']);
  gulp.watch(paths.assets, ['assets']);
});

gulp.task('build', ['stylus', 'js', 'css', 'assets']);
gulp.task('dist', function (callback) {
  runSequence('clean', 'build', 'usemin', 'close', callback);
});
gulp.task('server', ['build', 'connect', 'watch']);
gulp.task('default', ['server']);
