/*globals module, require, console*/
/**
 * @author https://github.com/lattmann
 */


module.exports = {
    encodeMap: {
        'ä': 'A',
        'å': 'V',
        'ö': 'O'
    },

    values: {
        a: {value: 1, distribution: 8},
        'ä': {value: 3, distribution: 2},
        'å': {value: 4, distribution: 2},
        b: {value: 4, distribution: 2},
        c: {value: 8, distribution: 1},
        d: {value: 1, distribution: 5},
        e: {value: 1, distribution: 7},
        'é': {value: 0, distribution: 0},
        f: {value: 3, distribution: 2},
        g: {value: 2, distribution: 3},
        h: {value: 2, distribution: 2},
        i: {value: 1, distribution: 5},
        j: {value: 7, distribution: 1},
        k: {value: 2, distribution: 3},
        l: {value: 1, distribution: 5},
        m: {value: 2, distribution: 3},
        n: {value: 1, distribution: 6},
        o: {value: 2, distribution: 5},
        'ö': {value: 4, distribution: 2},
        p: {value: 4, distribution: 2},
        q: {value: 0, distribution: 0},
        r: {value: 1, distribution: 8},
        s: {value: 1, distribution: 8},
        t: {value: 1, distribution: 8},
        u: {value: 4, distribution: 3},
        'ü': {value: 0, distribution: 0},
        v: {value: 3, distribution: 2},
        w: {value: 0, distribution: 0},
        x: {value: 8, distribution: 1},
        y: {value: 7, distribution: 1},
        z: {value: 8, distribution: 1},
        '*': {value: 0, distribution: 2}
    },

    isConsonant: function (letter) {
        'use strict';

        return (letter === 'b') ||
            (letter === 'c') ||
            (letter === 'd') ||
            (letter === 'f') ||
            (letter === 'g') ||
            (letter === 'h') ||
            (letter === 'j') ||
            (letter === 'k') ||
            (letter === 'l') ||
            (letter === 'm') ||
            (letter === 'n') ||
            (letter === 'p') ||
            (letter === 'q') ||
            (letter === 'r') ||
            (letter === 's') ||
            (letter === 't') ||
            (letter === 'v') ||
            (letter === 'w') ||
            (letter === 'x') ||
            (letter === 'y') ||
            (letter === 'z');
    },

    isVowel: function (letter) {
        'use strict';

        return (letter === '*') ||
            (letter === 'a') ||
            (letter === 'ä') ||
            (letter === 'å') ||
            (letter === 'e') ||
            (letter === 'é') ||
            (letter === 'i') ||
            (letter === 'o') ||
            (letter === 'ö') ||
            (letter === 'u') ||
            (letter === 'ü');
    },

    normalize: function (word) {
        'use strict';

        return word.toLocaleLowerCase();
    }
};
