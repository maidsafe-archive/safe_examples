const envfile = require('envfile'),
  fs = require('fs'),
  gulp = require('gulp'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  nodemon = require('gulp-nodemon'),
  image = require('gulp-image'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  babelify = require('babelify');

function getStyleDeps () {
  return gulp.src('./static/scss/custom/main.scss')
    .pipe(gulp.dest('./static/scss'));
}

function images (done) {
  gulp.src('./static/images/*')
    .pipe(image())
    .pipe(gulp.dest('./build/images'));

  gulp.src('./favicon.ico')
    .pipe(gulp.dest('./build'));
  done();
}

function jsDeps () {
  return gulp.src([
      './node_modules/jquery/dist/jquery.min.js',
      './node_modules/bootstrap/dist/js/bootstrap.min.js'
    ])
    .pipe(concat('deps.js'))
    .pipe(gulp.dest('./build/js'));
}

function html () {
  return gulp.src(
    './index.html'
    )
    .pipe(gulp.dest('./build'));
}

function scss () {
  return gulp.src([
      './static/scss/main.scss',
    ])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build/css'));
}

function cssDeps () {
  gulp.src([
      './node_modules/bootstrap/dist/css/bootstrap.css'
    ])
    .pipe(concat('deps.css'))
    .pipe(gulp.dest('./build/css'));

  return gulp.src([
      './node_modules/bootstrap/dist/css/bootstrap.css.map'
    ])
    .pipe(gulp.dest('./build/css'));
}

function fonts () {
  return gulp.src([
      './static/fonts/**/*.*',
      './node_modules/npm-font-open-sans/fonts/**/*.*'
    ])
    .pipe(gulp.dest('./build/fonts'));
}

function codemirror () {
  return gulp.src([
      './node_modules/codemirror/lib/codemirror.css'
    ])
    .pipe(gulp.dest('./build/css'));
}

function bundleJS () {
  var sourceDirectory = __dirname + '/static/js',
    destinationDirectory = __dirname + '/build/js',
    outputFile = 'client-scripts.js',
    env = envfile.parseFileSync('.env');
    var bundler = browserify(sourceDirectory + '/client-scripts.js').transform(babelify);

    return bundler.bundle()
      .on('error', function(err) {
        console.log(err);
      })
      .pipe(source('client-scripts.js'))
      .pipe(gulp.dest(destinationDirectory));
}

function serve (done) {
  var env = envfile.parseFileSync('.env');
  nodemon({
    script: './index.js',
    ext: 'html js',
    ignore: ['build/**/*.*', 'static/**/*.*', 'node_modules'],
    tasks: [],
    env: env
  }).on('restart', function (event) {
    console.log('server restarted....');
  });
  done();
}

function watch (done) {
  gulp.watch (['./static/js/*.js', './static/js/**/*.js'], bundleJS);
  
  gulp.watch('./static/scss/custom/*.scss', scss);
  
  gulp.watch('./index.html', html);
  done();
}

exports.getStyleDeps = getStyleDeps;
exports.default = gulp.series(watch, codemirror, jsDeps, html, scss, cssDeps, bundleJS, serve, fonts, images);
