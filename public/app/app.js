/*globals angular, console, require, io, i18n*/
/**
 * @author lattmann / https://github.com/lattmann
 */

// TODO: this file has to be split and refactored!!!

// application library
var L = require('../../lib/lycophron');
var isoLanguages = require('../libs/isoLanguages');

// html templates
angular.module('templates', []);
require('./templates');

angular.module('jm.i18next').config(function ($i18nextProvider) {
    'use strict';

    $i18nextProvider.options = {
        //lng: 'de', // If not given, i18n will detect the browser language.
        fallbackLng: 'en', // Default is dev
        useCookie: true,
        useLocalStorage: false,
        localStorageExpirationTime: 86400000, // in ms, default 1 week
        resGetPath: '../../locales/__lng__/__ns__.json'
    };

});

angular.module('LycoprhonApp', ['ngRoute', 'ngMaterial', 'jm.i18next', 'templates'])

    .config(function ($mdThemingProvider) {
        'use strict';
        //$mdThemingProvider.theme('default')
        //    .primaryPalette('brown', {
        //        //'default': '400', // by default use shade 400 from the amber palette for primary intentions
        //        //'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
        //        //'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
        //        //'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
        //    })
        //    // If you specify less than all of the keys, it will inherit from the
        //    // default shades
        //    .accentPalette('orange', {
        //        'default': '200' // use shade 200 for default, and keep all other shades the same
        //    });
    })

    .controller('MainController', function ($scope, $route, $routeParams, $location, $mdSidenav, $i18next, $timeout) {
        'use strict';

        console.log('MainController');
        $scope.$route = $route;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;

        $scope.menuItems = [
            {
                url: '/home/',
                text: 'menu.home'
            },
            {
                url: '/game/single/wizard/',
                text: 'menu.singlePlayer'
            },
            {
                url: '/game/multiplayer/',
                text: 'menu.multiplayer'
            },
            //{
            //    url: '/stats/',
            //    text: 'menu.statistics'
            //},
            {
                url: '/auth/logout/',
                text: 'login.logoutText'
            }
        ];

        $scope.selected = $scope.menuItems[0];

        $scope.toggleSidenav = function (menuId) {
            $mdSidenav(menuId).toggle();
        };

        $scope.selectMenuItem = function (menuItem) {
            $scope.selected = angular.isNumber(menuItem) ? $scope.menuItems[menuItem] : menuItem;
            $mdSidenav('left').close();
        };

        $scope.i18nextReady = false;

        $scope.$on('i18nextLanguageChange', function () {
            //console.log('Language has changed!');
            if (!$scope.i18nextReady) {
                $timeout(function () {
                    $scope.i18nextReady = true;
                }, 500);
            }
        });

        $scope.changeLng = function (lng) {
            $i18next.options.lng = lng;
            //console.log($i18next.debugMsg[$i18next.debugMsg.length - 1]);
        };

        // TODO: get user
        //$scope.username = 'anonymous';

    })

    .controller('HomeController', function ($scope, $routeParams) {
        'use strict';

        $scope.name = 'HomeController';
        $scope.params = $routeParams;

        console.log($scope.name);
    })

    .controller('StatsController', function ($scope, $routeParams) {
        'use strict';

        $scope.name = 'StatsController';
        $scope.params = $routeParams;

        console.log($scope.name);
    })

    .controller('GameSinglePlayerController', function ($scope, $routeParams, $route) {
        'use strict';

        $scope.name = 'GameSinglePlayerController';
        $scope.params = $routeParams;

        //console.log($scope.name);
        //console.log($scope.params);

        $scope.onNewGame = function () {
            $route.reload();
        };

        $scope.onFoundWord = function () {

        };

        $scope.onNewLettersReady = function (letters) {

        };

        $scope.onGameReady = function (solutions) {

        };
    })

    .controller('SingleWizardController', function ($scope, $routeParams, $http, $location, $i18next) {
        'use strict';

        $scope.name = 'SingleWizardController';
        $scope.params = $routeParams;

        // TODO: extract business logic min/max/default num of consonants, vowels, jokers
        $scope.game = {
            title: $i18next('game.defaultTitle'),
            gameType: 'anagramProblem',
            language: null,
            numConsonants: 10,
            numVowels: 9,
            numJokers: 0
        };

        $scope.createNew = function () {
            var url = '/game/' + $scope.game.gameType + '/single/' + $scope.game.language.name + '/' + $scope.game.language.type +
                '/?consonants=' + $scope.game.numConsonants + '&vowels=' + $scope.game.numVowels + '&jokers=' + $scope.game.numJokers;
            // FIXME: how to navigate to a route nicely
            //$location.path('/game/{{gameType}}/single/{{language.name}}/{{language.type}}/?consonants={{numConsonants}}&vowels={{numVowels}}&jokers={{numJokers}}');
            $location.url(url);
        };
    })

    .controller('MultiplayerController', function ($scope, $routeParams, $timeout, $route, $http, $location, $i18next, $mdDialog) {
        'use strict';

        var socket = io.connect({forceNew: true}),
            requiresSignIn = true;

        $scope.name = 'MultiplayerController';
        $scope.params = $routeParams;

        $scope.availableUsers = [];
        $scope.availableRooms = [];

        $scope.currentUser = null;
        $scope.currentRoom = null;
        $scope.currentRoomId = null;
        $scope.newRoom = null; // initializer is below
        $scope.wizardShown = false;

        $scope.connectionStatus = 'multiplayer.connecting';

        function forceDigestCycle() {
            // Angular is unaware of data updates outside the "angular world,
            // the timeout will force a new digest cycle.
            $timeout(function () {
            });
        }

        socket.on('connect', function () {
            if (requiresSignIn && $scope.currentUser) {
                socket.emit('signIn', $scope.currentUser);
                requiresSignIn = false;
                $scope.connectionStatus = 'multiplayer.connected';
            }
            $scope.connectionStatus = 'multiplayer.connected';

            $scope.connected = true;
            forceDigestCycle();
        });

        socket.on('disconnect', function () {
            $scope.connectionStatus = 'multiplayer.disconnected';
            requiresSignIn = true;

            $scope.currentRoomId = null;
            updateCurrentRoom();

            $scope.connected = false;
            forceDigestCycle();
        });

        $scope.$on('$destroy', function() {
            socket.disconnect();
        });

        socket.on('userAvailable', function (data) {
            console.log('userAvailable', data);
        });

        socket.on('userLeft', function (data) {
            console.log('userLeft', data);
        });

        socket.on('availableUsers', function (data) {
            console.log('availableUsers', data);
            $scope.availableUsers = data;

            forceDigestCycle();
        });

        socket.on('availableRooms', function (data) {
            console.log('availableRooms', data);
            $scope.availableRooms = data;

            updateCurrentRoom();

            forceDigestCycle();
        });

        $scope.newRoomWizard = function () {
            $scope.wizardShown = true;
        };

        $scope.cancelWizard = function () {
            $scope.wizardShown = false;
        };

        $scope.createRoom = function (room, doNotJoin) {
            var i;
            // FIXME: any race conditions here?
            room.id = 'multiplayer_' + (new Date()).toISOString();

            for (i = 0; i < $scope.availableUsers.length; i += 1) {
                if ($scope.availableUsers[i].selected) {
                    room.allowedUsers.push($scope.availableUsers[i].id);
                }
            }

            if (room.allowedUsers.length > 0) {
                // grant access to the owner too.
                room.allowedUsers.push(room.owner.id);
            }

            socket.emit('createRoom', room);

            if (!doNotJoin) {
                // try to join to the created room
                $scope.joinRoom(room.id);
            }
            $scope.wizardShown = false;
        };

        function updateCurrentRoom() {
            var i;

            if ($scope.currentRoomId) {
                for (i = 0; i < $scope.availableRooms.length; i += 1) {
                    if ($scope.availableRooms[i].id === $scope.currentRoomId) {
                        $scope.currentRoom = $scope.availableRooms[i];
                        $scope.toogleSolutions($scope.currentRoom.visibleSolutions);
                    }
                }
            } else {
                $scope.currentRoom = null;
                stopGame();
            }
        }

        $scope.joinRoom = function (roomId) {
            var i;
            if (roomId) {
                socket.emit('joinRoom', roomId);

                $scope.currentRoomId = roomId;

                updateCurrentRoom();

                // FIXME: on success only
                //$location.path('/game/multiplayer/' + roomId);
            }
        };

        $scope.leaveRoomWithConfirm = function (roomId, ev) {

            if ($scope.currentRoom.owner.id === $scope.currentUser.id) {
                // if we are the owner, then get confirmation
                var confirm = $mdDialog.confirm()
                    //.parent(angular.element(document.body))
                    .title($i18next('multiplayer.leavingRoom.title'))
                    .content($i18next('multiplayer.leavingRoom.content'))
                    .ariaLabel('LeavingRoomConfirm')
                    .ok($i18next('confirm'))
                    .cancel($i18next('cancel'))
                    .targetEvent(ev);

                $mdDialog.show(confirm).then(function () {
                    // user wants to leave
                    $scope.leaveRoom(roomId);
                }, function () {
                    // user decided to stay

                });
            } else {
                $scope.leaveRoom(roomId);
            }

        };

        $scope.leaveRoom = function (roomId) {
            socket.emit('leaveRoom', roomId);
            $scope.currentRoomId = null;

            updateCurrentRoom();

            $location.path('/game/multiplayer/');
        };


        $http.get('/auth/').
            success(function (data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                //console.log(data);
                data.id = data.id || 'anonymous_' + (new Date()).toISOString();
                data.displayName = data.displayName || 'anonymous';

                $scope.currentUser = data;

                if (requiresSignIn && $scope.currentUser) {
                    socket.emit('signIn', $scope.currentUser);
                    requiresSignIn = false;
                }

                // default
                var numRoomsToGenerate = Math.floor(Math.random() * 20) + 30;
                //numRoomsToGenerate = 0;
                numRoomsToGenerate = 1;
                console.log(numRoomsToGenerate);
                for (var i = 0; i < numRoomsToGenerate; i += 1) {
                    var langName = 'hu-HU',
                        langType = 'default';
                    $timeout(function () {
                        $scope.createRoom({
                            title: $i18next('multiplayer.defaultRoomName') + ' ' + Math.floor(Math.random() * 9000 + 1000),
                            owner: $scope.currentUser,
                            state: 'waitingForUsers',
                            gameType: 'anagramProblem',
                            language: {
                                fullName: isoLanguages.getLanguageNativeName(langName) + ' (' + $i18next('dictType.' + langType) + ')',
                                name: langName,
                                numWords: 115654,
                                type: langType
                            },
                            numConsonants: 10,
                            numVowels: 9,
                            numJokers: 0,
                            letters: null,
                            allowedUsers: []
                        }, true);
                    }, 10);
                }
                $scope.newRoom = {
                    title: $i18next('multiplayer.defaultRoomName') + ' ' + Math.floor(Math.random() * 9000 + 1000),
                    owner: $scope.currentUser,
                    state: 'waitingForUsers',
                    gameType: 'anagramProblem',
                    language: null,
                    numConsonants: 10,
                    numVowels: 9,
                    numJokers: 0,
                    letters: null,
                    allowedUsers: []
                };
            }).
            error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.error('cannot retrieve /auth/ info');
            });

        socket.on('foundWord', function (data) {
            var i,
                key,
                thisUser = $scope.userWords[data.user];
            // another user has found a word

            // user
            // length
            // word

            thisUser = thisUser || {};
            thisUser.id = thisUser.id || data.user;
            thisUser.name = 'unknown';

            for (i = 0; i < $scope.availableUsers.length; i += 1) {
                if ($scope.availableUsers[i].id === data.user) {
                    thisUser.name = $scope.availableUsers[i].displayName;
                    break;
                }
            }

            if (data.length) {
                thisUser.words = thisUser.words || {};
                thisUser.words[data.length] = thisUser.words[data.length] || [];
                thisUser.words[data.length].push(data.word);

                if (thisUser.numFoundWords) {
                    thisUser.numFoundWords += 1;
                } else {
                    thisUser.numFoundWords = 1;
                }
            } else {
                thisUser.numFoundWords = 0;
            }

            if (thisUser.numSolution === undefined &&
                $scope.solutions) {
                updateUserPercentage(thisUser);
            }

            $scope.userWords[data.user] = thisUser;

            forceDigestCycle();
        });

        function updateUserPercentage(thisUser) {
            thisUser.numSolution = thisUser.numSolution || $scope.solutions.solution.length;
            thisUser.percentage = Math.floor(thisUser.numFoundWords / thisUser.numSolution * 10000) / 100;
        }

        $scope.startNewGame = function () {
            var options = {
                lang: $scope.currentRoom.language.name,
                type: $scope.currentRoom.language.type,
                consonants: $scope.currentRoom.numConsonants,
                vowels: $scope.currentRoom.numVowels,
                jokers: $scope.currentRoom.numJokers
            };
            startGame(options);

            forceDigestCycle();
        };

        $scope.finishGame = function () {
            stopGame();
        };

        socket.on('startGame', function (options) {
            startGame(options);

            forceDigestCycle();
        });

        $scope.toogleSolutions = function (newValue, send) {
            $scope.gameOptions = $scope.gameOptions || {};

            if (newValue === true || newValue === false) {

                $scope.gameOptions.visibleSolutions = newValue;
            } else {
                $scope.gameOptions.visibleSolutions = !$scope.gameOptions.visibleSolutions;
            }
            if ($scope.gameOptions.visibleSolutions) {
                $scope.solutionsText = 'game.hideSolutions';
            } else {
                $scope.solutionsText = 'game.showSolutions';
            }

            if (send) {
                $scope.sendSolutionVisibility();
            }
        };

        $scope.sendSolutionVisibility = function () {
            socket.emit('roomStateUpdate', {roomId: $scope.currentRoomId, roomUpdate: {visibleSolutions: $scope.gameOptions.visibleSolutions}});
        };

        function stopGame() {
            $scope.gameIsRunning = false;
            socket.emit('roomStateUpdate', {roomId: $scope.currentRoomId, state: 'finished'});

            // TODO: how to show winner?
        }

        function startGame(options) {
            $scope.gameIsRunning = true;

            $scope.userWords = {};
            $scope.solutions = null;

            $scope.gameOptions = JSON.parse(JSON.stringify(options)); // we need a deep copy
            $scope.gameOptions.multiplayer = true;
            $scope.gameOptions.userWords = $scope.userWords;
            $scope.gameOptions.currentUser = $scope.currentUser;

            $scope.onNewGame = function () {
                // FIXME: we should not use the $route.reload for new game, but this is the only option for now
                $route.reload();
            };

            $scope.onFoundWord = function (length, word) {
                socket.emit('foundWord', {user: $scope.currentUser.id, length: length, word: word});
            };

            $scope.onNewLettersReady = function (letters) {
                if (options.letters) {
                    // slave mode
                } else {
                    // master mode
                    options.letters = letters;
                    socket.emit('startGame', options);
                    socket.emit('roomStateUpdate', {roomId: $scope.currentRoomId, roomUpdate: {state: 'running', letters: letters, visibleSolutions: false}});
                    $scope.toogleSolutions(false, true);
                }
            };

            $scope.onGameReady = function (solutions) {
                var key;
                //console.log(solutions);
                $scope.solutions = solutions;
                socket.emit('foundWord', {user: $scope.currentUser.id, length: 0, word: ''});

                for (key in $scope.userWords) {
                    if ($scope.userWords.hasOwnProperty(key)) {
                        updateUserPercentage($scope.userWords[key]);
                    }
                }
            };

        }
    })

    .directive('tile', function () {
        'use strict';

        return {
            require: '^tileGroup',
            restrict: 'E',
            scope: {
                tile: '=tile',
                joker: '=joker'
            },
            templateUrl: 'tile.html'
        };
    })

    .directive('gameWizard', function () {
        'use strict';

        return {
            restrict: 'E',
            scope: {
                game: '=game',
                onCreate: '&onCreate'
            },
            templateUrl: 'gameWizard.html',
            controller: function ($scope, $http, $i18next, $timeout) {

                $scope.onCreateNew = function () {
                    $scope.onCreate()($scope.game);
                };

                $scope.gameTypes = ['anagramProblem'];

                $scope.loadLanguages = function () {

                    // TODO: service to get languages
                    return $http.get('/locales/info.json').
                        success(function (data, status, headers, config) {
                            // this callback will be called asynchronously
                            // when the response is available
                            var langCodes = Object.keys(data),
                                language,
                                types,
                                i,
                                j;

                            $scope.languages = [];

                            for (i = 0; i < langCodes.length; i += 1) {
                                types = Object.keys(data[langCodes[i]].types);
                                for (j = 0; j < types.length; j += 1) {
                                    language = {
                                        name: langCodes[i],
                                        type: types[j],
                                        fullName: isoLanguages.getLanguageNativeName(langCodes[i]) + ' (' + $i18next('dictType.' + types[j]) + ')',
                                        numWords: data[langCodes[i]].types[types[j]].numWords
                                    };
                                    $scope.languages.push(language);

                                    if (!$scope.game.language &&
                                        (langCodes[i] === i18n.lng() || langCodes[i].slice(0, 2) === i18n.lng())) {
                                        $scope.game.language = language;
                                    }
                                }
                            }

                            $scope.languages.sort(function (a, b) {
                                return a.fullName.localeCompare(b.fullName);
                            });

                            // select a language based on our best guess
                            $scope.state = 'ready';
                        }).
                        error(function (data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            $scope.state = 'failedToLoadLanguages';
                        });
                };

                $scope.state = 'loadingLanguages';
                //$timeout($scope.loadLanguages, 6000);
                $scope.loadLanguages();
            }
        };
    })

    .directive('rooms', function () {
        'use strict';

        return {
            restrict: 'E',
            scope: {
                rooms: '=rooms',
                currentUser: '=currentUser',
                onJoin: '&onJoin'
            },
            templateUrl: 'rooms.html',
            controller: function ($scope) {

                $scope.onJoinToRoom = function (roomId) {
                    $scope.onJoin()(roomId);
                };
            }
        };
    })

    .directive('tileGroup', function () {
        'use strict';

        return {
            restrict: 'E',
            scope: {
                tiles: '=tiles',
                joker: '=joker',
                onSelected: '&onSelected'
            },
            templateUrl: 'tileGroup.html',
            controller: function ($scope) {
                $scope.onClick = function (idx) {
                    // propagate selected tile
                    $scope.onSelected()(idx, $scope.tiles[idx]);
                };
            }
        };
    })

    .directive('game', function () {
        'use strict';

        return {
            restrict: 'E',
            scope: {
                options: '=',
                onNewGame: '&',
                onFoundWord: '&',
                onNewLettersReady: '&',
                onGameReady: '&'
            },
            templateUrl: 'game.html',
            controller: function ($scope, $timeout, $window) {

                // TODO: validate options!
                $scope.gameIsReady = false;
                $scope.longProcess = false;

                $scope.state = 'game.loading';

                // ui related
                $scope.showJoker = false;
                $scope.typedLetters = '';
                $scope.typedLettersPrev = '';

                $scope.problemText = '';
                $scope.word = '';
                $scope.words = [];
                $scope.score = {
                    sum: 0,
                    last: 0
                };
                $scope.foundWords = [];
                $scope.newlyFound = false;
                $scope.alreadyFound = false;
                $scope.foundWordId = -1;

                $scope.percentage = 0;
                $scope.lastWord = '';
                $scope.message = '';

                // game related
                $scope.solutions = {};
                $scope.problemTiles = [];
                $scope.selectedTiles = [];

                checkWord();

                $scope.jokerSelected = function (idx, tile) {

                    $scope.typedLetters += tile.letter;
                    $scope.typedLettersPrev = $scope.typedLetters;
                    $scope.selectedTiles[$scope.selectedTiles.length - 1].letter = tile.letter;

                    checkWord();

                    $scope.showJoker = false;
                };

                $scope.letterSelected = function (idx, tile) {
                    //console.log(idx, tile);

                    if (tile.disabled) {
                        return;
                    }

                    // disable letter
                    tile.disabled = true;

                    // add it
                    addToSelection(tile.letter, tile.value);

                    $scope.showJoker = tile.letter === '*';
                };

                $scope.inputChanged = function () {
                    var newLetter,
                        decodedLetter,
                        i;
                    // we do not get any input arguments

                    // figure out the new letter
                    if ($scope.typedLettersPrev.length > $scope.typedLetters.length) {
                        // last letter was deleted
                        $scope.typedLetters = $scope.typedLettersPrev;
                        $scope.removeLastLetter();
                        return;
                    }

                    if ($scope.typedLettersPrev.length + 1 !== $scope.typedLetters.length) {
                        // FIXME: we accept exactly one new character
                        $scope.typedLetters = $scope.typedLettersPrev;
                        return;
                    }

                    newLetter = $scope.typedLetters[$scope.typedLetters.length - 1];
                    if (newLetter === '7' /* JOKER */) {
                        newLetter = '*';
                        $scope.typedLetters[$scope.typedLetters.length - 1] = newLetter;
                    }

                    decodedLetter = dict.decodeLetter(newLetter);

                    $scope.typedLetters = $scope.typedLetters.slice(0, -newLetter.length);
                    $scope.typedLettersPrev = $scope.typedLetters;

                    if (newLetter === ' ') {
                        // FIXME [BUG]: ng-change does not fire on space
                        // space will remove all letters and wait for the next one
                        $scope.removeAllLetters();
                        return;
                    }

                    if (newLetter === '?') {
                        $scope.typedLetters = $scope.typedLettersPrev;
                        $scope.showSolutions();
                        return;
                    }


                    if ($scope.showJoker) {
                        // see if it is a valid letter or not
                        // FIXME [OPT]: there is probably a faster way to do this.
                        for (i = 0; i < $scope.jokerTiles.length; i += 1) {
                            if ($scope.jokerTiles[i].letter === decodedLetter) {
                                $scope.jokerSelected(i, $scope.jokerTiles[i]);
                                break;
                            }
                        }
                    } else {
                        // see if it is a valid letter or not
                        for (i = 0; i < $scope.problemTiles.length; i += 1) {
                            if ($scope.problemTiles[i].disabled === false &&
                                $scope.problemTiles[i].letter === decodedLetter) {
                                $scope.letterSelected(i, $scope.problemTiles[i]);
                                break;
                            }
                        }
                    }
                };

                function addToSelection(letter, value) {
                    $scope.typedLetters += letter;
                    $scope.typedLettersPrev = $scope.typedLetters;
                    $scope.selectedTiles.push({letter: letter, value: value});

                    // check new word
                    checkWord();
                }

                function checkWord() {
                    var w,
                        idx,
                        lenBefore,
                        lenAfter;

                    $scope.options.visibleSolutions = false;

                    $scope.score.last = 0;

                    $scope.word = $scope.selectedTiles.map(function (tile, index) {
                        return tile.letter;
                    }).join('');

                    $scope.newlyFound = false;
                    $scope.alreadyFound = false;
                    $scope.foundWordId = -1;

                    if ($scope.word) {
                        if (dict.checkWord($scope.word)) {
                            $scope.lastWord = $scope.word;
                            $scope.message = '';

                            lenBefore = $scope.foundWords.length;
                            $scope.foundWords.push($scope.word);

                            $scope.foundWords = $scope.foundWords.LUnique();
                            $scope.foundWords.LSortAlphabetically();
                            lenAfter = $scope.foundWords.length;

                            $scope.score.last = $scope.scoring.score($scope.selectedTiles);

                            if (lenBefore === lenAfter) {
                                $scope.newlyFound = false;
                                $scope.alreadyFound = true;
                            } else {
                                $scope.newlyFound = true;
                                $scope.alreadyFound = false;

                                // new word found
                                $scope.score.sum += $scope.score.last;
                                $scope.onFoundWord()($scope.selectedTiles.length, $scope.word);
                            }
                            $scope.foundWordId = $scope.foundWords.indexOf($scope.word);


                            w = $scope.words[$scope.words.length - 1 - $scope.selectedTiles.length];
                            if (w.solutions.indexOf($scope.word) > -1 &&
                                w.found.indexOf($scope.word) === -1) {

                                w.found.push($scope.word);
                                w.found.LSortAlphabetically();

                                idx = w.solutions.indexOf($scope.word);
                                w.solutions.splice(idx, 1);

                                w.percentage = Math.floor(w.found.length / w.allSolutions * 10000) / 100;
                            }

                            if ($scope.solutions.solution.length > 0) {
                                $scope.percentage = Math.floor($scope.foundWords.length / $scope.solutions.solution.length * 10000) / 100;
                            } else {
                                $scope.percentage = 0;
                            }


                        } else {
                            $scope.message = 'game.wordDoesNotExist';
                        }
                    } else {
                        $scope.message = 'game.selectLetterOrType';
                    }
                }

                $scope.removeLastLetter = function() {
                    var i,
                        letterToPutBack,
                        len;

                    if ($scope.typedLetters.length > 0 &&
                        $scope.selectedTiles.length > 0) {
                        if ($scope.selectedTiles[$scope.selectedTiles.length - 1].value === 0 && /* joker */
                            $scope.typedLetters[$scope.typedLetters.length - 1] !== '*') {

                            len = $scope.selectedTiles[$scope.selectedTiles.length - 1].letter.length;

                            $scope.selectedTiles[$scope.selectedTiles.length - 1].letter = '*';

                            checkWord();

                            $scope.typedLetters = $scope.typedLetters.slice(0, -len);
                            $scope.typedLettersPrev = $scope.typedLetters;

                            $scope.showJoker = true;
                        } else {
                            letterToPutBack = $scope.selectedTiles[$scope.selectedTiles.length - 1].letter;
                            // delete last letter

                            $scope.typedLetters = $scope.typedLetters.slice(0, -letterToPutBack.length);
                            $scope.typedLettersPrev = $scope.typedLetters;
                            $scope.selectedTiles.pop();

                            checkWord();

                            $scope.showJoker = false;

                            // enable letter that we put back
                            for (i = 0; i < $scope.problemTiles.length; i += 1) {
                                if ($scope.problemTiles[i].disabled &&
                                    $scope.problemTiles[i].letter === letterToPutBack) {

                                    $scope.problemTiles[i].disabled = false;
                                    break;
                                }
                            }
                        }
                    }
                };

                $scope.removeAllLetters = function () {
                    var i;

                    $scope.showJoker = false;
                    $scope.typedLetters = '';
                    $scope.typedLettersPrev = $scope.typedLetters;
                    // clear array
                    $scope.selectedTiles = void 0;
                    $scope.selectedTiles = [];

                    checkWord();

                    for (i = 0; i < $scope.problemTiles.length; i += 1) {
                        $scope.problemTiles[i].disabled = false;
                    }
                };

                $scope.removeAllLetters();

                $scope.newGame = function () {
                    $scope.onNewGame()();
                };

                $scope.showSolutions = function () {
                    $scope.options.visibleSolutions = true;
                };

                // FIXME: turn timeouts into promises
                // FIXME: add failure states
                // 50ms, let the browser draw our updated state
                var timeoutValue = 50;
                var dict;
                $timeout(function () {
                    dict = new L.Dictionary($scope.options.lang + '/' + $scope.options.type, true /* use superagent */);
                    $scope.navigateToDefinition = function (word) {
                        var url = dict.getDefineUrl(encodeURIComponent(word), i18n.lng());
                        $window.open(url);
                    };

                    // TODO: select scoring function
                    $scope.scoring = new L.Score();

                    $scope.state = 'game.downloading';
                    $scope.longProcess = true;

                    dict.initialize(function () {
                        $scope.jokerTiles = dict.getAllLetters().map(function (letter, index) {
                            if (letter !== '*') {
                                return {letter: letter, value: dict.getLetterValue(letter), disabled: false};
                            }
                        });

                        $timeout(function () {
                            $scope.state = 'game.drawingLetters';
                            $scope.longProcess = false;

                            $timeout(function () {
                                if ($scope.options.letters) {
                                    // we got letters
                                    $scope.letters = $scope.options.letters;
                                } else {
                                    // we need to draw letters
                                    $scope.letters = dict.drawLetters($scope.options.consonants, $scope.options.vowels, $scope.options.jokers);
                                }
                                $scope.state = 'game.solvingProblem';
                                $scope.longProcess = true;

                                $timeout(function () {
                                    var len,
                                        i;

                                    $scope.onNewLettersReady()($scope.letters);

                                    $scope.solutions = dict.getSolutionForProblem(dict.encodeArray($scope.letters).join(''));

                                    for (len in $scope.solutions.byLength) {
                                        $scope.words[len] = $scope.words[len] || {
                                            found: [],
                                            solutions: [],
                                            percentage: 0
                                        };
                                        for (i = 0; i < $scope.solutions.byLength[len].length; i += 1) {
                                            // get all decoded solutions
                                            $scope.words[len].solutions.push($scope.solutions.byLength[len][i].d);
                                        }
                                        $scope.words[len].solutions = $scope.words[len].solutions.LUnique();
                                        $scope.words[len].solutions.LSortAlphabetically();
                                        $scope.words[len].allSolutions = $scope.words[len].solutions.length;
                                    }

                                    $scope.words.reverse();

                                    $scope.state = 'ready';
                                    $scope.longProcess = false;

                                    $timeout(function () {
                                        $scope.gameIsReady = true;

                                        $scope.problemTiles = $scope.letters.map(function (letter, index) {
                                            return {
                                                letter: letter,
                                                value: dict.getLetterValue(letter),
                                                disabled: false
                                            };
                                        });

                                        $scope.problemText = $scope.letters.map(function (letter, index) {
                                            return letter === dict.encodeLetter(letter) ? letter : letter + '(' + dict.encodeLetter(letter) + ')';
                                        }).join(', ');

                                        $scope.onGameReady()($scope.solutions);
                                        //console.log($scope.solutions);
                                    }, timeoutValue);
                                }, timeoutValue);
                            }, timeoutValue);
                        }, timeoutValue);
                    });
                }, timeoutValue);
            }
        };
    })

    .config(function ($routeProvider, $locationProvider) {
        'use strict';

        $routeProvider
            .when('/game/:gameType/single/:lang/:type/', {
                templateUrl: 'singlePlayer.html',
                controller: 'GameSinglePlayerController',
                resolve: {
                    // I will cause a 1 second delay
                    delay: function ($q, $timeout) {
                        var delay = $q.defer();
                        $timeout(delay.resolve, 1000);
                        return delay.promise;
                    }
                }
            })
            .when('/game/single/wizard/', {
                templateUrl: 'singleWizard.html',
                controller: 'SingleWizardController'
            })
            .when('/game/multiplayer/', {
                templateUrl: 'multiplayer.html',
                controller: 'MultiplayerController'
            })
            //.when('/game/multiplayer/:roomId', {
            //    templateUrl: 'multiplayer.html',
            //    controller: 'MultiplayerController'
            //})
            .when('/home/', {
                templateUrl: 'home.html',
                controller: 'HomeController'
            })
            .when('/stats/', {
                templateUrl: 'stats.html',
                controller: 'StatsController'
            })
            .when('/auth/logout/', {
                template: '',
                controller: function ($window) {
                    $window.location.reload();
                }
            })
            .when('/old.html', {
                template: '',
                controller: function ($window) {
                    $window.location.reload();
                }
            })
            //.otherwise({ redirectTo: '/game/single/wizard/' });
            .otherwise({redirectTo: '/home/'});

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false,
            rewriteLinks: true
        });

    });