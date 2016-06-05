import autoprefixer from "autoprefixer";
import browserSync from "browser-sync";
import del from "del";
import gulp from "gulp";
import concat from "gulp-concat";
import connect from "gulp-connect";
import csso from "gulp-csso";
import data from "gulp-data";
import flatten from "gulp-flatten";
import imagemin from "gulp-imagemin";
import plumber from "gulp-plumber";
import postcss from "gulp-postcss";
import jade from "gulp-jade";
import rollup from "gulp-rollup";
import sass from "gulp-sass";
import sourcemaps from "gulp-sourcemaps";
import watch from "gulp-watch";
import path from "path";
import remember from "gulp-remember";
import rename from "gulp-rename";
import newer from "gulp-newer";
import gulpIf from "gulp-if";
import debug from "gulp-debug";
import notify from "gulp-notify";
import htmltidy from "gulp-htmltidy";
import stylelint from "gulp-stylelint";
import svgmin from "gulp-svgmin";
import svgstore from "gulp-svgstore";
import buble from "rollup-plugin-buble";
import eslint from "rollup-plugin-eslint";
import nodeResolve from "rollup-plugin-node-resolve";
import uglify from "rollup-plugin-uglify";
import commonjs from "rollup-plugin-commonjs";

gulp.task("assets", gulp.parallel(_root, _assets, _images, _svg, _fonts));
gulp.task("jade", gulp.series(_jade));
gulp.task("sass", gulp.parallel(_sass));
gulp.task("js", _js);
gulp.task("other", gulp.series(_icons_sprite));

gulp.task("clean", _clean);
gulp.task("build", gulp.series("clean", gulp.parallel("jade", "sass", "js", "assets", "other")));
gulp.task("watch", _watch);
gulp.task("serve", gulp.series("build", _serve, "watch"));
gulp.task("connect", _connect);

gulp.task("default", gulp.series("build"));


const options = {
    plumber: function(title = "Untitled") {
        return {
            errorHandler: notify.onError(function (error) {
                return {
                    title: `${title}: Error Handled`,
                    message: error.message
                }
            })
        }
    },
    postcss: {
        plugins: [
            autoprefixer({ browsers: ["last 2 versions"]})
        ]
    }
};

function _clean(done) {
    del.sync(["./build/", "!./build/.git/"]);
    done();
}

function _serve() {
    browserSync({
        server: {
            baseDir: "./build/"
        }
    });

    browserSync.watch("./build/**/*.*").on("change", browserSync.reload);
}

function _connect(done) {
    connect.server({
        root: "./build/",
        livereload: true
    });
    done();
}

function _watch() {
    gulp.watch("./src/**/*.jade", gulp.series("jade"));
    gulp.watch("./src/**/*.{sass,scss}", gulp.series("sass"));
    gulp.watch("./src/**/*.js", gulp.series("js"));
    gulp.watch("./src/**/assets/images/*.svg", _svg);
    gulp.watch("./src/**/assets/images/*.{jpg,jpeg,png}", _images);
    gulp.watch("./src/**/assets/fonts/*", _fonts);

    gulp.watch("./src/components/icon/assets/svg/*.svg", gulp.series("other"));
}

function _jade() {
    return gulp.src(["./src/pages/*/*.jade", "!./src/pages/*/_*.jade"])
        .pipe(plumber(options.plumber("Jade")))
        .pipe(jade({
            pretty: true,
            locals: {
                getData: function(component, file) {
                    try {
                        return require(`./src/components/${component}/${file}`);
                    }
                    catch (e) {
                        return null;
                    }
                }
            }
        }))
        .pipe(htmltidy({
            dropEmptyElements: false,
            tabSize: 2,
            indentSpaces: 2,
            indent: "auto",
            wrap: 0
        }))
        .pipe(flatten())
        .pipe(gulp.dest("./build/"))
}

