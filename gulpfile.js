
var gulp  = require('gulp');
var less  = require('gulp-less');

gulp.task('less',function () {
    gulp.src('content.less')
        .pipe(less())
        .pipe(gulp.dest('./'));
});

gulp.task('watch',function(){
    gulp.watch('content.less',['less']);
});


