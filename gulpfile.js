'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var del = require('del');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var server = require('browser-sync');
var notify = require('gulp-notify');
var runSequence = require('run-sequence');
var fs = require('fs');
var foldero = require('foldero');
var path = require('path');
var gulpIf = require('gulp-if');
var sourcemaps = require('gulp-sourcemaps');

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var assets = require('postcss-assets');
var mqpacker = require('css-mqpacker');
var flexboxfixer = require('postcss-flexboxfixer')
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var reporter = require('postcss-reporter');
var syntax_scss = require('postcss-scss');
var stylelint = require('stylelint');

var jade = require('gulp-jade');

var uglify = require('gulp-uglify');
var svg_sprite = require('gulp-svg-sprite');
var imagemin = require('gulp-imagemin')

var argv = require('minimist')(process.argv.slice(2));
var isOnProduction = !!argv.production;
var buildPath = isOnProduction ? 'build' : 'tmp';
var srcPath = 'src';
var dataPath = path.join(srcPath, 'jade/_data/');
var ghPages = require('gulp-gh-pages');

/*
     ██  █████  ██████  ███████
     ██ ██   ██ ██   ██ ██
     ██ ███████ ██   ██ █████
██   ██ ██   ██ ██   ██ ██
 █████  ██   ██ ██████  ███████
*/

gulp.task('jade', function() {
  var siteData = {};
  if (fs.existsSync(dataPath)) {
    siteData = foldero(dataPath, {
      recurse: true,
      whitelist: '(.*/)*.+\.(json)$',
      loader: function loadAsString(file) {
        var json = {};
        try {
          json = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (e) {
          console.log('Error Parsing JSON file: ' + file);
          console.log('==== Details Below ====');
          console.log(e);
        }
        return json;
      }
    });
  }

  return gulp.src('_pages/*.jade', {cwd: path.join(srcPath, 'jade')})
    .pipe(plumber({
      errorHandler: notify.onError('Error:  <%= error.message %>')
    }))
    .pipe(jade({
      locals: {
        site: {
          data: siteData
        }
      },
      pretty: true
    }))
    .pipe(gulp.dest(path.join(buildPath)))
    .pipe(notify({
      message: 'Jade: <%= file.relative %>',
      sound: 'Pop'
    }));
});


/*
     ██ ███████
     ██ ██
     ██ ███████
██   ██      ██
 █████  ███████
*/

gulp.task('js', function() {
  gulp.src(['lib/**', 'modules/**', 'app.js'], {cwd: path.join(srcPath, 'js')})
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(concat('script.js'))
    .pipe(gulp.dest(path.join(buildPath, 'js')))
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest(path.join(buildPath, 'js')))
    .pipe(notify({
      message: 'JS: <%= file.relative %>',
      sound: 'Pop'
    }))
});


/*
██ ███    ███  ██████
██ ████  ████ ██
██ ██ ████ ██ ██   ███
██ ██  ██  ██ ██    ██
██ ██      ██  ██████
*/

gulp.task('img', function() {
  gulp.src(['!svg-sprite', '!svg-sprite/**', '!inline', '!inline/**', '**/*.{jpg,png,svg}'], {cwd: path.join(srcPath, 'img')})
    .pipe(imagemin({
      progressive: true}))
    .pipe(gulp.dest(path.join(buildPath, 'img')))
});


/*
███████ ██    ██  ██████
██      ██    ██ ██
███████ ██    ██ ██   ███
     ██  ██  ██  ██    ██
███████   ████    ██████
*/

gulp.task('svg', function() {
  return gulp.src('svg-sprite/*.svg', {cwd: path.join(srcPath, 'img')})
    .pipe(svg_sprite({
      mode: {
        symbol: {
          dest: '.',
          dimensions: '%s',
          sprite: path.join(buildPath, 'img/svg-sprite.svg'),
          example: false,
          render: {
            scss: {
              dest: path.join(srcPath, 'sass/_global/svg-sprite.scss'),
            }
          }
        }
      },
      svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false
      }
    }))
    .pipe(gulp.dest('./'))
});


/*
███████  ██████  ███    ██ ████████
██      ██    ██ ████   ██    ██
█████   ██    ██ ██ ██  ██    ██
██      ██    ██ ██  ██ ██    ██
██       ██████  ██   ████    ██
*/

gulp.task('font', function() {
  gulp.src('**/*{woff,woff2}', {cwd: path.join(srcPath, 'fonts')})
    .pipe(gulp.dest(path.join(buildPath, 'fonts')))
});


/*
███████ ████████ ██    ██ ██      ███████ ████████ ███████ ███████ ████████
██         ██     ██  ██  ██      ██         ██    ██      ██         ██
███████    ██      ████   ██      █████      ██    █████   ███████    ██
     ██    ██       ██    ██      ██         ██    ██           ██    ██
███████    ██       ██    ███████ ███████    ██    ███████ ███████    ██
*/

