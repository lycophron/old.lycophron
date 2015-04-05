/*globals module, require, console*/
/**
 * @author https://github.com/lattmann
 */

/**
 * Initializes a new dictionary.
 * @public
 *
 * TODO: be able to pass a list of words
 *
 * @param {string} name 'hu-HU/type1' or 'hu-HU', if type is not defined 'default' is loaded.
 * @param {Boolean} [useAgent] if true it uses superagent to download files (browser), otherwise loads it with require (node).
 * @param {string} [url] if superagent is used, url can be defined. From browser you do not need to specify.
 * @constructor
 */
function Dictionary(name, useAgent, url) {
    'use strict';

    var self = this,

        localeInfo = require('../locales/info.json'),
        superagent = require('superagent'),
        logger = require('debug')('lycoprhon:dictionary'),

        utils = require('./utils'),

        dictName,
        letterName,
        lang,
        typeName,
        idx;

    if (typeof name !== 'string') {
        throw new TypeError('Name must be a string');
    }

    // default values
    useAgent = useAgent || false;
    url = url || '';

    idx = name.indexOf('/');
    if (idx > -1) {
        typeName = name.slice(idx + 1);
        lang = name.slice(0, idx);
    } else {
        typeName = 'default';
        lang = name;
    }

    dictName = lang + '/' + typeName;

    if (localeInfo[lang]) {
        if (localeInfo[lang].types[typeName]) {
            dictName = localeInfo[lang].types[typeName].dict;
            letterName = localeInfo[lang].types[typeName].letters;
        } else {
            throw new Error('Type was not found ' + typeName + ' in ' + lang);
        }
    } else {
        throw new Error('Language was not found ' + lang);
    }

    this.lang = lang;
    this.typeName = typeName;

    this.encodeMap = {};
    this.decodeMap = {};

    this.letterValues = {};
    this.letterDistributions = {};

    this.allLetters = [];

    /**
     * Returns with true if the given letter is a consonant.
     * @public
     *
     * @param letter
     * @returns {Boolean}
     */
    this.isConsonant = function (letter) {
        return self.letters.isConsonant(self.decodeMap[letter] || letter);
    };

    /**
     * Returns with true if the given letter is a vowel. Joker is considered as a vowel.
     * @public
     *
     * @param letter
     * @returns {Boolean}
     */
    this.isVowel = function (letter) {
        return self.letters.isVowel(self.decodeMap[letter] || letter);
    };

    /**
     * Returns with true if the given letter is a joker.
     * @public
     *
     * @param letter
     * @returns {Boolean}
     */
    this.isJoker = function (letter) {
        return letter === '*';
    };

    this.encodeLetter = function (letter) {
        return self.encodeMap[letter] || letter;
    };

    this.decodeLetter = function (letter) {
        return self.decodeMap[letter] || letter;
    };

    this.getAllLetters = function () {
        return self.allLetters;
    };

    this.getBagOfLetters = function () {
        var bag = [],
            letter,
            i,
            k;

        for (i = 0; i < self.allLetters.length; i += 1) {
            letter = self.allLetters[i];
            for (k = 0; k < self.getLetterDistribution(letter); k += 1) {
                bag.push(letter);
            }
        }

        return bag;
    };

    this.getLetterValue = function (letter) {
        return self.letterValues[self.encodeMap[letter] || letter] || 0;
    };

    this.getLetterDistribution = function (letter) {
        return self.letterDistributions[self.encodeMap[letter] || letter] || 0;
    };

    this.drawLetters = function (numConsonants, numVowels, numJokers, bag) {
        var letters = [],
            lettersConsonants = [],
            lettersVowels = [],
            result = [],
            consonants = [],
            vowels = [],
            jokers = [],
            i,
            j,
            letter,
            index,

            specialCaseLength = 15,
            specialCaseMaxAttempt = 20,
            specialCaseWords = [],
            specialCaseWord,
            goodCandidate,

            tmpConsonants,
            tmpVowels;

        bag = bag || self.getBagOfLetters();

        numConsonants = parseInt(numConsonants);
        numVowels = parseInt(numVowels);
        numJokers = parseInt(numJokers);

        for (i = 0; i < bag.length; i += 1) {
            if (self.isConsonant(bag[i])) {
                consonants.push(bag[i]);
            } else if (self.isJoker(bag[i])) {
                jokers.push(bag[i]);
            } else if (self.isVowel(bag[i])) {
                vowels.push(bag[i]);
            } else {
                throw new Error('Unknown letter type: ' + bag[i]);
            }
        }

        if (consonants.length < numConsonants) {
            throw new RangeError('Requested too many consonants.');
        }

        if (vowels.length < numVowels) {
            throw new RangeError('Requested too many vowels.');
        }

        if (jokers.length < numJokers) {
            throw new RangeError('Requested too many jokers.');
        }

        if (numConsonants + numVowels > specialCaseLength) {
            if (self.fullDictionary &&
                self.fullDictionary.hasOwnProperty('byLength') &&
                self.fullDictionary.byLength.hasOwnProperty(specialCaseLength)) {

                specialCaseWords = self.fullDictionary.byLength[specialCaseLength];
                for (i = 0; i < specialCaseMaxAttempt; i += 1) {
                    specialCaseWord = specialCaseWords[Math.floor(Math.random() * specialCaseWords.length)].e;
                    //specialCaseWord = 'vilAgcsUcstartO';

                    tmpConsonants = consonants.slice();
                    tmpVowels = vowels.slice();
                    goodCandidate = true;

                    // check num consonants and vowels
                    for (j = 0; j < specialCaseWord.length; j += 1) {
                        letter = this.decodeLetter(specialCaseWord[j]);
                        if (this.isConsonant(letter) && tmpConsonants.indexOf(letter) > -1) {
                            lettersConsonants.push(letter);
                            tmpConsonants.splice(tmpConsonants.indexOf(letter), 1);
                        } else if (this.isVowel(letter) && tmpVowels.indexOf(letter) > -1) {
                            lettersVowels.push(letter);
                            tmpVowels.splice(tmpVowels.indexOf(letter), 1);
                        } else {
                            goodCandidate = false;
                            logger('not enough letters in bag ' + specialCaseWord + ' letter: ' + letter + ' (' + this.encodeLetter(letter) + ')');
                            break;
                        }
                    }

                    if (goodCandidate && lettersConsonants.length <= numConsonants && lettersVowels.length <= numVowels) {
                        numConsonants -= lettersConsonants.length;
                        numVowels -= lettersVowels.length;
                        consonants = tmpConsonants;
                        vowels = tmpVowels;
                        logger('good candidate ' + specialCaseWord);
                        break;
                    } else {
                        lettersConsonants = [];
                        lettersVowels = [];
                        logger('not a good candidate ' + specialCaseWord);
                    }
                }
            } else {
                logger('problem with full dictionary');
            }
        } else {
            logger('game does not have enough letters for ' + specialCaseLength);
        }



        for (i = 0; i < numConsonants; i += 1) {
            index = Math.floor(Math.random() * consonants.length);
            letter = consonants[index];
            letters.push(letter);
            consonants.splice(index, 1);
        }

        letters = letters.concat(lettersConsonants);
        letters.LSortAlphabetically();
        result = result.concat(letters);
        letters = [];

        for (i = 0; i < numVowels; i += 1) {
            index = Math.floor(Math.random() * vowels.length);
            letter = vowels[index];
            letters.push(letter);
            vowels.splice(index, 1);
        }

        letters = letters.concat(lettersVowels);
        letters.LSortAlphabetically();
        result = result.concat(letters);
        letters = [];

        for (i = 0; i < numJokers; i += 1) {
            index = Math.floor(Math.random() * jokers.length);
            letter = jokers[index];
            letters.push(letter);
            jokers.splice(index, 1);
        }

        letters.LSortAlphabetically();
        result = result.concat(letters);

        return result;
    };

    this.initialize = function (callback) {
        var key,
            value,
            lettersReady = false,
            dictReady = false,
            done = function () {
                self.encodeMap = self.letters.encodeMap;

                for (key in self.encodeMap) {
                    if (self.encodeMap.hasOwnProperty(key)) {
                        value = self.encodeMap[key];
                        if (self.decodeMap[value]) {
                            throw new Error('Ambiguous key/value: ' + key + ' ' + value + ' current value ' + self.decodeMap[value]);
                        }
                        self.decodeMap[value] = key;
                    }
                }

                // initialize letter values and distributions
                for (key in self.letters.values) {
                    if (self.letters.values.hasOwnProperty(key)) {
                        self.letterValues[self.encodeMap[key] || key] = self.letters.values[key].value;
                        self.letterDistributions[self.encodeMap[key] || key] = self.letters.values[key].distribution;
                        self.allLetters.push(key);
                    }
                }

                // cache the full dictionary
                // FIXME: see how and when we need to invalidate the cache ...
                if (Dictionary.cache.hasOwnProperty(dictName)) {
                    self.fullDictionary = Dictionary.cache[dictName].fullDictionary;
                } else {
                    self.fullDictionary = self.getSolutionForProblem('*********************' /* 21 jokers */);
                    Dictionary.cache[dictName] = {
                        fullDictionary: self.fullDictionary
                    };
                }

                callback(null);
            };

        if (useAgent) {
            // if this script is running in the browser we support the dict.json and letter.js file downloads
            // this way we do not need to package all languages using browseify
            // download language specific files on demand
            superagent.get(url + '/' + letterName, function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                self.letters = eval(res.text); // jshint ignore:line
                lettersReady = true;
                if (lettersReady && dictReady) {
                    done();
                }
            });
            superagent.get(url + '/' + dictName, function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                self.dict = res.body;
                dictReady = true;
                if (lettersReady && dictReady) {
                    done();
                }
            });
        } else {
            // nodejs option
            self.letters = require('../' + letterName);
            lettersReady = true;
            self.dict = require('../' + dictName);
            dictReady = true;
            done();
        }
    };

    this.getDefineUrl = function (word, uiLang) {
        return Dictionary.getDefineUrl(word, uiLang, this.lang);
    };

    this.encode = function (letters) {
        var result = '',
            letter,
            i;

        for (i = 0; i < letters.length; i += 1) {
            letter = letters[i];
            result += self.encodeMap[letter] || letter;
        }

        return result;
    };

    this.encodeArray = function (letters) {
        var result = [],
            letter,
            i;

        for (i = 0; i < letters.length; i += 1) {
            letter = letters[i];
            result.push(self.encodeMap[letter] || letter);
        }

        return result;
    };

    this.decode = function (letters) {
        var result = '',
            letter,
            i;

        for (i = 0; i < letters.length; i += 1) {
            letter = letters[i];
            result += self.decodeMap[letter] || letter;
        }

        return result;
    };

    this.decodeArray = function (letters) {
        var result = [],
            letter,
            i;

        for (i = 0; i < letters.length; i += 1) {
            letter = letters[i];
            result.push(self.decodeMap[letter] || letter);
        }

        return result;
    };

    this.getWords = function (encodedAnagram) {
        var node = this.dict.root,
            i,
            sortedLetters,
            result = [];

        sortedLetters = encodedAnagram.split('').sort();

        for (i = 0; i < sortedLetters.length; i += 1) {
            if (node.hasOwnProperty(sortedLetters[i])) {
                node = node[sortedLetters[i]];
            } else {
                node = null;
                break;
            }
        }

        if (node) {
            result = node._ || [];
        }

        return result;
    };

    this.checkWord = function (word) {
        var encodedWord = this.encode(word),
            results = this.getWords(encodedWord);

        return results.indexOf(encodedWord) > -1;
    };

    this.countJokers = function (letters) {
        var numJokers = 0,
            len;

        len = letters.length;
        while (len--) {
            if (letters[len] === '*') {
                numJokers += 1;
            }
        }

        return numJokers;
    };

    this.getAllNLengthWords = function (length) {
        var result = [],
            node;

    };

    this.getAllWordsForAnagram = function (encodedAnagram, exactMatch) {
        var letters = encodedAnagram.split('').LSort(),
            key = letters.join(''),
            words;

        //if (exactMatch) {
        //    if (this.anagramCacheExactMatch[key] !== undefined) {
        //        return this.anagramCacheExactMatch[key];
        //    }
        //} else {
        //    if (this.anagramCacheAll[key] !== undefined) {
        //        return this.anagramCacheAll[key];
        //    }
        //}

        words = this.getSubWords(letters, exactMatch);
        words = words.LUnique();
        //words = mysortLengthAlphabetical(words);
        words.LSortByLength();

        //if (exactMatch) {
        //    this.anagramCacheExactMatch[key] = words;
        //} else {
        //    this.anagramCacheAll[key] = words;
        //}

        return words;
    };

    this.getSubWords = function (subword, exactMatch, node, letters, numJokers, usedJokers) {
        var results = [],

            nextLetter,
            nodeLetters,

            i,
            key,

            letter,
            nextSubword;

        letters = letters || '';
        numJokers = numJokers || this.countJokers(subword);
        usedJokers = usedJokers || 0;

        if (!subword ||
            (subword.length === 0 &&
            usedJokers === numJokers)) {
            return results;
        }

        if (!node) {
            node = this.dict.root;

            // strip jokers
            subword = subword.filter(function (i) {
                return i !== '*';
            });
        }

        nextLetter = subword.length > 1 ? subword[1] : '*'; // last letter in dictionary

        if (usedJokers < numJokers) {
            // use one joker
            nodeLetters = Object.keys(node).sort();
            // ASSUMPTION: nodelLetters are sorted alphabetically
            for (i = 0; i < nodeLetters.length; i += 1) {
                key = nodeLetters[i];
                if (key !== '_') {
                    results = results.concat(this.getSubWords(subword, exactMatch, node[key], letters + key, numJokers, usedJokers + 1));
                    if (node[key]._ !== undefined) {
                        results = results.concat(node[key]._);
                    }

                    if (key === nextLetter) {
                        break;
                    }
                }
            }
        }

        letter = subword[0];
        if (letter) {
            // exclude current letter
            nextSubword = subword.slice(1, subword.length);

            // take
            if (node[letter] !== undefined) {
                results = results.concat(this.getSubWords(nextSubword, exactMatch, node[letter], letters + letter, numJokers, usedJokers));
                if (node[letter]._ !== undefined) {
                    results = results.concat(node[letter]._);
                }
            }

            if (node._ !== undefined) {
                results = results.concat(node._);
            }

            if (!exactMatch) {
                // skip is allowed
                results = results.concat(this.getSubWords(nextSubword, exactMatch, node, letters, numJokers, usedJokers));
            }
        }

        return results;
    };


    this.getSolutionForProblem = function (letters) {
        var solution = self.getAllWordsForAnagram(letters),
            key,
            i,
            results = {
                problemId: letters.split('').sort().join('')
            };

        results.problem = self.decodeArray(results.problemId.split(''));
        results.problem.LSortAlphabetically();
        results.solution = solution;

        results.lang = self.lang;
        results.typeName = self.typeName;

        results.byLength = {};

        for (i = 0; i < solution.length; i += 1) {
            key = solution[i].length;
            if (!results.byLength[key]) {
                results.byLength[key] = [];
            }
            results.byLength[key].push({
                e: solution[i],
                d: self.decode(solution[i])
            });
        }

        return results;
    };
}

