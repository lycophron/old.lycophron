/** @jsx React.DOM */
/* jshint quotmark:false */
/*globals React */
/**
 * @author lattmann / https://github.com/lattmann
 */

// TODO: this file has to be refactored!
// NOTE: this is my first JSX file ever, just learning JSX.
// This file will be refactored. Components will be in separate files.

var L = require('../../lib/lycophron'),
    dict = new L.Dictionary('hu-HU', true);

var Tile = React.createClass({displayName: "Tile",
    getInitialState: function () {
        'use strict';

        return {enabled: true};
    },
    handleClick: function (event) {
        'use strict';

        if (this.props.actionOnClick) {
            this.props.actionOnClick();
        }
    },
    render: function () {
        'use strict';

        var className = 'tile ' + (this.props.ldisabled ? 'disabled' : '');
        /*jshint ignore:saltsReady */
        return (
            React.createElement("div", {className: className, onClick: this.handleClick}, 
                React.createElement("div", {className: "letter"}, this.props.letter), 
                React.createElement("div", {className: "value"}, this.props.lvalue)
            )
        );
        /*jshint ignore:end */
    }
});


var Main = React.createClass({displayName: "Main",
    getSolution: function () {
        'use strict';

        return this.props.dict.getSolutionForProblem(this.props.dict.encodeArray(this.state.letters).join(''));
    },

    getInitialState: function () {
        'use strict';

        return {
            picked: [],
            enabledLetters: [],
            solution: {
                problemId: '',
                problem: [],
                solution: []
            },
            foundWords: [],
            words: [],
            lastWord: '',
            showSolutions: false
        };
    },

    actionNewProblem: function () {
        'use strict';

        var newState,
            i,
            len;

        this.state.letters = this.props.dict.drawLetters(10, 9, 0);

        newState = {
            picked: [],
            enabledLetters: [],
            solution: this.getSolution(),
            foundWords: [],
            words: [],
            lastWord: '',
            percentage: 0,
            showSolutions: false
        };

        //console.log(newState.solution);

        for (len in newState.solution.byLength) {
            newState.words[len] = newState.words[len] || {found:[], solutions: []};
            for (i = 0; i < newState.solution.byLength[len].length; i += 1) {
                // get all decoded solutions
                newState.words[len].solutions.push(newState.solution.byLength[len][i].d);
            }
            newState.words[len].allSolutions = newState.words[len].solutions.length;
        }

        newState.words.reverse();

        for (i = 0; i < this.state.letters.length; i += 1) {
            newState.enabledLetters.push(true);
        }

        this.setState(newState);
    },

    onKeyUp: function (event) {
        'use strict';
        var i,
            lastLetter = this.state.picked.length > 0 ? this.state.picked[this.state.picked.length - 1] : '';

        if (lastLetter) {
            if (event.which === 8 /* backspace */) {
                // put the last letter back
                for (i = 0; i < this.state.letters.length; i += 1) {
                    if (this.state.letters[i] === lastLetter &&
                        this.state.enabledLetters[i] === false) {

                        this.state.picked.splice(this.state.picked.length - 1, 1);
                        this.state.enabledLetters[i] = true;
                        this.setState(this.state);
                        break;
                    }
                }
            }
        }
    },

    onKeyPress: function (event) {
        'use strict';

        var i;

        this.state.showSolutions = false;
        this.setState(this.state);

        if (event.which === 13 /* enter */ ||
            event.which === 32 /* space */) {

            // clear
            this.actionOnClear();

        } else if (event.which === 63 /* ? */) {
            // show solutions
            this.state.showSolutions = true;
            this.setState(this.state);
        } else {
            // try to pick a letter

            for (i = 0; i < this.state.letters.length; i += 1) {
                if ((this.state.letters[i] === String.fromCharCode(event.which) ||
                    this.state.letters[i] === this.props.dict.decodeLetter(String.fromCharCode(event.which))) &&
                    this.state.enabledLetters[i]) {

                    this.actionOnClick(i);
                    break;
                }
            }
        }
    },

    actionShowSolutions: function () {
        'use strict';

        var newState = this.state;
        newState.showSolutions = true;
        this.setState(newState);
    },

    actionOnClear: function () {
        'use strict';

        var newState = this.state,
            i;

        newState.picked = [];
        newState.enabledLetters = [];

        for (i = 0; i < this.state.letters.length; i += 1) {
            newState.enabledLetters.push(true);
        }

        this.setState(newState);
    },

    actionOnClick: function (index) {
        'use strict';

        var word,
            newState = this.state,
            w,
            idx;

        if (this.state.enabledLetters[index]) {
            newState.picked.push(this.state.letters[index]);
            newState.enabledLetters[index] = false;
            newState.showSolutions = false;

            word = newState.picked.join('');

            if (this.props.dict.checkWord(word)) {
                newState.foundWords.push(word);

                newState.foundWords = newState.foundWords.LUnique();
                newState.foundWords.LSortByLength();

                newState.lastWord = word;

                w = newState.words[newState.words.length - 1 - newState.picked.length];
                if (w.solutions.indexOf(word) > -1 &&
                    w.found.indexOf(word) === -1) {

                    w.found.push(word);

                    idx = w.solutions.indexOf(word);
                    w.solutions.splice(idx, 1);
                }

                if (newState.solution.solution.length > 0) {
                    newState.percentage = Math.floor(newState.foundWords.length / newState.solution.solution.length * 100);
                } else {
                    newState.percentage = 0;
                }
            }

            this.setState(newState);
        }
    },

    componentWillMount: function () {
        'use strict';

        this.actionNewProblem();
    },

    componentDidMount: function () {
        'use strict';
        React.findDOMNode(this.refs.myTextInput).focus();
    },

    actionMainOnClick: function () {
        'use strict';
        React.findDOMNode(this.refs.myTextInput).focus();
    },

    render: function () {
        'use strict';

        var self = this,
            tiles = this.state.letters.map(function (letter, index) {
                return (
                    React.createElement(Tile, {actionOnClick: self.actionOnClick.bind(self, index), ldisabled: !self.state.enabledLetters[index], lvalue: self.props.dict.getLetterValue(letter), letter: letter, key: index})
                );
            }),
            pickedTiles = this.state.picked.map(function (letter, index) {
                return (
                    React.createElement(Tile, {lvalue: self.props.dict.getLetterValue(letter), letter: letter, key: index})
                );
            }),
            wordsByLength = this.state.words.map(function (elem, index) {
                return (
                    React.createElement("div", {key: index}, 
                        React.createElement("div", {className: "groupHeader"}, 
                            React.createElement("span", {className: "wordLength"}, self.state.words.length - 1 - index), 
                            React.createElement("span", {className: "solutions"}, elem.found.length, "/", elem.allSolutions), 
                            React.createElement("span", {className: "percentage"}, Math.floor(elem.found.length/elem.allSolutions * 100), "%")
                        ), 
                        React.createElement("div", null, elem.found.join(', ')), 
                        React.createElement("div", {className: "remainingSolutions", style: self.state.showSolutions ? {} : {display: 'none'}}, elem.solutions.join(', '))
                    )
                );
            }),
            inputStyle = {top: -100, left: -100, position: 'fixed'};


        return (
            React.createElement("div", {onClick: this.actionMainOnClick}, 
                React.createElement("input", {onKeyUp: this.onKeyUp, onKeyPress: this.onKeyPress, type: "text", ref: "myTextInput", style: inputStyle}), 
                React.createElement("div", {className: "header"}, 
                    React.createElement("div", null, " Problem Identifier: ", this.state.solution.problemId, " "), 
                    React.createElement("div", null, " Problem: ", this.state.solution.problem.map(function (e) { return e + ' (' + self.props.dict.encodeLetter(e) + ')'; }).join(', '), " "), 
                    React.createElement("div", null, " Solutions: ", this.state.solution.solution.length, " ", React.createElement("div", {className: "button", onClick: this.actionNewProblem}, "Create a new problem"), " ")

                ), 
                React.createElement("div", {className: "letters"}, 
                    React.createElement("div", {className: "consonants"}, 
                        tiles
                    ), 

                    React.createElement("div", {className: "button", onClick: this.actionOnClear}, "Clear picked tiles"), 

                    React.createElement("div", {className: "pickedTiles"}, 
                        pickedTiles
                    )
                ), 

                React.createElement("div", null, 
                    React.createElement("div", null, 
                        "Found words: ", this.state.foundWords.length, " ", this.state.percentage, "%" + ' ' +
                        "Last word: ", this.state.lastWord
                    ), 
                    React.createElement("div", {className: "button", onClick: this.actionShowSolutions}, "Show solutions"), 
                    React.createElement("div", null, wordsByLength), 
                    React.createElement("div", null, "All words:", 
                        React.createElement("div", null, this.state.foundWords.join(', '))
                    )
                )

            )
        );
    }
});


dict.initialize(function() {
    'use strict';
    React.initializeTouchEvents(true);
    React.render(
        React.createElement(Main, {dict: dict}),
        document.getElementById('content')
    );
});
