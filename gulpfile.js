var gulp = require('gulp'),
  cache = require('gulp-cache'),
  clean = require('gulp-clean'),
  stream = require('event-stream'),
  size = require('gulp-size'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  minifyCSS = require('gulp-minify-css'),
  babel = require('gulp-babel'),
  imagemin = require('gulp-imagemin');

// Fonts
gulp.task('fonts', function() {
  return gulp.src(['fonts/*']).pipe(gulp.dest('dist/fonts/'));
});

gulp.task('styles', function() {
  return gulp
    .src(['css/*.css'])
    .pipe(concat('styles.min.css'))
    .pipe(
      minifyCSS({
        keepBreaks: true,
      }),
    )
    .pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', function() {
  var js = gulp
    .src(['js/**/*.js'])
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('build.js'))
    .pipe(
      size({
        title: 'size of custom js',
      }),
    )
    .pipe(gulp.dest('dist/js'));
  stream.concat(js);
});

gulp.task('images', function() {
  return gulp
    .src(['img/*'])
    .pipe(
      cache(
        imagemin({
          optimizationLevel: 5,
          progressive: true,
          interlaced: true,
        }),
      ),
    )
    .pipe(
      size({
        title: 'size of images',
      }),
    )
    .pipe(gulp.dest('dist/img'));
});

gulp.task('clean', function() {
  return gulp.src(['dist/css', 'dist/js'], { read: false }).pipe(clean());
});

gulp.task('default', ['clean'], function() {
  gulp.start('fonts', 'styles', 'scripts', 'images');
});
