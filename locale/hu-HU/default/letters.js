/*globals module, require, console*/
/**
 * @author https://github.com/lattmann
 */

module.exports = {
    encodeMap: {
        'á': 'A',
        'é': 'E',
        'í': 'I',
        'ö': 'Q',
        'ü': 'X',
        'ó': 'O',
        'ő': 'W',
        'ú': 'U',
        'ű': 'Y',
        'dz': 'D',
        'dzs': 'P',
        'sz': 'S',
        'gy': 'G',
        'ny': 'N',
        'cs': 'C',
        'ty': 'T',
        'zs': 'Z',
        'ly': 'L'
    },

    values: {
        a: {value: 1, distribution: 6},
        'á': {value: 1, distribution: 4},
        b: {value: 2, distribution: 3},
        c: {value: 5, distribution: 1},
        cs: {value: 7, distribution: 1},
        d: {value: 2, distribution: 3},
        dz: {value: 9, distribution: 0},
        dzs: {value: 10, distribution: 0},
        e: {value: 1, distribution: 6},
        'é': {value: 3, distribution: 3},
        f: {value: 4, distribution: 2},
        g: {value: 2, distribution: 3},
        gy: {value: 4, distribution: 2},
        h: {value: 3, distribution: 2},
        i: {value: 1, distribution: 3},
        'í': {value: 5, distribution: 1},
        j: {value: 4, distribution: 2},
        k: {value: 1, distribution: 6},
        l: {value: 1, distribution: 4},
        ly: {value: 8, distribution: 1},
        m: {value: 1, distribution: 3},
        n: {value: 1, distribution: 4},
        ny: {value: 5, distribution: 1},
        o: {value: 1, distribution: 3},
        'ó': {value: 2, distribution: 3},
        'ö': {value: 4, distribution: 2},
        'ő': {value: 7, distribution: 1},
        p: {value: 4, distribution: 2},
        q: {value: 8, distribution: 0},
        r: {value: 1, distribution: 4},
        s: {value: 1, distribution: 3},
        sz: {value: 3, distribution: 2},
        t: {value: 1, distribution: 5},
        ty: {value: 10, distribution: 1},
        u: {value: 4, distribution: 2},
        'ú': {value: 7, distribution: 1},
        'ü': {value: 4, distribution: 2},
        'ű': {value: 7, distribution: 1},
        v: {value: 3, distribution: 2},
        w: {value: 10, distribution: 0},
        x: {value: 6, distribution: 0},
        y: {value: 2, distribution: 0},
        z: {value: 4, distribution: 2},
        zs: {value: 8, distribution: 1},
        '*': {value: 0, distribution: 2}
    },

    isConsonant: function (letter) {
        'use strict';

        return (letter === 'b') ||
            (letter === 'c') ||
            (letter === 'cs') ||
            (letter === 'd') ||
            (letter === 'dz') ||
            (letter === 'dzs') ||
            (letter === 'f') ||
            (letter === 'g') ||
            (letter === 'gy') ||
            (letter === 'h') ||
            (letter === 'j') ||
            (letter === 'k') ||
            (letter === 'l') ||
            (letter === 'ly') ||
            (letter === 'm') ||
            (letter === 'n') ||
            (letter === 'ny') ||
            (letter === 'p') ||
            (letter === 'q') ||
            (letter === 'r') ||
            (letter === 's') ||
            (letter === 'sz') ||
            (letter === 't') ||
            (letter === 'ty') ||
            (letter === 'v') ||
            (letter === 'w') ||
            (letter === 'x') ||
            (letter === 'y') ||
            (letter === 'z') ||
            (letter === 'zs');
    },

    isVowel: function (letter) {
        'use strict';

        return (letter === '*') ||
            (letter === 'a') ||
            (letter === 'á') ||
            (letter === 'e') ||
            (letter === 'é') ||
            (letter === 'i') ||
            (letter === 'í') ||
            (letter === 'o') ||
            (letter === 'ó') ||
            (letter === 'ö') ||
            (letter === 'ő') ||
            (letter === 'u') ||
            (letter === 'ú') ||
            (letter === 'ü') ||
            (letter === 'ű');
    },


    encodeAll: function (word) {
        'use strict';

        var i,
            j,
            k,
            currentLetter,
            currentEncodedLetter,
            doubleLetter,
            tripleLetter,
            currentEncodedDoubleLetter,
            currentEncodedTripleLetter,
            encodedWords = [],
            doubleLetterWords = [],
            tripleLetterWords = [];

        encodedWords.push('');

        for (i = 0; i < word.length; i += 1) {
            currentLetter = word[i];

            if (module.exports.encodeMap.hasOwnProperty(currentLetter)) {
                currentEncodedLetter = module.exports.encodeMap[currentLetter];
            } else {
                currentEncodedLetter = currentLetter;
            }

            if (i < word.length - 1) {
                doubleLetter = currentLetter + word[i + 1];
                if (module.exports.encodeMap.hasOwnProperty(doubleLetter)) {
                    currentEncodedDoubleLetter = module.exports.encodeMap[doubleLetter];
                } else {
                    currentEncodedDoubleLetter = '';
                }
            }

            if (i < word.length - 2) {
                tripleLetter = currentLetter + word[i + 1] + word[i + 2];
                if (module.exports.encodeMap.hasOwnProperty(tripleLetter)) {
                    currentEncodedTripleLetter = module.exports.encodeMap[tripleLetter];
                } else {
                    currentEncodedTripleLetter = '';
                }
            }


            for (j = 0; j < encodedWords.length; j += 1) {
                if (currentEncodedTripleLetter) {
                    if (!tripleLetterWords[i + 3]) {
                        tripleLetterWords[i + 3] = [];
                    }
                    tripleLetterWords[i + 3].push(encodedWords[j] + currentEncodedTripleLetter);
                }
                if (currentEncodedDoubleLetter) {
                    if (!doubleLetterWords[i + 2]) {
                        doubleLetterWords[i + 2] = [];
                    }
                    doubleLetterWords[i + 2].push(encodedWords[j] + currentEncodedDoubleLetter);
                }
                encodedWords[j] = encodedWords[j] + currentEncodedLetter;
            }

            for (j = 0; j < doubleLetterWords.length; j += 1) {

                if (j === i + 1) {
                    if (doubleLetterWords[j]) {
                        for (k = 0; k < doubleLetterWords[j].length; k += 1) {
                            encodedWords.push(doubleLetterWords[j][k]);
                        }
                    }
                }
            }

            for (j = 0; j < tripleLetterWords.length; j += 1) {
                if (j === i + 1) {
                    if (tripleLetterWords[j]) {
                        for (k = 0; k < tripleLetterWords[j].length; k += 1) {
                            encodedWords.push(tripleLetterWords[j][k]);
                        }
                    }
                }
            }
        }

        return encodedWords;
    }
};
