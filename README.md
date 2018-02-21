# gulp-font-awesome-icons
Compose a Font Awesome 5 javascript file containing core functionality and selected icons used only in your poject. This plugin is intended as a standalone task, meaning that the returned stream is not used, but instead a callback will contain the split files as a stream.

## Initial steps
This requires PHP. First download the latest Font Awesome 5+ package and extract the contents of .../svg-with-js/js/* to .../node_modules/gulp-font-awesome-icons/js/. Run php split-fontawesome.php. This should create 4 directories within js/, each containing the split files for the separate Font Awesome styles (light, regular, solid, brands).

## Example
This example first creates the 'icons' task. Then it streams all files within /html/ and all subdirectories. 

After this the plugin is initialized, setting the split-directory by default to js/.

When the finish callback is called, the property "icons" will contain an array of files that will be merged (using gulp-concat) and placed in the destination directory src/js.

Within these files, it attempts to parse HTML code and match elements with the class "fa# fa-###". The first part can be either fal, far, fas or fab and the second part is the name of the icon.

	var gulp = require('gulp');
	var concat = require('gulp-concat');
	var obsoleteImages = require('gulp-font-awesome-icons');

	gulp.task('icons', function(){
		gulp.src('app/html/**/*')
		  .pipe(faIcons({splitdir: 'node_modules/gulp-font-awesome-icons/js/'})) 
		  .on('finish', function(){
		    if( undefined !== this.icons && this.icons.length ) {
		      gulp.src(this.icons)
		        .pipe(concat('fontawesome.js'))
		        .pipe(gulp.dest('src/js'));
		    }
		  });
	});