gulp.task('styletest', function() {
  var processors = [
    stylelint(),
    reporter({
      throwError: true
    })
  ];

  return gulp.src(['!_global/svg-sprite.scss', '**/*.scss'], {cwd: path.join(srcPath, 'sass')})
    .pipe(plumber())
    .pipe(postcss(processors, {
      syntax: syntax_scss
    }))
});


/*
███████ ████████ ██    ██ ██      ███████
██         ██     ██  ██  ██      ██
███████    ██      ████   ██      █████
     ██    ██       ██    ██      ██
███████    ██       ██    ███████ ███████
*/

gulp.task('style', ['styletest'], function() {
  gulp.src('style.scss', {cwd: path.join(srcPath, 'sass')})
    .pipe(plumber({
      errorHandler: notify.onError('Error:  <%= error.message %>')
    }))
    .pipe(gulpIf(!isOnProduction, sourcemaps.init()))
    .pipe(sass())
    .pipe(postcss([
      mqpacker,
      flexboxfixer,
      autoprefixer({
        browsers: [
          'last 2 version',
          'last 2 Chrome versions',
          'last 2 Firefox versions',
          'last 2 Opera versions',
          'last 2 Edge versions'
        ]
      }),
      assets({
        loadPaths: [path.join(srcPath, 'img')]
      }),
      cssnano({
        safe:true
      })
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulpIf(!isOnProduction, sourcemaps.write()))
    .pipe(gulp.dest(path.join(buildPath, 'css')))

    .pipe(server.stream({match: '**/*.css'}))
    .pipe(notify({
      message: 'Style: <%= file.relative %>',
      sound: 'Pop'
    }));
});


/*
██████  ███████ ██
██   ██ ██      ██
██   ██ █████   ██
██   ██ ██      ██
██████  ███████ ███████
*/


gulp.task('del', function() {
  return del([path.join(buildPath), path.join(srcPath, 'sass/_global/svg-sprite.scss')]).then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'));
  });
});

/*
███████ ███████ ██████  ██    ██ ███████
██      ██      ██   ██ ██    ██ ██
███████ █████   ██████  ██    ██ █████
     ██ ██      ██   ██  ██  ██  ██
███████ ███████ ██   ██   ████   ███████
*/

gulp.task('serve', function() {
  server.init({
    server: {
      baseDir: buildPath
    },
    notify: true,
    open: false,
    ui: false
  });
});

/*
██████  ██    ██ ██ ██      ██████
██   ██ ██    ██ ██ ██      ██   ██
██████  ██    ██ ██ ██      ██   ██
██   ██ ██    ██ ██ ██      ██   ██
██████   ██████  ██ ███████ ██████
*/

gulp.task('build', ['del'], function (callback) {
  runSequence(
    'svg',
    'img',
    ['jade', 'js', 'font'],
    'style',
    callback);
})

/*
██████  ███████ ██████  ██       ██████  ██    ██
██   ██ ██      ██   ██ ██      ██    ██  ██  ██
██   ██ █████   ██████  ██      ██    ██   ████
██   ██ ██      ██      ██      ██    ██    ██
██████  ███████ ██      ███████  ██████     ██
*/

gulp.task('deploy', function() {
  return gulp.src('**/*.*', {cwd: path.join(buildPath)})
    .pipe(ghPages());
});

/*
██████  ███████ ███████  █████  ██    ██ ██   ████████
██   ██ ██      ██      ██   ██ ██    ██ ██      ██
██   ██ █████   █████   ███████ ██    ██ ██      ██
██   ██ ██      ██      ██   ██ ██    ██ ██      ██
██████  ███████ ██      ██   ██  ██████  ███████ ██
*/

var allTasks = ['build'];
if (!isOnProduction) {
  allTasks.push('serve');
}

gulp.task('default', allTasks, function() {
  if (!isOnProduction) {
    gulp.watch('**/*.js', {cwd: path.join(srcPath, 'js')}, ['js', server.reload]);
    gulp.watch('svg-sprite/*.svg', {cwd: path.join(srcPath, 'img')}, ['svg', server.reload]);
    gulp.watch(['!svg-sprite', '!svg-sprite/**', '!inline', '!inline/**', '**/*.{jpg,png,svg}'], {cwd: path.join(srcPath, 'img')}, ['img', server.reload]);
    gulp.watch('**/*{woff,woff2}', {cwd: path.join(srcPath, 'fonts')}, ['font', server.reload]);
    gulp.watch('**/*.scss', {cwd: path.join(srcPath, 'sass')}, ['style', server.stream]);
    gulp.watch('**/*.*', {cwd: path.join(srcPath, 'jade')}, ['jade', server.reload]);
  }
});
