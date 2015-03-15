/*globals module, require, console*/
/**
 * @author https://github.com/lattmann
 */

var glob = require('glob'),
    path = require('path'),
    fs = require('fs'),
    zlib = require('zlib'),

    utils = require('./utils'),

    update,
    processWords = require('./lycophron').Dictionary.processWords;


update = function (dir) {
    'use strict';

    var debug = require('debug')('update'),
        options = {
            nocase: true
        },
        info = {},
        processCompressedFile = function (filename, callback) {
            var lettersFilename = path.join(path.dirname(filename), 'letters.js'),
                letters,
                words,

                dict,
                dictFilename = path.join(path.dirname(filename), 'dict.json'),
                lang = path.basename(path.dirname(path.dirname(filename))),
                type = path.basename(path.dirname(filename));

            letters = require(path.resolve(lettersFilename));

            fs.readFile(filename, function (err, buf) {
                if (err) {
                    callback(err);
                    return;
                }

                zlib.unzip(buf, function (err, buffer) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    words = buffer.toString().split('\n');
                    words = words.LUnique();

                    dict = processWords(words, letters);

                    fs.writeFileSync(dictFilename, JSON.stringify(dict));

                    if (info.hasOwnProperty(lang) === false) {
                        info[lang] = {
                            types: {}
                        };
                    }

                    info[lang].types[type] = {
                        source: filename,
                        dict: dictFilename,
                        letters: lettersFilename,
                        numWords: words.length
                    };

                    callback(null);
                });
            });
        };


    // base directory / language / type / dictionary
    glob(path.join(dir, '*', '*', '*dict.@(tar|tar.gz)'), options, function (err, files) {
        var i,
            extension,
            numRemaining = files.length,
            done = function () {
                fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify(info, null, 4));
                console.log('done');
            },
            processCompressedFileFinished = function (err) {
                console.error(err);
                numRemaining -= 1;
                if (numRemaining === 0) {
                    done();
                }
            };

        if (err) {
            console.log(err);
            return;
        }

        if (files.length === 0) {
            console.warn('no files found');
            return;
        }

        for (i = 0; i < files.length; i += 1) {
            extension = path.extname(files[i]).toLowerCase();
            if (extension === '.tar' || extension === '.gz') {
                processCompressedFile(files[i], processCompressedFileFinished);
            } else {
                numRemaining -= 1;
                console.error('unhandled extension ' + extension);
            }
        }

        console.log(files);
    });

};

if (require.main === module) {
    update('locale');
}


module.exports = {
    update: update
};
