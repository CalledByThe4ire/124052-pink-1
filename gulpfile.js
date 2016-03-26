"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");

var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var reporter     = require('postcss-reporter');
var syntax_scss  = require('postcss-scss');
var stylelint    = require('stylelint');

var server = require("browser-sync");
var notify = require("gulp-notify");
var jade = require("gulp-jade");
var fs = require("fs");
var foldero = require("foldero");
var dataPath = "jade/_data/";


// sass
gulp.task("styletest", function() {
  var processors = [
    stylelint(),
    reporter({
      throwError: true
    })
  ];

  return gulp.src(['sass/**/*.scss'])
    .pipe(plumber())
    .pipe(postcss(processors, {syntax: syntax_scss}))
});


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
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(server.reload({
      stream: true
    }))
    .pipe(notify({
      message: "jade up!",
      sound: "Pop"
    }));
});

// jade
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


// serve
gulp.task("serve", ["style", "jade"], function() {
  server.init({
    server: {
      baseDir: "build/"
    },
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("jade/*/*", ["jade", server.reload]);
});
