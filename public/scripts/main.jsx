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

var Tile = React.createClass({
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
        /*jshint ignore:start */
        return (
            <div className={className} onClick={this.handleClick}>
                <div className="letter">{this.props.letter}</div>
                <div className="value">{this.props.lvalue || ''}</div>
            </div>
        );
        /*jshint ignore:end */
    }
});

var JokerSelection = React.createClass({
    getInitialState: function () {
        'use strict';

        return {enabled: false};
    },
    handleClick: function (index) {
        'use strict';

        if (this.props.actionOnClick) {
            this.props.actionOnClick(index, this.props.allLetters[index]);
        }
    },
    render: function () {
        'use strict';

        var self = this,
            className = 'joker-selection ' + (this.props.ldisabled ? 'disabled' : ''),
            allLetters = this.props.allLetters.map(function (letter, index) {
                return (
                    <Tile actionOnClick={self.handleClick.bind(self, index)} lvalue={0} letter={letter} key={index}/>
                );
            });


        /*jshint ignore:start */
        return (
            <div className={className}>
                {allLetters}
            </div>
        );
        /*jshint ignore:end */
    }
});

var Main = React.createClass({
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

    actionNewProblem: function (consonants, vowels, jokers) {
        'use strict';

        var newState,
            i,
            len;

        this.state.letters = this.props.dict.drawLetters(consonants, vowels, jokers);

        newState = {
            userWord: [], // Joker is chosen
            picked: [], // Joker stored as *
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
            lastLetter = this.state.picked.length > 0 ? this.state.picked[this.state.picked.length - 1] : '',
            lastUserLetter = this.state.userWord.length > 0 ? this.state.userWord[this.state.userWord.length - 1] : '';

        if (event.which === 8 /* backspace */) {
            if (lastLetter) {
                if (lastLetter === lastUserLetter) {
                    // was not a joker or the joker was not selected

                    // put the last letter back
                    for (i = 0; i < this.state.letters.length; i += 1) {
                        if (this.state.letters[i] === lastLetter &&
                            this.state.enabledLetters[i] === false) {

                            this.state.picked.splice(this.state.picked.length - 1, 1);
                            this.state.userWord.splice(this.state.userWord.length - 1, 1);
                            this.state.enabledLetters[i] = true;
                            this.setState(this.state);
                            break;
                        }
                    }
                } else {
                    // it was a joker and value was selected, delete only the selection

                    this.state.userWord[this.state.userWord.length - 1] = '*';
                    this.setState(this.state);
                    this.checkWord();
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
            // if the previous letter was a joker than select a value for it
            if (this.state.letters.length > 0 &&
                this.state.letters[this.state.letters.length - 1] === '*' && /* JOKER */
                this.state.userWord[this.state.userWord.length - 1] === '*') {

                this.state.userWord[this.state.userWord.length - 1] = this.props.dict.decodeLetter(String.fromCharCode(event.which));

                this.checkWord();
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

        newState.userWord = [];
        newState.picked = [];
        newState.enabledLetters = [];

        for (i = 0; i < this.state.letters.length; i += 1) {
            newState.enabledLetters.push(true);
        }

        this.setState(newState);
    },

    checkWord: function () {
        'use strict';

        var word,
            newState = this.state,
            w,
            idx;

        newState.showSolutions = false;

        word = newState.userWord.join('');

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
    },

    actionOnClick: function (index) {
        'use strict';

        var newState = this.state;

        if (this.state.enabledLetters[index]) {
            newState.userWord.push(this.state.letters[index]);
            newState.picked.push(this.state.letters[index]);
            newState.enabledLetters[index] = false;

            this.setState(newState);

            this.checkWord();
        }
    },

    actionOnJokerClick: function (index, letter) {
        'use strict';
        //console.log(index, letter);

        var newState = this.state;
        newState.userWord[newState.userWord.length - 1] = letter;
        this.setState(newState);

    },

    componentWillMount: function () {
        'use strict';

        this.actionNewProblem(10, 9, 0);
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
                    <Tile actionOnClick={self.actionOnClick.bind(self, index)} ldisabled={!self.state.enabledLetters[index]} lvalue={self.props.dict.getLetterValue(letter)} letter={letter} key={index}/>
                );
            }),
            pickedTiles = this.state.userWord.map(function (letter, index) {
                return (
                    <Tile lvalue={self.state.picked[index] === '*' ? 0 : self.props.dict.getLetterValue(letter)} letter={letter} key={index}/>
                );
            }),
            wordsByLength = this.state.words.map(function (elem, index) {
                return (
                    <div className="group" key={index}>
                        <div className="header">
                            <span className="wordLength">{self.state.words.length - 1 - index}</span>
                            <span className="solutions">{elem.found.length}/{elem.allSolutions}</span>
                            <span className="percentage">{Math.floor(elem.found.length/elem.allSolutions * 100)}%</span>
                        </div>
                        <div>{elem.found.join(', ')}</div>
                        <div className="remainingSolutions" style={self.state.showSolutions ? {} : {display: 'none'}}>{elem.solutions.join(', ')}</div>
                    </div>
                );
            }),
            inputStyle = {top: -100, left: -100, position: 'fixed'};


        return (
            <div onClick={this.actionMainOnClick}>
                <input onKeyUp={this.onKeyUp} onKeyPress={this.onKeyPress} type="text" ref="myTextInput" style={inputStyle}></input>
                <div className="header">
                    <div> Problem Identifier: {this.state.solution.problemId} </div>
                    <div> Problem: {this.state.solution.problem.map(function (e) { return e + ' (' + self.props.dict.encodeLetter(e) + ')'; }).join(', ')} </div>
                    <div> Solutions: {this.state.solution.solution.length} </div>
                    <div className="button-group">
                        <div className="button" onClick={self.actionNewProblem.bind(self, 10, 9, 0)}>&gt; Create a new problem &lt;</div>
                        <div className="button" onClick={self.actionNewProblem.bind(self, 10, 8, 1)}>&gt; Create a new problem with joker &lt;</div>
                    </div>
                </div>
                <div className="letters">
                    <div className="consonants">
                        {tiles}
                    </div>

                    <div className="button" onClick={this.actionOnClear}>Clear picked tiles</div>

                    <div className="pickedTiles">
                        {pickedTiles}
                    </div>
                    <JokerSelection actionOnClick={self.actionOnJokerClick.bind(self)} allLetters={this.props.dict.getAllLetters()} ldisabled={this.state.userWord.length > 0 ? this.state.userWord[this.state.userWord.length - 1] !== '*' : true }>

                    </JokerSelection>
                </div>

                <div>
                    <div>
                        Found words: {this.state.foundWords.length} {this.state.percentage}%
                        Last word: {this.state.lastWord}
                    </div>
                    <div className="button" onClick={this.actionShowSolutions}>Show solutions</div>
                    <div>{wordsByLength}</div>
                    <div>All words:
                        <div>{this.state.foundWords.join(', ')}</div>
                    </div>
                </div>

            </div>
        );
    }
});


dict.initialize(function() {
    'use strict';
    React.initializeTouchEvents(true);
    React.render(
        <Main dict={dict}/>,
        document.getElementById('content')
    );
});
