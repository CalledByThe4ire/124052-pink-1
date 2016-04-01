"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var clean = require("gulp-contrib-clean");
var concat = require("gulp-concat");
var rename = require("gulp-rename");

var postcss = require("gulp-postcss");
var assets = require("postcss-assets");
var autoprefixer = require("autoprefixer");
var reporter = require("postcss-reporter");
var syntax_scss = require("postcss-scss");
var stylelint = require("stylelint");

var server = require("browser-sync");
var notify = require("gulp-notify");
var jade = require("gulp-jade");
var fs = require("fs");
var foldero = require("foldero");
var dataPath = "jade/_data/";

var uglify = require("gulp-uglify");
var svg_sprite = require("gulp-svg-sprite");

/*
████████  █████  ███████ ██   ██ ███████
   ██    ██   ██ ██      ██  ██  ██
   ██    ███████ ███████ █████   ███████
   ██    ██   ██      ██ ██  ██       ██
   ██    ██   ██ ███████ ██   ██ ███████
*/

/* ============================================>>>>>
= CLEAN =
===============================================>>>>> */

gulp.task("clean", function() {
  gulp.src("build")
    .pipe(clean());
});

/* --------------------------------------------<<<<<
= End of CLEAN =
===============================================<<<<< */


/* ============================================>>>>>
= JADE =
===============================================>>>>> */

gulp.task("jade", function() {
  var siteData = {};
  if (fs.existsSync(dataPath)) {
    siteData = foldero(dataPath, {
      recurse: true,
      whitelist: "(.*/)*.+\.(json)$",
      loader: function loadAsString(file) {
        var json = {};
        try {
          json = JSON.parse(fs.readFileSync(file, "utf8"));
        } catch (e) {
          console.log("Error Parsing JSON file: " + file);
          console.log("==== Details Below ====");
          console.log(e);
        }
        return json;
      }
    });
  }

  return gulp.src("jade/_pages/*.jade")
    .pipe(plumber({
      errorHandler: notify.onError("Error:  <%= error.message %>")
    }))
    .pipe(jade({
      locals: {
        site: {
          data: siteData
        }
      },
      pretty: true
    }))
    .pipe(gulp.dest("build/"))
    .pipe(server.reload({
      stream: true
    }))
    .pipe(notify({
      message: "jade up!",
      sound: "Pop"
    }));
});

/* --------------------------------------------<<<<<
= End of JADE =
===============================================<<<<< */


/* ============================================>>>>>
= JS =
===============================================>>>>> */

gulp.task("js", function() {
  gulp.src(["js/lib/**", "js/modules/**", "js/app.js"])
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(concat("script.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(uglify())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(server.reload({
      stream: true
    }))
    .pipe(notify({
      message: "JS complite: <%= file.relative %>!",
      sound: "Pop"
    }))
});

/* --------------------------------------------<<<<<
= End of JS =
===============================================<<<<< */


/* ============================================>>>>>
= IMG =
===============================================>>>>> */

gulp.task("img", function() {
  gulp.src(["img/*.svg", "img/**/*.{jpg,png}"])
    .pipe(gulp.dest("build/img"))
    .pipe(server.reload({
      stream: true
    }))
});

/* --------------------------------------------<<<<<
= End of IMG =
===============================================<<<<< */


/* ============================================>>>>>
= SVG =
===============================================>>>>> */

gulp.task("svg", function() {
  return gulp.src("img/svg-sprite/*.svg")
    .pipe(svg_sprite({
      mode: {
        symbol: {
          dest: ".",
          dimensions: "%s",
          sprite: "build/img/svg-sprite.svg",
          example: false,
          render: {
            scss: {
              dest: "sass/_global/svg-sprite.scss"
            }
          }
        }
      },
      svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false
      }
    }))
    .pipe(gulp.dest("./"))
    .pipe(server.reload({
      stream: true
    }))
});

/* --------------------------------------------<<<<<
= End of SVG =
===============================================<<<<< */


/* ============================================>>>>>
= FONT =
===============================================>>>>> */

gulp.task("font", function() {
  gulp.src("fonts/**/*.{woff,woff2}")
    .pipe(gulp.dest("build/fonts"))
    .pipe(server.reload({
      stream: true
    }))
});

/* --------------------------------------------<<<<<
= End of FONT =
===============================================<<<<< */


/* ============================================>>>>>
= STYLETEST =
===============================================>>>>> */

gulp.task("styletest", function() {
  var processors = [
    stylelint(),
    reporter({
      throwError: true
    })
  ];

  return gulp.src(["!sass/_global/svg-sprite.scss", "sass/**/*.scss"])
    .pipe(plumber())
    .pipe(postcss(processors, {
      syntax: syntax_scss
    }))
});

/* --------------------------------------------<<<<<
= End of STYLETEST =
===============================================<<<<< */


/* ============================================>>>>>
= STYLE =
===============================================>>>>> */

gulp.task("style", ["styletest"], function() {
  gulp.src("sass/style.scss")
    .pipe(plumber({
      errorHandler: notify.onError("Error:  <%= error.message %>")
    }))
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        browsers: [
          "last 1 version",
          "last 2 Chrome versions",
          "last 2 Firefox versions",
          "last 2 Opera versions",
          "last 2 Edge versions"
        ]
      }),
      assets({
        loadPaths: ["img"]
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream())
    .pipe(notify({
      message: "Style up!",
      sound: "Pop"
    }));
});

/* --------------------------------------------<<<<<
= End of STYLE =
===============================================<<<<< */


/* ============================================>>>>>
= BUILD =
===============================================>>>>> */

gulp.task("all", ["jade", "js", "img", "svg", "font", "style"]);

gulp.task("build", ["clean", "all"]);

/* --------------------------------------------<<<<<
= End of BUILD =
===============================================<<<<< */


/* ============================================>>>>>
= SERVE =
===============================================>>>>> */

gulp.task("serve", ["all"], function() {
  server.init({
    server: {
      baseDir: "build/"
    },
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch("js/**/*.js", ["js", server.reload]);
  gulp.watch("img/svg-sprite/*.svg", ["svg", server.reload]);
  gulp.watch(["img/*.svg", "img/**/*.{jpg,png}"], ["img", server.reload]);
  gulp.watch("fonts/**/*{woff,woff2}", ["font", server.reload]);
  gulp.watch("sass/**/*.{scss,sass}", ["style", server.stream]);
  gulp.watch("jade/**/*", ["jade", server.reload]);
});

/* --------------------------------------------<<<<<
= End of SERVE =
===============================================<<<<< */