function _sass() {
    return gulp.src(["./src/pages/*/*.sass", "!./src/pages/*/_*.sass"])
        .pipe(plumber(options.plumber("Sass")))
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(stylelint({
            reporters: [{formatter: "verbose", console: true}]
        }))
        .pipe(postcss(options.postcss.plugins))
        .pipe(csso({ restructure: false }))
        .pipe(sourcemaps.write("."))
        .pipe(flatten())
        .pipe(gulp.dest("./build/"))
}

function _js() {
    return gulp.src(["./src/pages/*/*.js", "!./src/pages/*/_*.js"], { read: false })
        .pipe(plumber(options.plumber("Js")))
        .pipe(rollup({
            sourceMap: true,
            format: "iife",
            plugins: [
                eslint({
                    envs: ["browser", "node", "es6"],
                    fix: true,
                    parser: "babel-eslint"
                }),
                nodeResolve({
                    browser: true,
                    extensions: [ '.js', '.json' ],
                    preferBuiltins: false
                }),
                commonjs(),
                buble(),
                uglify()
            ]
        }))
        .pipe(sourcemaps.write("."))
        .pipe(flatten())
        .pipe(gulp.dest("./build/"))
}

function _images() {
    return gulp.src("./src/**/assets/images/*.{jpg,jpeg,png}", {since: gulp.lastRun("assets")})
        .pipe(plumber(options.plumber("Images")))
        .pipe(flatten())
        .pipe(newer("./build/assets/images/"))
        //.pipe(debug({title: "images"}))
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest("./build/assets/images/"))
}

function _svg() {
    return gulp.src("./src/**/assets/images/*.svg", {since: gulp.lastRun("assets")})
        .pipe(plumber(options.plumber("Svg")))
        .pipe(flatten())
        .pipe(newer("./build/assets/images/"))
        .pipe(debug({title: "svg"}))
        .pipe(gulp.dest("./build/assets/images/"))
}

function _fonts() {
    return gulp.src("./src/**/assets/fonts/*.{woff,woff2}", {since: gulp.lastRun("assets")})
        .pipe(plumber(options.plumber("Fonts")))
        .pipe(flatten())
        .pipe(newer("./build/assets/fonts/"))
        //.pipe(debug({title: "fonts"}))
        .pipe(gulp.dest("./build/assets/fonts/"))
}

function _assets() {
    return gulp.src("./src/assets/**/*.*", {since: gulp.lastRun("assets")})
        .pipe(plumber(options.plumber("Assets")))
        .pipe(newer("./build/assets/"))
        //.pipe(debug({title: "assets"}))
        .pipe(gulp.dest("./build/assets/"))
}

function _root() {
    return gulp.src("./src/*.*", {since: gulp.lastRun("assets")})
        .pipe(plumber(options.plumber("Root")))
        .pipe(newer("./build/"))
        //.pipe(debug({title: "root"}))
        .pipe(gulp.dest("./build/"))
}

function _icons_sprite() {
    return gulp.src("./src/components/icon/assets/svg/*.svg", {since: gulp.lastRun("other")})
        .pipe(plumber(options.plumber("icons_sprite")))
        .pipe(newer("./build/assets/svg/"))
        .pipe(svgmin({
            plugins: [
                {
                    cleanupNumericValues: {
                        floatPrecision: 2
                    }
                }, {
                    convertColors: {
                        names2hex: true,
                        rgb2hex: true
                    }
                }, {
                    cleanupAttrs: true
                }, {
                    removeEditorsNSData: true
                }, {
                    convertTransform: true
                }, {
                    convertPathData: true
                }, {
                    removeUnknownsAndDefaults: true
                }, {
                    removeRasterImages: true
                }, {
                    mergePaths: true
                }, {
                    transformsWithOnePath: true
                }, {
                    removeDimensions: true
                }, {
                    removeStyleElement: true
                }, {
                    removeAttrs: {
                        attrs: [ "fill", "stroke", "data-name", "id", "class" ]
                    }
                }
            ]
        }))
        .pipe(rename({prefix: 'icon-'}))
        .pipe(svgstore())
        .pipe(rename({basename: 'icons-sprite'}))
        .pipe(gulp.dest("./build/assets/svg/"))
}