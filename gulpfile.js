// *************************************
//
//   Gulpfile
//
// *************************************
//
// Available tasks:
//   `gulp`
//   `gulp build`
//   `gulp browserify`
//   `gulp compile:sass`
//   `gulp connect`
//   `gulp html`
//   `gulp images`
//   `gulp minify:css`
//   `gulp test:css`
//   `gulp test:js`
//   `gulp watch`
//
// *************************************

// -------------------------------------
//   Plugins
// -------------------------------------
//
// babelify            : Babel Browserify transform
// browserify          : Browser-side require()
// gulp                : The streaming build system
// gulp-autoprefixer   : Prefix CSS
// gulp-concat         : Concatenate files
// gulp-connect        : Gulp plugin to run a webserver (with LiveReload)
// gulp-csscss         : CSS redundancy analyzer
// gulp-jshint         : JavaScript code quality tool
// gulp-load-plugins   : Automatically load Gulp plugins
// gulp-minify-css     : Minify CSS
// gulp-parker         : Stylesheet analysis tool
// gulp-plumber        : Prevent pipe breaking from errors
// gulp-rename         : Rename files
// gulp-sass           : Compile Sass
// gulp-uglify         : Minify JavaScript with UglifyJS
// gulp-util           : Utility functions
// gulp-watch          : Watch stream
// pump                : Pipe streams together and close all of them if one of them closes
// react               : React JavaScript library
// reactify            : Browserify transform for JSX
// run-sequence        : Run a series of dependent Gulp tasks in order
// vinyl-source-stream : Use conventional text streams at the start of your gulp or vinyl pipelines
//
// -------------------------------------

var gulp       = require( 'gulp' );
var run        = require( 'run-sequence' );
var browserify = require( 'browserify' );
var source     = require( 'vinyl-source-stream' );
var buffer     = require( 'vinyl-buffer' );
var plugins    = require( 'gulp-load-plugins' )( {

  rename : {
    'gulp-minify-css'     : 'cssmin'
  }

} );

// -------------------------------------
//   Options
// -------------------------------------

var options = {

  // ----- Default ----- //

  default : {
    tasks : [ 'build', 'connect', 'watch' ]
  },

  // ----- Build ----- //

  build : {
    tasks       : [ 'minify:css', 'browserify', 'html' ],
    destination : 'build/'
  },

  // ----- Browserify ----- //

  browserify : {
    file        : 'source/javascripts/main.js',
    outputFile  : 'application.js',
    destination : 'build/javascripts'
  },

  // ----- Connect ----- //

  connect : {
    port : 9000,
    base : 'http://localhost',
    root : 'build'
  },

  // ----- CSS ----- //

  css : {
    files       : 'source/stylesheets/*.css',
    file        : 'build/stylesheets/application.css',
    destination : 'build/stylesheets'
  },

  // ----- HTML ----- //

  html : {
    files           : 'source/*.html',
    file            : 'source/index.html',
    destination     : 'build',
    destinationFile : 'build/index.html'
  },

  // ----- Images ----- //

  images : {
    files       : 'source/images',
    destination : 'build/images'
  },

  // ----- JavaScript ----- //

  js : {
    files       : [ 'source/javascripts/main.js', 'source/javascripts/**/*.js' ],
    file        : 'source/javascripts/main.js',
    buildFile   : 'build/javascripts/application.js',
    destination : 'build/javascripts'
  },

  // ----- Sass ----- //

  sass : {
    files       : 'source/stylesheets/*.sass',
    destination : 'build/stylesheets'
  },

  // ----- Watch ----- //

  watch : {
    files : function() {
      return [
        options.html.files,
        options.js.files,
        options.sass.files
      ]
    },
    run : function() {
      return [
        [ 'html', 'images' ],
        [ 'browserify' ],
        [ 'compile:sass', 'minify:css' ]
      ]
    }
  }

};

// -------------------------------------
//   Task: Default
// -------------------------------------

gulp.task( 'default', options.default.tasks );

// -------------------------------------
//   Task: Build
// -------------------------------------

gulp.task( 'build', function() {

  options.build.tasks.forEach( function( task ) {
    gulp.start( task );
  } );

});

// -------------------------------------
//   Task: Browserify
// -------------------------------------

gulp.task( 'browserify', function() {

  browserify( options.browserify.file )
    .transform( 'babelify', { presets: [ 'es2015', 'react' ] } )
    .bundle()
    .on( 'error', function( error ) {
      plugins.util.log( error );
    } )
    .pipe( source( options.browserify.outputFile ) )
    .pipe( buffer() )
    .pipe( plugins.uglify() )
    .pipe( gulp.dest( options.browserify.destination ) )
    .pipe( plugins.connect.reload() );

});

// -------------------------------------
//   Task: Compile: Sass
// -------------------------------------

gulp.task( 'compile:sass', function () {

  gulp.src( options.sass.files )
    .pipe( plugins.plumber() )
    .pipe( plugins.sass( { indentedSyntax: true } ) )
    .pipe( plugins.autoprefixer( {
            browsers : [ 'last 2 versions' ],
            cascade  : false
        } ) )
    .pipe( gulp.dest( options.sass.destination ) )
    .pipe( plugins.connect.reload() );

} );

// -------------------------------------
//   Task: Connect
// -------------------------------------

gulp.task( 'connect', function() {

  plugins.connect.server( {
    root       : [ options.connect.root ],
    port       : options.connect.port,
    base       : options.connect.base,
    livereload : true
  } );

});

// -------------------------------------
//   Task: HTML
// -------------------------------------

gulp.task( 'html', function() {

  gulp.src( options.html.files )
    .pipe( gulp.dest( options.html.destination ) )
    .pipe( plugins.connect.reload() );

});

// -------------------------------------
//   Task: Images
// -------------------------------------

gulp.task( 'images', function() {

  gulp.src( options.images.files )
    .pipe( gulp.dest( options.images.destination ) )
    .pipe( plugins.connect.reload() );

});

// -------------------------------------
//   Task: Minify: CSS
// -------------------------------------

gulp.task( 'minify:css', function () {

  gulp.src( options.css.file )
    .pipe( plugins.plumber() )
    .pipe( plugins.cssmin( { advanced: false } ) )
    .pipe( plugins.rename( { suffix: '.min' } ) )
    .pipe( gulp.dest( options.css.destination ) )
    .pipe( plugins.connect.reload() );

} );

// -------------------------------------
//   Task: Test: CSS
// -------------------------------------

gulp.task( 'test:css', function() {

  gulp.src( options.css.file )
    .pipe( plugins.plumber() )
    .pipe( plugins.parker() )

  gulp.src( options.css.file )
    .pipe( plugins.plumber() )
    .pipe( plugins.csscss() )

});

// -------------------------------------
//   Task: Test: JS
// -------------------------------------

gulp.task( 'test:js', function() {

  gulp.src( options.js.file )
    .pipe( plugins.plumber() )
    .pipe( plugins.jshint() )
    .pipe( plugins.jshint.reporter( 'default' ) )

});

// -------------------------------------
//   Task: Watch
// -------------------------------------

gulp.task( 'watch', function() {

  var watchFiles = options.watch.files();

  watchFiles.forEach( function( files, index ) {
    gulp.watch( files, options.watch.run()[ index ]  );
  } );

});
