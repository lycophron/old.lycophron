/*globals require, console*/
/**
 * @author lattmann / https://github.com/lattmann
 */

var L = require('../../lib/lycophron'),
    main = require('./main');

// FIXME: this is just intermediate test code for the browser, until we setup automated browser tests karma or similar.
var testDict;
testDict = new L.Dictionary('hu-HU', true);
testDict.initialize(function () {
    'use strict';

    //console.log(testDict);
    //console.log(testDict.getAllLetters());
    //console.log(testDict.getWords('baba'));
    //console.log(testDict.getAllWordsForAnagram('baba'));
    //console.log(testDict.getSolutionForProblem('aeeiuoEA*bdfgghprtS'));
});




