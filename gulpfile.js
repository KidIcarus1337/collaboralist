var source = require('vinyl-source-stream');
var gulp = require('gulp');
var connect = require("gulp-connect");
var gutil = require('gulp-util');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var notify = require('gulp-notify');

var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var buffer = require('vinyl-buffer');

var reload;
var historyApiFallback = require('connect-history-api-fallback');


/*
  Browser Sync
*/
gulp.task('browser-sync', function() {
  var browserSync = require('browser-sync');
  reload = browserSync.reload;
    browserSync({
        // we need to disable clicks and forms for when we test multiple rooms
        server : {},
        middleware : [ historyApiFallback() ],
        ghostMode: false,
        notify: false
    });
});

/*
  Styles Task
*/
gulp.task('styles',function() {
  // Compile fonts
  gulp.src('node_modules/bootstrap/fonts/**.*')
    .pipe(gulp.dest('build/fonts'));

  // Compile CSS
  var gulpChain = gulp.src(['css/main.css', 'node_modules/bootstrap/dist/css/bootstrap.min.css'])
    .pipe(autoprefixer())
    .pipe(gulp.dest('build/css'));
  if (typeof reload !== "undefined") {
    gulpChain.pipe(reload({stream: true}));
  }
});

/*
  Images
*/
gulp.task('images',function(){
  gulp.src('images/**')
    .pipe(gulp.dest('build/images'))
});


function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

function buildScript(file, watch) {
  var props = {
    entries: ['./scripts/' + file],
    debug : true,
    cache: {},
    packageCache: {},
    transform:  [babelify.configure({stage : 0 })]
  };

  // watchify() if watch requested, otherwise run browserify() once
  var bundler = watch ? watchify(browserify(props)) : browserify(props);

  function rebundle() {
    var stream = bundler.bundle();
    var gulpChain = stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(gulp.dest('./build/'));
      // If you also want to uglify it
      // .pipe(buffer())
      // .pipe(uglify())
      // .pipe(rename('app.min.js'))
      // .pipe(gulp.dest('./build'))
    if (typeof reload !== "undefined") {
      gulpChain.pipe(reload({stream: true}));
    }
    return gulpChain;
  }

  // listen for an update and run rebundle
  bundler.on('update', function() {
    rebundle();
    gutil.log('Rebundle...');
  });

  // run it once the first time buildScript is called
  return rebundle();
}

gulp.task('scripts', function() {
  return buildScript('main.js', false); // this will run once because we set watch to false
});

// run 'scripts' task first, then watch for future changes
gulp.task('default', ['images','styles','scripts','browser-sync'], function() {
  gulp.watch('css/**', ['styles']); // gulp watch for stylus changes
  return buildScript('main.js', true); // browserify watch for JS changes
});

gulp.task('build', ['images','styles','scripts'], function() {
  return buildScript('main.js', true); // browserify watch for JS changes
});