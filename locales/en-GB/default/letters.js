/*globals module, require, console*/
/**
 * @author https://github.com/lattmann
 */


module.exports = {
    encodeMap: {
    },

    values: {
        a: {value: 1, distribution: 9},
        b: {value: 3, distribution: 2},
        c: {value: 3, distribution: 2},
        d: {value: 2, distribution: 4},
        e: {value: 1, distribution: 12},
        f: {value: 4, distribution: 2},
        g: {value: 2, distribution: 3},
        h: {value: 4, distribution: 2},
        i: {value: 1, distribution: 9},
        j: {value: 8, distribution: 1},
        k: {value: 5, distribution: 1},
        l: {value: 1, distribution: 4},
        m: {value: 3, distribution: 2},
        n: {value: 1, distribution: 6},
        o: {value: 1, distribution: 8},
        p: {value: 3, distribution: 2},
        q: {value: 10, distribution: 1},
        r: {value: 1, distribution: 6},
        s: {value: 1, distribution: 4},
        t: {value: 1, distribution: 6},
        u: {value: 1, distribution: 4},
        v: {value: 4, distribution: 2},
        w: {value: 4, distribution: 2},
        x: {value: 8, distribution: 1},
        y: {value: 4, distribution: 2},
        z: {value: 10, distribution: 1},
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
