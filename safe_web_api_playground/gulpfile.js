var envfile = require('envfile'),
  fs = require('fs'),
  gulp = require('gulp'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  nodemon = require('gulp-nodemon'),
  watch = require('gulp-watch'),
  image = require('gulp-image'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  babelify = require('babelify');

gulp.task('safe-styles', function(done) {
  gulp.src('./node_modules/npm-font-open-sans/open-sans.scss')
    .pipe(gulp.dest('./static/scss'));

  gulp.src('./static/scss/custom/main.scss')
    .pipe(gulp.dest('./static/scss'));
    done();
});

gulp.task('image', function (done) {
  gulp.src('./static/images/*')
    .pipe(image())
    .pipe(gulp.dest('./build/images'));

  gulp.src('./favicon.ico')
    .pipe(gulp.dest('./build'));
  done();
});

gulp.task('js-deps', function (done) {
  gulp.src([
      './node_modules/jquery/dist/jquery.min.js',
      './node_modules/bootstrap/dist/js/bootstrap.min.js'
    ])
    .pipe(concat('deps.js'))
    .pipe(gulp.dest('./build/js'));
  done();
});

gulp.task('html', function (done) {
  gulp.src(
    './index.html'
    )
    .pipe(gulp.dest('./build'));
  done();
});

gulp.task('scss', function (done) {
  gulp.src([
      './static/scss/main.scss',
    ])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build/css'));
    done();
});

gulp.task('css-deps', function (done) {
  gulp.src([
      './node_modules/bootstrap/dist/css/bootstrap.css'
    ])
    .pipe(concat('deps.css'))
    .pipe(gulp.dest('./build/css'));
  gulp.src([
      './node_modules/bootstrap/dist/css/bootstrap.css.map'
    ])
    .pipe(gulp.dest('./build/css'));
  done();
});

gulp.task('fonts', function (done) {
  gulp.src([
      './static/fonts/**/*.*',
      './node_modules/npm-font-open-sans/fonts/**/*.*'
    ])
    .pipe(gulp.dest('./build/fonts'));
  done();
});

gulp.task('codemirror', function (done) {
  gulp.src([
      './node_modules/codemirror/lib/codemirror.css'
    ])
    .pipe(gulp.dest('./build/css'));
  done();
});

gulp.task('js', function () {
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
      .pipe(gulp.dest(destinationDirectory))
});

gulp.task('serve', function (done) {
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
});

gulp.task('watch', function (done) {
  watch (['./static/js/*.js', './static/js/**/*.js'], function () {
    gulp.start('js');
  });

  watch('./static/scss/**/*.scss', function () {
    gulp.start('scss');
  });

  watch('./index.html', function () {
    gulp.start('html');
  });
  done();
});

gulp.task('default', gulp.series('codemirror', 'js-deps', 'html', 'scss', 'css-deps', 'js', 'watch', 'serve', 'fonts', 'image'));
