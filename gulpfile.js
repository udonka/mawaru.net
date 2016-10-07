var gulp = require("gulp");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var plumber = require("gulp-plumber");
var sass = require("gulp-sass");
var bourbon = require("node-bourbon");
var neat = require("node-neat");
var print = require("gulp-print");
var notify = require("gulp-notify");

var riot = require("gulp-riot");


//var browser = require("browser-sync");
gulp.task("scss", function(){ 

  return gulp.src("./scss/*.scss")
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>") //<-
    }))
    .pipe(sass({includePaths:neat.includePaths}).on('error', sass.logError)) 
    .pipe(gulp.dest("./public/stylesheets/"));

});

gulp.task("riot", function(){ 
  return gulp.src("./riottags/*.jade")
    .pipe(riot( {
      template:"pug"
    }))
    .pipe(gulp.dest("./public/riotjs/"));
});



gulp.task('watch',function () {
  gulp.watch("./scss/**/*.scss", ["scss"]);
  gulp.watch("./riottags/*.jade", ["riot"]);

});

gulp.task("default", ["riot","scss", "watch"]);



