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


var Word = React.createClass({displayName: "Word",
    render: function () {
        'use strict';
        return (
            React.createElement("div", null, 
                this.props.word
            )
        );
    }
});

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

        return this.props.dict.getSolutionForProblem(this.props.dict.encodeArray(this.props.letters).join(''));
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
            foundWords: []
        };
    },

    actionNewProblem: function () {
        'use strict';

        var newState,
            i;

        this.props.letters = this.props.dict.drawLetters(10, 9, 0);

        newState = {
            picked: [],
            enabledLetters: [],
            solution: this.getSolution(),
            foundWords: [],
            percentage: 0
        };

        console.log(newState.solution);

        for (i = 0; i < this.props.letters.length; i += 1) {
            newState.enabledLetters.push(true);
        }

        this.setState(newState);
    },

    actionOnClear: function () {
        'use strict';

        var newState = this.state,
            i;

        newState.picked = [];
        newState.enabledLetters = [];

        for (i = 0; i < this.props.letters.length; i += 1) {
            newState.enabledLetters.push(true);
        }

        this.setState(newState);
    },

    actionOnClick: function (index) {
        'use strict';

        var word,
            newState = this.state;

        if (this.state.enabledLetters[index]) {
            newState.picked.push(this.props.letters[index]);
            newState.enabledLetters[index] = false;

            word = newState.picked.join('');

            if (this.props.dict.checkWord(word)) {
                newState.foundWords.push(word);

                newState.foundWords = newState.foundWords.LUnique();
                newState.foundWords.LSortByLength();


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

        //console.log(this.props.dict.getSolutionForProblem(this.props.dict.encodeArray(this.props.letters).join('')));
    },

    render: function () {
        'use strict';

        var self = this,
            tiles = this.props.letters.map(function (letter, index) {
                return (
                    React.createElement(Tile, {actionOnClick: self.actionOnClick.bind(self, index), ldisabled: !self.state.enabledLetters[index], lvalue: self.props.dict.getLetterValue(letter), letter: letter, key: index})
                );
            }),
            pickedTiles = this.state.picked.map(function (letter, index) {
                return (
                    React.createElement(Tile, {lvalue: self.props.dict.getLetterValue(letter), letter: letter, key: index})
                );
            }),
            words = this.state.foundWords.map(function (word, index) {
                return (
                    React.createElement(Word, {word: word, key: index})
                );
            });


        return (
            React.createElement("div", null, 
                React.createElement("div", {className: "header"}, 
                    React.createElement("div", null, " Problem Identifier: ", this.state.solution.problemId, " "), 
                    React.createElement("div", null, " Problem: ", this.state.solution.problem.join(', '), " "), 
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
                    React.createElement("div", null, "Found words: ", this.state.foundWords.length, " ", this.state.percentage, "% "), 
                    React.createElement("div", null, words)
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
