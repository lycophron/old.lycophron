/*globals module, require, console*/
/**
 * @author https://github.com/lattmann
 */


module.exports = {
    encodeMap: {
    },

    values: {
        a: {value: 1, distribution: 14},
        b: {value: 5, distribution: 3},
        c: {value: 2, distribution: 6},
        d: {value: 5, distribution: 3},
        e: {value: 1, distribution: 11},
        f: {value: 5, distribution: 3},
        g: {value: 8, distribution: 2},
        h: {value: 8, distribution: 2},
        i: {value: 1, distribution: 12},
        l: {value: 3, distribution: 5},
        m: {value: 3, distribution: 5},
        n: {value: 3, distribution: 5},
        o: {value: 1, distribution: 15},
        p: {value: 5, distribution: 3},
        q: {value: 10, distribution: 1},
        r: {value: 2, distribution: 6},
        s: {value: 2, distribution: 6},
        t: {value: 2, distribution: 6},
        u: {value: 3, distribution: 5},
        v: {value: 5, distribution: 3},
        z: {value: 8, distribution: 2},
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
            (letter === 'l') ||
            (letter === 'm') ||
            (letter === 'n') ||
            (letter === 'p') ||
            (letter === 'q') ||
            (letter === 'r') ||
            (letter === 's') ||
            (letter === 't') ||
            (letter === 'v') ||
            (letter === 'z');
    },

    isVowel: function (letter) {
        'use strict';

        return (letter === '*') ||
            (letter === 'a') ||
            (letter === 'e') ||
            (letter === 'i') ||
            (letter === 'o') ||
            (letter === 'u');
    },

    normalize: function (word) {
        'use strict';

        return word.toLocaleLowerCase();
    }
};
