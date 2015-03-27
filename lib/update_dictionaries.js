/*globals module, require*/
/**
 * @author https://github.com/lattmann
 */

var glob = require('glob'),
    path = require('path'),
    fs = require('fs'),
    zlib = require('zlib'),

    utils = require('./utils'),
    winston = require('winston'),

    update,
    processWords = require('./lycophron').Dictionary.processWords;


update = function (dir) {
    'use strict';

    var logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({
                    colorize: true,
                    timestamp: true,
                    prettyPrint: true
                }),
                new (winston.transports.File)({
                    filename: 'update_dictionaries.log',
                    json: false
                })
            ]
        }),
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


            try {
                letters = require(path.resolve(lettersFilename));
            } catch (e) {
                callback(e);
                return;
            }

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

                    dict = processWords(words, letters, logger);


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
                        numWords: dict.numWords,
                        numUniqueWords: dict.numUniqueWords
                    };

                    logger.info('Finished ', {metadata: info[lang].types[type]});

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
                logger.info('Done');
            },
            processCompressedFileFinished = function (err) {
                if (err) {
                    logger.error(err);
                }
                numRemaining -= 1;
                if (numRemaining === 0) {
                    done();
                }
            };

        if (err) {
            logger.error(err);
            return;
        }

        if (files.length === 0) {
            logger.warn('no files found');
            return;
        }

        for (i = 0; i < files.length; i += 1) {
            extension = path.extname(files[i]).toLowerCase();
            if (extension === '.tar' || extension === '.gz') {
                logger.info('Found dictionary: ' + files[i]);
                processCompressedFile(files[i], processCompressedFileFinished);
            } else {
                numRemaining -= 1;
                logger.error('unhandled extension ' + extension);
            }
        }

        logger.info(files);
    });

};

if (require.main === module) {
    update('locales');
}


module.exports = {
    update: update
};
