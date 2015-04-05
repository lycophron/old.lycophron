/*globals */
/**
 * Utility scripts to speed up a few critical functions. Use jsperf.com to make improvements.
 *
 * @author https://github.com/lattmann
 */

// FIXME: do NOT add functions to the prototypes!

/**
 * Returns with a new unique array that contains only unique values.
 *
 * @returns {Array}
 * @constructor
 */
Array.prototype.LUnique = function () {
    'use strict';
    var u = {},
        a = [],
        i,
        l;

    for (i = 0, l = this.length; i < l; i += 1) {
        if (u.hasOwnProperty(this[i]) === false) {
            a.push(this[i]);
            u[this[i]] = 1;
        }
    }

    return a;
};

/**
 * Clones an array using a for loop. It pre-allocates the size of the array.
 *
 * @returns {Array}
 * @constructor
 */
Array.prototype.LForClone = function () {
    'use strict';

    var i,
        len = this.length,
        arrClone = new Array(len);

    for (i = 0; i < len; i += 1) {
        arrClone[i] = this[i];
    }

    return arrClone;
};

/**
 * Sorts the values in an array and return with the array itself.
 *
 * @returns {Array}
 * @constructor
 */
Array.prototype.LSort = function () {
    'use strict';

    var len = this.length,
        lp = -1,
        i,
        p1,
        p2;

    for (i = 0; i < len - 1;) { // jshint ignore:line
        p1 = this[i];
        p2 = this[i + 1];

        if (p1 > p2) {
            this[i] = p2;
            this[i + 1] = p1;
            lp = i;
            i -= 1;
            if (i < 0) {
                i = 0;
            }
        } else if (lp === -1) {
            i += 1;
        } else {
            i = lp + 1;
            lp += 1;
        }
    }
    return this;
};

/**
 * Sorts an array in descending order based on the string's length.
 * If the length are the same, then sorts those strings in an alphabetically ascending order.
 *
 * @returns {Array}
 * @constructor
 */
Array.prototype.LSortByLength = function () {
    'use strict';

    this.sort(function (a, b) {
        // sort by length descending and alphabetically ascending
        return a.length === b.length ? a < b ? -1 : 1 : a.length > b.length ? -1 : 1;
    });

    return this;
};

/**
 * Sorts the array alphabetically ascending order using localeCompare function to support UTF-8 character orders.
 *
 * @returns {Array}
 * @constructor
 */
Array.prototype.LSortAlphabetically = function () {
    'use strict';

    this.sort(function (a, b) {

        return a.localeCompare(b);
    });

    return this;
};
