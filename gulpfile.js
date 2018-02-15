var gulp = require("gulp");
var $    = require('gulp-load-plugins')();
var plumber = require('gulp-plumber');
var notifier = require('node-notifier');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var jade = require('gulp-jade');
var convertEncoding = require('gulp-convert-encoding');
var replaces = require('gulp-replace');
var prettify = require('gulp-prettify');
var cache = require('gulp-cached');
var htmlv = require( 'gulp-html-validator' );
var browserSync = require('browser-sync');
var notify = require('gulp-notify');
var fs = require('fs'),
path = require('path'),
iconvLite = require('iconv-lite'),
util = require('util'),
jschardet = require('jschardet'),
url = require('url');
var errorHandler = function(error) {
  var err = error;
  notifier.notify({
    message: err.message,
    title: err.plugin
  }, function() {
    console.log(err.message);
  });
};

gulp.task('sass', function () {
  gulp.src('./src/sass/*.scss', !'./src/sass/_modules/*.scss')
    .pipe( $.plumber({
    errorHandler: errorHandler
    }))
    .pipe(cache())
    .pipe(sass())
    .pipe(gulp.dest('./src/css/'))
    .pipe(replaces('UTF-8', 'Shift_JIS'))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(convertEncoding({to: "shift_jis"}))
    .pipe(gulp.dest('./dest/css/'))
    .pipe(browserSync.stream())
    .pipe(notify({
            title: 'Sassをコンパイルしました。',
            message: new Date(),
            sound: 'Glass'
            // icon: 'logo.gif'
     }));
});

gulp.task('jade', function () {
  gulp.src(['./src/jade/*.jade','./src/jade/**/*.jade','!./src/jade/**/_*.jade'])
  .pipe( $.plumber({
  errorHandler: errorHandler
   }))
   .pipe(cache())
   .pipe(jade({
    pretty: true
   }))
    .pipe(convertEncoding({to: "shift_jis"}))
    .pipe(gulp.dest('./dest/'))
    // .on('end', reload);
    .pipe(notify({
            title: 'Jadeをコンパイルしました。',
            message: new Date(),
            sound: 'Glass'
            // icon: 'logo.gif'
     }));
});

// html validation
gulp.task( 'valid', function () {
  gulp.src( './dest/**/*.html' )
  .pipe( htmlv() )
  .pipe( gulp.dest( './dest/**/*.html') )
  .pipe(browserSync.stream());
});


gulp.task('compress', function() {
  gulp.src(['./src/js/*.js'])
    .pipe( $.plumber({
    errorHandler: errorHandler
    }))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dest/common/js/'))
    .pipe(browserSync.stream());
});


gulp.task('default', ['sass', 'jade', 'compress']);


//watch
gulp.task('watch', function(){
 browserSync.init({
    port: 8888
     server: {
         baseDir: "./dest/",
         middleware: [
            function (req, res, next) {
                if (/\.html$/.test(req.url) || req.url === '/') {
                    var absPath='';
                    if(req.url === '/'){
                        absPath = path.join(__dirname, './dest/','index.html' );
                    }else{
                        absPath = path.join(__dirname, './dest/', req.url);
                    }
                    var data = fs.readFileSync(absPath);
                    var charset = jschardet.detect(data);
                    if (charset.encoding == 'windows-1252' || charset.encoding == 'Shift_JIS') {
                        var source = iconvLite.decode(new Buffer(data, 'binary'), "Shift_JIS");
                        res.setHeader("Content-Type", "text/html; charset=UTF-8");
                        res.end(source);
                    } else {
                        next();
                    }
                } else {
                    next();
                }
            }
        ]
     }
 });
    var w_sass = gulp.watch('./src/sass/*.scss', ['sass']);
    var w_jade = gulp.watch('./src/jade/**/*.jade', ['jade']);
    var w_uglify = gulp.watch('./src/js/*.js', ['compress']);

    w_sass.on('change', function(event){
        console.log('CSS File ' + event.path + ' was ' + event.type + ', running task sass...');
    });

    w_jade.on('change', function(event){
        console.log('Jade File ' + event.path + ' was ' + event.type + ', running task jade...');
    });

    w_uglify.on('change', function(event){
        console.log('javascript File ' + event.path + ' was ' + event.type + ', running task jsmin...');
    });


});
