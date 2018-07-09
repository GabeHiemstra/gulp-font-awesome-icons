# gulp-font-awesome-icons
Compose a single and compact Font Awesome 5 javascript file containing only the icons you use in your project. This plugin is intended as a standalone task, meaning that the returned stream is not used, but instead a callback will contain the split files as a stream.

## Initial steps
This requires PHP and must be executed after installing this module. Download the latest release of Font Awesome 5+ and extract the contents of .../svg-with-js/js/* to .../node_modules/gulp-font-awesome-icons/js/. Using a command-line tool, navigate to this directory and run "php ./split-fontawesome.php".

The above process should create 4 directories: \_partials-fas, \_partials-far, \_partials-fal and \_partials-fab. Each directory contains split files for separate Font Awesome icon styles (light, regular, solid, brands).

## Example
The following example looks for HTML and PHP files within the 'app/html' directory (including sub-directories) and then scours through those files looking for HTML tags match font-awesome icons. Finally, it looks for icons in the file 'fontawesome-additional-icons.html'. Such a file is included in this package as an example.

Note: fontawesome-additional-icons.html can be used to manually set icons used by your project but not recognized by the plugin.

The plugins takes one option, splitdir, which is a sub-directory of the module which contains the font-awesome split-files, needed to compact the final file.

The 'finish' callback is called when the gathering of used icons is completed and presents the 'icons' variable which is an array containing the path of the file containing icon code. The array is transformed into a gulp stream and is then concatenated to a single file and placed with 'src/js'.

```js
	var gulp = require('gulp');
	var concat = require('gulp-concat');
	var obsoleteImages = require('gulp-font-awesome-icons');

	gulp.task('icons', function(){
		gulp.src(['app/html/**/*', 'fontawesome-additional-icons.html'])
		  .pipe(faIcons({splitdir: 'node_modules/gulp-font-awesome-icons/js/'})) 
		  .on('finish', function(){
		    if( undefined !== this.icons && this.icons.length ) {
		      gulp.src(this.icons)
		        .pipe(concat('fontawesome.js'))
		        .pipe(gulp.dest('src/js'));
		    }
		  });
	});
```