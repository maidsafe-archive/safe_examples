var envfile = require('envfile'),
  gulp = require('gulp'),
  concat = require('gulp-concat'),
  nodemon = require('gulp-nodemon'),
  watch = require('gulp-watch'),
  image = require('gulp-image'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  babelify = require('babelify');

gulp.task('image', function () {
  gulp.src('./static/images/*')
    .pipe(image())
    .pipe(gulp.dest('./build/images'));

  gulp.src('./favicon.ico')
    .pipe(gulp.dest('./build'));
});

gulp.task('js-deps', function () {
  gulp.src([
      './node_modules/jquery/dist/jquery.min.js',
      './node_modules/bootstrap/dist/js/bootstrap.min.js'
    ])
    .pipe(concat('deps.js'))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('html', function () {
  gulp.src(
    './index.html'
    )
    .pipe(gulp.dest('./build'));
});

gulp.task('css', function () {
  gulp.src([
      './static/css/styles.css',
    ])
    .pipe(gulp.dest('./build/css'));
});

gulp.task('css-deps', function () {
  gulp.src([
      './node_modules/bootstrap/dist/css/bootstrap.css'
    ])
    .pipe(concat('deps.css'))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('fonts', function () {
  gulp.src([
      './node_modules/bootstrap/fonts/*.*',
      './static/fonts/**/*.*'
    ])
    .pipe(gulp.dest('./build/fonts'));
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

gulp.task('serve', function () {
  var env = envfile.parseFileSync('.env');
  nodemon({
    script: './index.js',
    ext: 'html js',
    ignore: ['build/**/*.*', 'static/**/*.*'],
    tasks: [],
    env: env
  }).on('restart', function () {
    console.log('server restarted....');
  });
});

gulp.task('watch', function () {
  watch(['./static/js/*.js', './static/js/**/*.js'], function () {
    gulp.start('js');
  });

  watch('./static/css/*.css', function () {
    gulp.start('css');
  });

  watch('./index.html', function () {
    gulp.start('html');
  });
});

gulp.task('default', ['js-deps', 'html', 'css', 'css-deps', 'js', 'watch', 'serve', 'fonts', 'image']);
