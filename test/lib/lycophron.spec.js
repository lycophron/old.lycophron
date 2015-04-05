/*globals require, describe, it, before, after */
/**
 * @author https://github.com/lattmann
 */

var should = require('chai').should,
    expect = require('chai').expect,
    L = require('../../lib/lycophron'),
    winston = require('winston');

winston.level = 'warn';

describe('Lycophron module', function () {
    'use strict';

    describe('Dictionary', function () {

        describe('constructor', function () {

            it('throws if name is undefined', function () {
                var fn = function () {
                    var dict = new L.Dictionary();
                };

                expect(fn).to.throw(TypeError);
            });

            it('throws if language is not found', function () {
                var fn = function () {
                    var dict = new L.Dictionary('LANGUAGE');
                };

                expect(fn).to.throw(Error);
            });

            it('throws if type name within language is not found', function () {
                var fn = function () {
                    var dict = new L.Dictionary('hu-HU/DOES_NOT_EXIST');
                };

                expect(fn).to.throw(Error);
            });


            it('loads the defined type', function (done) {
                var dict = new L.Dictionary('hu-HU/default');
                // initialize may take longer time, because we get a the full dictionary
                this.timeout(3000);
                expect(dict.initialize.bind(dict, done)).to.not.throw();
            });

        });

        describe('using server', function () {
            var hostname = '127.0.0.1',
                port = 8001,
                url = 'http://' + hostname + ':' + port,
                http = require('http'),
                fs = require('fs'),
                path = require('path'),

                server = http.createServer(function (req, res) {
                    var filename = path.normalize(req.url.slice(req.url[0] === '/' ? 1 : 0)),
                        content = fs.readFileSync(filename);

                    if (req.url.indexOf('.json') > -1) {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                    } else if (req.url.indexOf('.js') > -1 ) {
                        res.writeHead(200, {'Content-Type': 'text/javascript'});
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                    }
                    res.end(content);
                });

            before(function (done) {
                server.listen(port, hostname, done);
            });

            after(function (done) {
                server.close(done);
            });

            it('should download data from server', function (done) {
                var dict = new L.Dictionary('hu-HU', true, url);

                dict.initialize(done);
            });
        });

        describe('hu=HU default', function () {

            var dict = new L.Dictionary('hu-HU');

            before(function (done) {
                dict.initialize(done);
            });

            it('checks isConsonant', function () {
                expect(dict).to.have.property('isConsonant');

                expect(dict.isConsonant('b')).to.be.true;
                expect(dict.isConsonant('c')).to.be.true;
                expect(dict.isConsonant('cs')).to.be.true;
                expect(dict.isConsonant('gy')).to.be.true;

                expect(dict.isConsonant('a')).to.be.false;
                expect(dict.isConsonant('e')).to.be.false;

                // joker
                expect(dict.isConsonant('*')).to.be.false;
            });


            it('checks isVowel', function () {
                expect(dict).to.have.property('isVowel');

                expect(dict.isVowel('b')).to.be.false;
                expect(dict.isVowel('c')).to.be.false;
                expect(dict.isVowel('cs')).to.be.false;
                expect(dict.isVowel('gy')).to.be.false;

                expect(dict.isVowel('a')).to.be.true;
                expect(dict.isVowel('e')).to.be.true;

                // joker
                expect(dict.isVowel('*')).to.be.true;
            });

            it('checks isJoker', function () {
                expect(dict).to.have.property('isJoker');

                expect(dict.isJoker('b')).to.be.false;
                expect(dict.isJoker('c')).to.be.false;
                expect(dict.isJoker('cs')).to.be.false;
                expect(dict.isJoker('gy')).to.be.false;

                expect(dict.isJoker('a')).to.be.false;
                expect(dict.isJoker('e')).to.be.false;

                // joker
                expect(dict.isJoker('*')).to.be.true;
            });

            it('decodes letters', function () {
                expect(dict).to.have.property('decodeLetter');

                expect(dict.decodeLetter('a')).to.equal('a');
                expect(dict.decodeLetter('S')).to.equal('sz');
                expect(dict.decodeLetter('P')).to.equal('dzs');
                expect(dict.decodeLetter('T')).to.equal('ty');
            });

            it('encodes letters', function () {
                expect(dict).to.have.property('decodeLetter');

                expect(dict.encodeLetter('a')).to.equal('a');
                expect(dict.encodeLetter('sz')).to.equal('S');
                expect(dict.encodeLetter('dzs')).to.equal('P');
                expect(dict.encodeLetter('ty')).to.equal('T');
            });

            it('gets all letters', function () {
                var allLetters;

                expect(dict).to.have.property('getAllLetters');

                allLetters = dict.getAllLetters();
                expect(allLetters).to.be.instanceOf(Array);
                expect(allLetters.length).to.equal(45);
            });

            it('gets letter values', function () {
                expect(dict).to.have.property('getLetterValue');

                expect(dict.getLetterValue('')).to.equal(0);
                expect(dict.getLetterValue('a')).to.equal(1);
                expect(dict.getLetterValue('ty')).to.equal(10);
            });


            it('gets letter distribution value', function () {
                expect(dict).to.have.property('getLetterDistribution');

                expect(dict.getLetterDistribution('')).to.equal(0);
                expect(dict.getLetterDistribution('a')).to.equal(6);
                expect(dict.getLetterDistribution('ty')).to.equal(1);
            });

            it('draws letters from standard bag', function () {
                expect(dict).to.have.property('drawLetters');

                expect(dict.drawLetters(0, 0, 0).length).to.equal(0);
                expect(dict.drawLetters(1, 1, 1).length).to.equal(3);
                expect(dict.drawLetters(10, 8, 1).length).to.equal(19);
                expect(dict.drawLetters(10, 9, 0).length).to.equal(19);
            });

            it('draws letters from custom bag', function () {
                expect(dict).to.have.property('drawLetters');

                expect(dict.drawLetters(0, 0, 0, ['a', 'b', '*']).length).to.equal(0);
                expect(dict.drawLetters(1, 1, 1, ['a', 'b', '*']).length).to.equal(3);
                expect(dict.drawLetters(1, 0, 0, ['a', 'b', '*']).length).to.equal(1);
                expect(dict.drawLetters(0, 1, 0, ['a', 'b', '*']).length).to.equal(1);
                expect(dict.drawLetters(0, 0, 1, ['a', 'b', '*']).length).to.equal(1);
                expect(dict.drawLetters(0, 0, 0, ['a', 'b', '*']).length).to.equal(0);
            });

            it('throws if draws letters is invoked with bigger numbers, than letters available in the bag', function () {
                expect(dict).to.have.property('drawLetters');

                expect(dict.drawLetters.bind(dict, 100, 0, 0)).throw(RangeError);
                expect(dict.drawLetters.bind(dict, 0, 100, 0)).throw(RangeError);
                expect(dict.drawLetters.bind(dict, 0, 0, 100)).throw(RangeError);
                expect(dict.drawLetters.bind(dict, 0, 0, 2, ['a', 'b', '*'])).throw(RangeError);
            });

            it('throws if draws letters does not recognize letters in the given bag', function () {
                expect(dict).to.have.property('drawLetters');

                expect(dict.drawLetters.bind(dict, 1, 0, 0, ['a', 'b', '*', '/'])).throw(Error);
                expect(dict.drawLetters.bind(dict, 1, 0, 0, ['a', 'b', '*', '_'])).throw(Error);
                expect(dict.drawLetters.bind(dict, 1, 0, 0, ['a', 'b', '*', ')'])).throw(Error);
            });

            it('encodes array', function () {
                expect(dict).to.have.property('encodeArray');

                expect(dict.encodeArray([])).to.deep.equal([]);
                expect(dict.encodeArray(['a', 'á'])).to.deep.equal(['a', 'A']);
                expect(dict.encodeArray(['sz', 'dzs', 'dz', 'b', '*'])).to.deep.equal(['S', 'P', 'D', 'b', '*']);
            });

            it('gets words for baba anagram', function () {
                expect(dict).to.have.property('getWords');

                expect(dict.getWords('baba')).to.deep.equal(['abba', 'baba']);
            });

            it('gets empty word list for aaaa', function () {
                expect(dict).to.have.property('getWords');

                expect(dict.getWords('aaaa')).to.deep.equal([]);
                expect(dict.getWords('yyyy')).to.deep.equal([]);
            });

            it('checks if word exists', function () {
                expect(dict).to.have.property('checkWord');

                expect(dict.checkWord('baba')).to.be.true;
                expect(dict.checkWord('abba')).to.be.true;
                expect(dict.checkWord('baab')).to.be.false;
                expect(dict.checkWord('baab')).to.be.false;
                expect(dict.checkWord('abab')).to.be.false;
                expect(dict.checkWord('aabb')).to.be.false;
                expect(dict.checkWord('bbaa')).to.be.false;
            });

            it('counts jokers', function () {
                expect(dict).to.have.property('countJokers');

                expect(dict.countJokers('')).to.deep.equal(0);
                expect(dict.countJokers('abcd')).to.deep.equal(0);
                expect(dict.countJokers('abcd*')).to.deep.equal(1);
                expect(dict.countJokers('abc*d*')).to.deep.equal(2);
                expect(dict.countJokers('**abc*d*')).to.deep.equal(4);
                expect(dict.countJokers('********')).to.deep.equal(8);
            });


            it('gets solution for a problem', function () {
                this.timeout(5000);
                expect(dict).to.have.property('getSolutionForProblem');

                // TODO: add more tests here
                expect(dict.getSolutionForProblem('')).to.have.property('problemId');
                expect(dict.getSolutionForProblem('AEQUWZabefhijknnost')).to.have.property('problemId');
                expect(dict.getSolutionForProblem('*EQUWZabefhijknnost')).to.have.property('problemId');
                expect(dict.getSolutionForProblem('*E*Zst')).to.have.property('problemId');
            });


            it('processes words', function () {
                var words = ['szakasz', 'zsazsa', 'passzol', 'dzseki', 'bá', '', 'sf\u0000'], // last two should be skipped
                    newDict;

                expect(L.Dictionary).to.have.property('processWords');

                newDict = L.Dictionary.processWords(words, dict.letters, winston);

                expect(newDict).to.have.property('root');
                expect(newDict).to.have.property('numWords');
                expect(newDict).to.have.property('numUniqueWords');
                expect(newDict.numUniqueWords).to.equal(words.length - 2); // last two should be skipped

            });
        });

    });
});
