var through2 = require('through2'),
    htmlparser2 = require('htmlparser2'),
    gutil = require('gulp-util'),
    print = require('pretty-print');

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
                    usedImageNames.push(attribs.class.replace(/(fa[rslb] fa-[a-z0-9\-])+/gi, "$1"));
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

        // console.log(unused.join(', '));

        if (usedImageNames.length && options.log) {
            print(usedImageNames, {
                  leftPadding: 2,
                  rightPadding: 3
                });
        }
    });

    return transform;
}

module.exports = fontAwesomeIcons;
