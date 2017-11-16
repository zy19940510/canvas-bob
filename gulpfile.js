//gulp能自动化地完成 javascript/coffee/sass/less/html/image/css 等文件的的测试、检查、合并、压缩、格式化、浏览器自动刷新、部署文件生成，并检测文件变化。在实现上，gulp鉴了Unix操作系统的管道（pipe）思想，前一级的输出，直接变成后一级的输入。
var gulp = require('gulp');
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var webpack = require('webpack-stream');
var fs = require('fs');


gulp.task('build', ['build-client', 'build-server']);//build任务依赖于build-client、build-server这2个任务,且按顺序执行完才会执行build


gulp.task('lint', function () {
  return gulp.src(['**/*.js', '!node_modules/**/*.js', '!bin/**/*.js'])
    .pipe(jshint({
          esnext: true
      }))
    .pipe(jshint.reporter('default', { verbose: true}))
    .pipe(jshint.reporter('fail'));
});

//处理了客户端代码的创建，它用到了uglify、webpack和babel
gulp.task('build-client', ['lint', 'move-client'], function () {
  return gulp.src(['src/client/js/app.js'])  //该任务针对的文件
    .pipe(uglify())//压缩js文件
    .pipe(webpack(require('./webpack.config.js')))  //模块打包，它能帮我们把本来需要在服务端运行的JS代码，通过模块的引用和依赖打包成前端可用的静态文件
    .pipe(babel({
      presets: [
        ['es2015', { 'modules': false }]
      ]
    })) //babel是一个JavaScript转换编译器，它可以将ES6（下一代JavaScript规范，添加了一些新的特性和语法）转换成ES5（可以在浏览器中运行的代码）。这就意味你可以在一些暂时还不支持某些ES6特性的浏览器引擎中，使用ES6的这些特性。比如说，class和箭头方法。
    .pipe(gulp.dest('bin/client/js/'));//任务会在这个目录下生成针对的文件
});


gulp.task('move-client', function () {
  return gulp.src(['src/client/**/*.*', '!client/js/*.js'])//移动src/client下所有文件，除了client/js下的js文件
    .pipe(gulp.dest('./bin/client/'));
});


gulp.task('build-server', ['lint'], function () {
  return gulp.src(['src/server/**/*.*', 'src/server/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('bin/server/'));
});

gulp.task('watch', ['build'], function () {
  gulp.watch(['src/client/**/*.*'], ['build-client', 'move-client']);
  gulp.watch(['src/server/*.*', 'src/server/**/*.js'], ['build-server']);
  gulp.start('run-only');
});

//运行游戏命令
gulp.task('run', ['build'], function () {
    nodemon({
        delay: 10,
        script: './server/server.js',
        cwd: "./bin/",
        args: ["config.json"],
        ext: 'html js css'
    })
    .on('restart', function () {
        util.log('server restarted!');
    });
});

gulp.task('run-only', function () {
    nodemon({
        delay: 10,
        script: './server/server.js',
        cwd: "./bin/",
        args: ["config.json"],
        ext: 'html js css'
    })
    .on('restart', function () {
        util.log('server restarted!');
    });
});

gulp.task('default', ['run']);
