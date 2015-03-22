/*globals module, require, console*/
/**
 * @author https://github.com/lattmann
 */


module.exports = {
    encodeMap: {
        'ä': 'A',
        'ö': 'O',
        'ü': 'U',
        'ß': 'S'
    },

    values: {
        a: {value: 1, distribution: 5},
        'ä': {value: 6, distribution: 1},
        b: {value: 3, distribution: 2},
        c: {value: 4, distribution: 2},
        d: {value: 1, distribution: 4},
        e: {value: 1, distribution: 15},
        f: {value: 4, distribution: 2},
        g: {value: 2, distribution: 3},
        h: {value: 2, distribution: 4},
        i: {value: 1, distribution: 6},
        j: {value: 6, distribution: 1},
        k: {value: 4, distribution: 2},
        l: {value: 2, distribution: 3},
        m: {value: 3, distribution: 4},
        n: {value: 1, distribution: 9},
        o: {value: 2, distribution: 3},
        'ö': {value: 8, distribution: 1},
        p: {value: 4, distribution: 1},
        q: {value: 10, distribution: 1},
        r: {value: 1, distribution: 6},
        s: {value: 1, distribution: 7},
        'ß': {value: 1, distribution: 0},
        t: {value: 1, distribution: 6},
        u: {value: 1, distribution: 6},
        'ü': {value: 6, distribution: 1},
        v: {value: 6, distribution: 1},
        w: {value: 3, distribution: 1},
        x: {value: 8, distribution: 1},
        y: {value: 10, distribution: 1},
        z: {value: 3, distribution: 1},
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
            (letter === 'ß') ||
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
            (letter === 'e') ||
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
