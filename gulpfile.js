var gulp = require("gulp");
var uglify = require('gulp-uglify-es')
var htmlreplace = require('gulp-html-replace')
var cleanCSS = require('gulp-clean-css')
var htmlmin = require('gulp-htmlmin')
var uglify = require('gulp-uglify-es').default
var gutil = require('gulp-util')
var ftp = require('gulp-ftp')

// web-ftp 首页资源路径替换
gulp.task('ftp-copy-index', function() {
  return gulp.src('./src/index.html')
    .pipe(htmlreplace({
      'ftp-bootstrap-css': '<link rel="stylesheet" href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">',
      'web-ftp-css': {
        src: gulp.src('./src/static/css/webFtp.css').pipe(cleanCSS()),
        tpl: '<style>%s</style>'
      },
      'ftp-cdn-js': [
        '<script src="https://cdn.bootcss.com/crypto-js/3.1.9/crypto-js.min.js"></script>',
        '<script src="https://cdn.bootcss.com/crypto-js/3.1.9/hmac-sha256.min.js"></script>',
        '<script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>',
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.4.0/vue.min.js"></script>',
        '<script src="https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>',
      ],
      'ftp-js': {
        src: gulp.src([
          './src/static/js/frag.es6.js',
          './src/static/js/components.es6.js',
          './src/static/js/webFtp.es6.js',
        ]).pipe(uglify()),
        tpl: '<script>%s</script>'
      },
    }))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('default', ['ftp-copy-index'])
