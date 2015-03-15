/*globals require, describe, it */
/**
 * @author https://github.com/lattmann
 */

var should = require('chai').should,
    expect = require('chai').expect,
    utils = require('../../lib/utils');

describe('utils', function () {
    'use strict';

    it('adds functions to array', function () {
        var arr = [];

        expect(arr).to.have.property('LUnique');
        expect(arr).to.have.property('LForClone');
        expect(arr).to.have.property('LSort');
        expect(arr).to.have.property('LSortByLength');
        expect(arr).to.have.property('LSortAlphabetically');
    });

    it('returns with a unique array', function () {
        var arr = ['a', 'a', 'b', 'a', 'b'];

        expect(arr.LUnique()).to.deep.equal(['a', 'b']);
    });

    it('returns with a clone', function () {
        var arr = ['a', 'b'],
            cloned = arr.LForClone();

        expect(cloned).to.not.equal(['a', 'b']);
        expect(cloned).to.deep.equal(['a', 'b']);
    });

    it('returns with a sort an array', function () {
        var arr = ['ee', 'á', 'c', 'bbb', 'dddd', 'd', 'a'];

        arr.LSort();
        expect(arr).to.deep.equal(['a', 'bbb', 'c', 'd', 'dddd', 'ee', 'á']);
    });

    it('returns with a sort an array by length', function () {
        var arr = ['ee', 'á', 'c', 'bbb', 'dddd', 'd', 'a'];

        arr.LSortByLength();
        expect(arr).to.deep.equal(['dddd', 'bbb', 'ee', 'a', 'c', 'd', 'á']);
    });

    it('returns with a sort an array alphabetically', function () {
        var arr = ['ee', 'á', 'c', 'bbb', 'dddd', 'd', 'a'];

        arr.LSortAlphabetically();
        expect(arr).to.deep.equal(['a', 'bbb', 'c', 'd', 'dddd', 'ee', 'á']);
    });
});