// Static functions and methods
Dictionary.cache = {};

Dictionary.processWords = function (words, letters, logger) {
    'use strict';

    var dict = {
            numWords: 0,
            numUniqueWords: 0,
            encode: {},
            decode: {},
            root: {}
        },
        node = dict.root,
        i,
        j,
        k,
        encodedWords,
        encodedWord,
        sortedEncodedWord,
        letter,

        shouldSkip,
        skipped = [],
        normalized;

    for (i = 0; i < words.length; i += 1) {
        // encode the word, then split letters to an array and sort them alphabetically.

        if (words[i].indexOf('\u0000') > -1 || words[i] === '') {
            //skip this word
            logger.debug('Skipped: ' + words[i]);
            continue;
        }

        shouldSkip = false;

        normalized = letters.normalize(words[i]);

        for (j = 0; j < normalized.length; j += 1) {
            if ((letters.isConsonant(normalized[j]) || letters.isVowel(normalized[j])) === false) {
                shouldSkip = true;
                break;
            }
        }

        if (shouldSkip) {
            skipped.push(words[i]);
            continue;
        }

        encodedWords = Dictionary.encodeWord(normalized, letters.encodeMap);

        for (j = 0; j < encodedWords.length; j += 1) {
            encodedWord = encodedWords[j];
            sortedEncodedWord = encodedWord.split('').sort();

            for (k = 0; k < sortedEncodedWord.length; k += 1) {
                letter = sortedEncodedWord[k];

                if (node.hasOwnProperty(letter) === false) {
                    node[letter] = {};
                }
                node = node[letter];
            }

            if (!node._) {
                node._ = [];
            }

            node._.push(encodedWord);

            //console.log(sortedEncodedWord, encodedWord, node._, node.$);

            node = dict.root;

            dict.numWords += 1;
        }

        dict.numUniqueWords += 1;
    }

    if (skipped.length > 0) {
        logger.warn('Skipped words: ', {metadata: skipped});
    }
    logger.info('Processed', {metadata: {numWords: dict.numWords, numUniqueWords: dict.numUniqueWords}});

    // translates words into a special dictionary format
    return dict;
};

