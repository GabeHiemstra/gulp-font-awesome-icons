var through2 = require('through2'),
    mime = require('mime'),
    css = require('css'),
    htmlparser2 = require('htmlparser2'),
    gutil = require('gulp-util'),
    path = require('path'),
    print = require('pretty-print'),
    del = require('del'),
    _ = require('lodash');

var PLUGIN_NAME = 'gulp-obsolete-images';

function obsoleteImages(options) {
    options = options || {log: true, delete: false};
    function addUsed(imageUrl) {
        if (!imageUrl.match(/(data|http|https):/)) {

            // Add filename as begigging from the first /
            var filename = imageUrl.replace(/.*?(\/.+(png|gif|jpe?g|pdf|xml|apng|svg|mng))$/gi, "$1");
            if (filename) {
                usedImageNames.push(filename);
            }
        }
    }

    var imageNames = [];
    var usedImageNames = [];
    var ngUsedImages = [];

    var htmlParser = new htmlparser2.Parser({
        onopentag: function onopentag(name, attribs) {
            if (name === 'img') {
                if (attribs.src) {
                    addUsed(attribs.src);
                }
                // commonly used in lazy-loading
                if (attribs['data-src']) {
                    addUsed(attribs['data-src']);
                }
                if (attribs['ng-src']) {
                    ngUsedImages.push(attribs['ng-src']);
                }
            }
            // eg shortcut icon apple-touch-icon, it doesnt matter if we add extras that are not images
            else if (name === 'link' && attribs.href) {
                addUsed(attribs.href);
            }
            // eg msapplication-xxx
            else if (name === 'meta' && attribs.content) {
                addUsed(attribs.content);
            }
            // video posters
            else if (name == 'video' && attribs.poster) {
                addUsed(attribs.poster);
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

        if (mime.lookup(chunk.path).match(/image\//)) {
            //imageNames.push(path.basename(chunk.path));
            imageNames.push(chunk.path);
            return callback();
        }

        try {
            var ast = css.parse(String(chunk.contents));
            
            // main rules
            ast.stylesheet.rules.forEach(function (rule) {
                if (rule.type !== 'rule') {
                    return;
                }

                rule.declarations.forEach(function (declaration) {
                    var match = declaration.value.match(/url\(("|'|)(.+?)\1\)/);
                    if (match) {
                        addUsed(match[2]);
                    }
                });
            });

            // @media query declarations
            ast.stylesheet.rules.forEach(function (media) {
                if (media.type !== 'media') {
                    return;
                }
                media.rules.forEach(function (rule) {
                    if (rule.type !== 'rule') {
                        return;
                    }

                    rule.declarations.forEach(function (declaration) {
                        var match = declaration.value.match(/url\(("|'|)(.+?)\1\)/);
                        if (match) {
                            addUsed(match[2]);
                        }
                    });
                });
            });

        }
        catch (e) {
            htmlParser.write(String(chunk.contents));
        }

        self.push(chunk);
        callback();
    });

    transform.on('finish', function () {

        var used = new Array();
        for(i = 0; i < imageNames.length; i++){
            for(j = 0; j < usedImageNames.length; j++){
                if(imageNames[i].indexOf(usedImageNames[j]) !== -1){
                    //console.log(imageNames[i]+' - '+'/'+usedImageNames[j]+'$/gi');
                    used.push(imageNames[i]);
                    break;
                }
            }
        }

        var unused = _.difference(imageNames, used);

        // console.log(unused.join(', '));

        if (unused.length && options.log) {
            print(unused, {
                  leftPadding: 2,
                  rightPadding: 3
                });
        }

        if(options.delete){
            for(i = 0; i < unused.length; i++){
                del(unused[i]);
            }
        }
    });

    return transform;
}

module.exports = obsoleteImages;
