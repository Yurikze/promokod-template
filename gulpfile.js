const project_folder = 'dist'
const source_folder = '#src'

const path = {
  build: {
    html: project_folder + '/',
    css: project_folder + '/css/',
    js: project_folder + '/js/',
    img: project_folder + '/img/',
    fonts: project_folder + '/fonts/',
  },
  src: {
    html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
    css: source_folder + '/scss/index.scss',
    js: source_folder + '/js/script.js',
    img: source_folder + '/img/**/*.{png,jpg,svg,ico,webp}',
    fonts: source_folder + '/fonts/*.{woff,woff2}',
  }, 
  watch: {
    html: source_folder + '/**/*.html',
    css: source_folder + '/scss/**/*.scss',
    js: source_folder + '/js/**/*.js',
    img: source_folder + '/img/**/*.{png,jpg,svg,ico,webp}',
  }, 
  clean: './' + project_folder +'/'
}

const { src, dest } = require('gulp')
const gulp = require('gulp')
const browsersync = require('browser-sync').create()
const fileinclude = require('gulp-file-include')
const del = require('del')
const scss = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const group_media = require('gulp-group-css-media-queries')
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webphtml = require('gulp-webp-html');
const webpcss = require('gulp-webp-css');

function browserSync() {
  browsersync.init({
    server: {
      baseDir: './' + project_folder +'/'
    },
    port: 3000,
    notify: false
  })
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function images() {
  return src(path.src.img)
    .pipe(webp({
      quality: 70
    }))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false}],
      interlaced: true,
      optimizationLevel: 3
    }))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(scss({
      outputStyle: "expanded"
    }))
    .pipe(group_media())
    .pipe(autoprefixer({
      cascade: true
    }))
    .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(cleanCSS())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(dest(path.build.js))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(uglify({
      ecma: 5
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function fonts() {
  return src(path.src.fonts)
  .pipe(dest(path.build.fonts))
  .pipe(browsersync.stream())
}

function watchFiles() {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], images)
}

function clean() {
  return del(path.clean)
}

const build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts))
const watch = gulp.parallel(build, watchFiles, browserSync)

exports.fonts = fonts
exports.images = images
exports.js = js
exports.css = css
exports.html = html
exports.build = build
exports.watch = watch
exports.default = watch