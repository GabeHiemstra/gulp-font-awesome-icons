var through2 = require('through2'),
    htmlparser2 = require('htmlparser2'),
    gutil = require('gulp-util'),
    print = require('pretty-print'), 
    camelCase = require('camelcase');

var PLUGIN_NAME = 'gulp-font-awesome-icons';

function fontAwesomeIcons(options) {
    options = options || {splitdir: 'js/'};
    function addUsed(imageUrl) {
        usedImageNames.push(filename);
    }

    var usedImageNames = {};
    usedImageNames.fal = [];
    usedImageNames.far = [];
    usedImageNames.fas = [];
    usedImageNames.fab = [];

    var htmlParser = new htmlparser2.Parser({
        onopentag: function onopentag(name, attribs) {
            if(undefined !== attribs.class){
                if(attribs.class.match(/(fa[rslb] fa-[a-z0-9\-]+)/gi)){
                    var fa_type = attribs.class.replace(/(fa[rslb])\s+(fa-[a-z0-9\-]+)/gi, "$1");
                    var fa_class = camelCase(attribs.class.replace(/(fa[rslb])\s+(fa-[a-z0-9\-]+)/gi, "$2"));
                    switch(fa_type){
                        case 'fal': // light
                            usedImageNames.fal.push(options.splitdir + '_partials-fal/' + fa_class + '.js');
                        break;
                        case 'far': // regular
                            usedImageNames.far.push(options.splitdir + '_partials-far/' + fa_class + '.js');
                        break;
                        case 'fas': // solid
                            usedImageNames.fas.push(options.splitdir + '_partials-fas/' + fa_class + '.js');
                        break;
                        case 'fab': // brands
                            usedImageNames.fab.push(options.splitdir + '_partials-fab/' + fa_class + '.js');
                        break;
                        //default:
                        //    usedImageNames.push('unkown: ' + fa_type);
                        //break;
                    }
                }
            }
        }
    });

    var transform = through2.obj(function (chunk, enc, callback) {
        var self = this;

        if (chunk.isNull()) {
            self.push(chunk);
            return callback();
        }

        if (chunk.isStream()) {
            return callback(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        htmlParser.write(String(chunk.contents));

        self.push(chunk);
        callback();
    });

    transform.on('finish', function () {

        this.icons = [];

        if(usedImageNames.fal.length){
            this.icons.push(options.splitdir + '_partials-fal/_header.js');
            for(var i = 0; i < usedImageNames.fal.length; i++){
                this.icons.push(usedImageNames.fal[i]);
            }
            this.icons.push(options.splitdir + '_partials-fal/_footer.js');
        }

        if(usedImageNames.far.length){
            this.icons.push(options.splitdir + '_partials-far/_header.js');
            for(var i = 0; i < usedImageNames.far.length; i++){
                this.icons.push(usedImageNames.far[i]);
            }
            this.icons.push(options.splitdir + '_partials-far/_footer.js');
        }

        if(usedImageNames.fas.length){
            this.icons.push(options.splitdir + '_partials-fas/_header.js');
            for(var i = 0; i < usedImageNames.fas.length; i++){
                this.icons.push(usedImageNames.fas[i]);
            }
            this.icons.push(options.splitdir + '_partials-fas/_footer.js');
        }

        if(usedImageNames.fab.length){
            this.icons.push(options.splitdir + '_partials-fab/_header.js');
            for(var i = 0; i < usedImageNames.fab.length; i++){
                this.icons.push(usedImageNames.fab[i]);
            }
            this.icons.push(options.splitdir + '_partials-fab/_footer.js');
        }
    });

    return transform;
};

module.exports = fontAwesomeIcons;
