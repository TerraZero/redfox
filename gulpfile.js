var gulp   = require('gulp');
var sass   = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var insert = require('gulp-insert');
var jade   = require('gulp-jade');
var fs     = require('fs');

var TZ = {

  components: null,

  getComponents: function() {
    if (this.components == null) {
      this.components = [];
      var list = fs.readdirSync('gulp/sass/components');

      for (var index in list) {
        this.components.push(list[index]);
      }
    }
    return this.components;
  },

  includesSass: function() {
    var components = this.getComponents();
    var includes = '';

    for (var index in components) {
      components[index] = '@import \'components/' + components[index] + '\'';
    }
    components.unshift('@import \'vars\'');
    return components.join('\n') + '\n';
  },

};

gulp.task('refresh', function() {
  TZ.components = null;
});

gulp.task('jade', function(){
  return gulp.src(['gulp/jade/**/*.jade', '!gulp/jade/mixins.jade'])
    .pipe(insert.prepend('include ../mixins\n'))
    .pipe(jade().on('error', function(e) {
      console.log(e.toString());
    }))
    .pipe(rename(function(path){
      path.extname = '.tpl.php';
    }))
    .pipe(gulp.dest('templates'));
});

gulp.task('sass', ['refresh'], function() {
  return gulp.src('gulp/sass/main.sass')
    .pipe(insert.prepend(TZ.includesSass()))
    .pipe(sass().on('error', function(e) {
      console.log(e.toString());
    }))
    .pipe(prefix('last 2 versions'))
    .pipe(gulp.dest('css'));
});

gulp.task('watch', ['sass', 'jade'], function () {
  gulp.watch('gulp/sass/**/*.sass', ['sass']);
  gulp.watch('gulp/jade/**/*.jade', ['jade']);
});

gulp.task('default', ['watch']);