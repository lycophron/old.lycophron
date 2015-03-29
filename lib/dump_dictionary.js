/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

var program = require('commander'),
    fs = require('fs'),
    endOfLine = require('os').EOL,

    L = require('./lycophron'),
    dictionary,

    lang,
    type,
    filename,
    dict,

    i,
    j,
    key,
    fileStream,

    wordsByLength = {},
    len,
    node,
    wordLengths,
    wordList,
    size = 0;

program
    .version('0.0.1')
    .option('-l, --language <language>', 'Dictionary language', 'hu-HU')
    .option('-t, --type <type>', 'Dictionary type', 'default')
    .parse(process.argv);

lang = program.language;
type = program.type;

dictionary = new L.Dictionary(lang + '/' + type);

dictionary.initialize(function () {

    dict = dictionary.dict;

    function addNode(node) {
        for (key in node) {
            if (node.hasOwnProperty(key)) {
                if (key === '_' && node._.length > 0) {
                    // words are here
                    len = node._[0].length;
                    wordsByLength[len] = wordsByLength[len] || [];
                    wordsByLength[len] = wordsByLength[len].concat(node._);
                } else {
                    // visit next
                    addNode(node[key]);
                }
            }
        }
    }

    addNode(dict.root);


//console.log(Object.keys(dict.root));
//console.log(Object.keys(wordsByLength));
    wordLengths = Object.keys(wordsByLength);
    wordLengths.reverse();
    console.log(wordLengths);

    function compare(a, b) {
        return dictionary.decode(a).localeCompare(dictionary.decode(b));
    }

    fileStream = fs.createWriteStream(lang + '_' + type + '.txt', {flags: 'w+', encoding: 'utf8'});
    fileStream.write('# Dictionary: ' + lang + ' type: ' + type + endOfLine);
    fileStream.write(endOfLine);

    for (i = 0; i < wordLengths.length; i += 1) {
        wordList = wordsByLength[wordLengths[i]];
        wordList.sort(compare);
        fileStream.write('# word length: ' + wordLengths[i] + endOfLine);
        for (j = 0; j < wordList.length; j += 1) {
            //if (wordList[j].indexOf('S') > -1 ||
            //    wordList[j].indexOf('C') > -1 ||
            //    wordList[j].indexOf('Z') > -1 ||
            //    wordList[j].indexOf('P') > -1 ||
            //    wordList[j].indexOf('D') > -1) {

            fileStream.write('  ' + wordList[j] + '  # ' + dictionary.decode(wordList[j]) + endOfLine);
            //}
        }
        fileStream.write(endOfLine);
    }

    fileStream.end();


    for (key in wordsByLength) {
        if (wordsByLength.hasOwnProperty(key)) {
            size += wordsByLength[key].length;
            console.log(key, wordsByLength[key].length);
        }
    }

    console.log(size, dict.numWords);

    if (size !== dict.numWords) {
        console.error('not all words are processed!');
    }

});