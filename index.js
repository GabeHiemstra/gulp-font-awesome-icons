var through2 = require('through2'),
    htmlparser2 = require('htmlparser2'),
    gutil = require('gulp-util'),
    print = require('pretty-print'), 
    camelCase = require('camelcase');

var PLUGIN_NAME = 'gulp-font-awesome-icons';

function fontAwesomeIcons(options) {
    options = options || {log: true, delete: false};
    function addUsed(imageUrl) {
        usedImageNames.push(filename);
    }

    var usedImageNames = [];

    var htmlParser = new htmlparser2.Parser({
        onopentag: function onopentag(name, attribs) {
            if(undefined !== attribs.class){
                if(attribs.class.match(/(fa[rslb] fa-[a-z0-9\-]+)/gi)){
                    var fa_type = attribs.class.replace(/(fa[rslb])\s+(fa-[a-z0-9\-]+)/gi, "$1");
                    var fa_class = camelCase(attribs.class.replace(/(fa[rslb])\s+(fa-[a-z0-9\-]+)/gi, "$2"));
                    switch(fa_type){
                        case 'fal': // light
                            usedImageNames.push('node_modules/@fortawesome/fontawesome-pro-light/' + fa_class + '.js');
                        break;
                        case 'far': // regular
                            usedImageNames.push('node_modules/@fortawesome/fontawesome-pro-regular/' + fa_class + '.js');
                        break;
                        case 'fas': // solid
                            usedImageNames.push('node_modules/@fortawesome/fontawesome-pro-solid/' + fa_class + '.js');
                        break;
                        case 'fab': // brands
                            usedImageNames.push('node_modules/@fortawesome/fontawesome-pro-brands/' + fa_class + '.js');
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

        if (usedImageNames.length && options.log) {

            /*print(usedImageNames, {
                  leftPadding: 2,
                  rightPadding: 3
                });*/

            this.icons = usedImageNames;
        }
    });

    return transform;
};

module.exports = fontAwesomeIcons;