Dictionary.encodeWord = function (word, encodeMap) {
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

        if (encodeMap.hasOwnProperty(currentLetter)) {
            currentEncodedLetter = encodeMap[currentLetter];
        } else {
            currentEncodedLetter = currentLetter;
        }

        if (i < word.length - 1) {
            doubleLetter = currentLetter + word[i + 1];
            if (encodeMap.hasOwnProperty(doubleLetter)) {
                currentEncodedDoubleLetter = encodeMap[doubleLetter];
            } else {
                currentEncodedDoubleLetter = '';
            }
        }

        if (i < word.length - 2) {
            tripleLetter = currentLetter + word[i + 1] + word[i + 2];
            if (encodeMap.hasOwnProperty(tripleLetter)) {
                currentEncodedTripleLetter = encodeMap[tripleLetter];
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
};

Dictionary.getDefineUrl = function (word, uiLang, dictLang) {
    'use strict';

    var defineUrl,
        links = {
            hu: {
                hu: 'http://wikiszotar.hu/wiki/magyar_ertelmezo_szotar/__word__',
                otherwise: 'http://szotar.sztaki.hu/search?fromlang=__dictLang__&tolang=all&fromlang=all&tolang=all&searchWord=__word__&langcode=en&u=0&langprefix=&searchMode=WORD_PREFIX&viewMode=full&ignoreAccents=0'
            },
            en: {
                en: 'https://www.google.com/search?q=define+__word__'
            }
        },
        otherwise = 'https://translate.google.com/#__dictLang__/__uiLang__/__word__'; // fallback to google translate

    uiLang = uiLang || dictLang;
    uiLang = uiLang.slice(0, 2);
    dictLang = dictLang.slice(0, 2);

    if (links.hasOwnProperty(uiLang)) {
        if (links[uiLang].hasOwnProperty(dictLang)) {
            defineUrl = links[uiLang][dictLang]
                .replace('__uiLang__', uiLang)
                .replace('__dictLang__', dictLang)
                .replace('__word__', word);
        } else if (links[uiLang].hasOwnProperty('otherwise')) {
            defineUrl = links[uiLang].otherwise
                .replace('__uiLang__', uiLang)
                .replace('__dictLang__', dictLang)
                .replace('__word__', word);
        }
    }

    defineUrl = defineUrl || otherwise
        .replace('__uiLang__', uiLang)
        .replace('__dictLang__', dictLang)
        .replace('__word__', word);

    return defineUrl;
};

function Score() {
    'use strict';

    // FIXME: This is just a sample scoring function.
    // FIXME: Can be user defined, or we may have a few scoring methods in the future
    this.score = function (tiles) {
        var result = 0,
            i,
            len = tiles.length;

        for (i = 0; i < len; i += 1) {
            result += tiles[i].value;
        }

        result += len * len;

        return result;
    };

}

module.exports = {
    Dictionary: Dictionary,
    Score: Score,
    version: require('../version')
};
