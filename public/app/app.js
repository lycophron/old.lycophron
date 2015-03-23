/*globals angular, console, require*/
/**
 * @author lattmann / https://github.com/lattmann
 */

// TODO: this file has to be split and refactored!!!

// application library
var L = require('../../lib/lycophron');

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
            //{
            //    url: '/game/multiplayer/wizard/',
            //    text: 'menu.multiplayer'
            //},
            {
                url: '/stats/',
                text: 'menu.statistics'
            },
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

    .controller('GameSinglePlayerController', function ($scope, $routeParams, $timeout, $route) {
        'use strict';

        $scope.name = 'GameSinglePlayerController';
        $scope.params = $routeParams;

        // TODO: validate route params!

        console.log($scope.name);
        console.log($scope.params);


        $scope.gameIsReady = false;
        $scope.longProcess = false;

        $scope.state = 'game.loading';

        // ui related
        $scope.showJoker = false;
        $scope.typedLetters = '';
        $scope.typedLettersPrev = '';

        $scope.problemText = '';
        $scope.word = '';
        $scope.lastWord = '';
        $scope.message = '';

        // game related
        $scope.solutions = {};
        $scope.problemTiles = [];
        $scope.selectedTiles = [];

        checkWord();

        $scope.jokerSelected = function (idx, tile) {

            $scope.typedLetters += dict.encodeLetter(tile.letter);
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
                removeLastLetter();
                return;
            }

            if ($scope.typedLettersPrev.length + 1 !== $scope.typedLetters.length) {
                // FIXME: we accept exactly one new character
                $scope.typedLetters = $scope.typedLettersPrev;
                return;
            }

            newLetter = $scope.typedLetters[$scope.typedLetters.length - 1];
            decodedLetter = dict.decodeLetter(newLetter);

            $scope.typedLetters = $scope.typedLetters.slice(0, -1);
            $scope.typedLettersPrev = $scope.typedLetters;

            if (newLetter === ' ') {
                // FIXME [BUG]: ng-change does not fire on space
                // space will remove all letters and wait for the next one
                $scope.removeAllLetters();
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
            $scope.typedLetters += dict.encodeLetter(letter);
            $scope.typedLettersPrev = $scope.typedLetters;
            $scope.selectedTiles.push({letter: letter, value: value});

            // check new word
            checkWord();
        }

        function checkWord() {
            $scope.word = $scope.selectedTiles.map(function (tile, index) {
                return tile.letter;
            }).join('');

            if ($scope.word) {
                if (dict.checkWord($scope.word)) {
                    $scope.lastWord = $scope.word;

                    $scope.message = '';

                } else {
                    $scope.message = 'game.wordDoesNotExist';
                }
            } else {
                $scope.message = 'game.selectLetterOrType';
            }
        }

        function removeLastLetter() {
            var i,
                letterToPutBack;

            if ($scope.typedLetters.length > 0 &&
                $scope.selectedTiles.length > 0) {
                if ($scope.selectedTiles[$scope.selectedTiles.length - 1].value === 0 && /* joker */
                    $scope.typedLetters[$scope.typedLetters.length - 1] !== '*') {

                    $scope.selectedTiles[$scope.selectedTiles.length - 1].letter = '*';

                    checkWord();

                    $scope.typedLetters = $scope.typedLetters.slice(0, -1);
                    $scope.typedLettersPrev = $scope.typedLetters;

                    $scope.showJoker = true;
                } else {
                    letterToPutBack = $scope.selectedTiles[$scope.selectedTiles.length - 1].letter;
                    // delete last letter

                    $scope.typedLetters = $scope.typedLetters.slice(0, -1);
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
        }

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
            $route.reload();
        };

        // FIXME: turn timeouts into promises
        // FIXME: add failure states
        // 50ms, let the browser draw our updated state
        var timeoutValue = 20;
        var dict;
        $timeout(function () {
            dict = new L.Dictionary($scope.params.lang + '/' + $scope.params.type, true /* use superagent */);
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
                        $scope.letters = dict.drawLetters($scope.params.consonants, $scope.params.vowels, $scope.params.jokers);
                        $scope.state = 'game.solvingProblem';
                        $scope.longProcess = true;

                        $timeout(function () {
                            $scope.solutions = dict.getSolutionForProblem(dict.encodeArray($scope.letters).join(''));
                            $scope.state = 'game.ready';
                            $scope.longProcess = false;

                            $timeout(function () {
                                $scope.gameIsReady = true;

                                $scope.problemTiles = $scope.letters.map(function (letter, index) {
                                    return {letter: letter, value: dict.getLetterValue(letter), disabled: false};
                                });

                                $scope.problemText = $scope.letters.map(function (letter, index) {
                                    return letter + ' (' + dict.encodeLetter(letter) + ')';
                                }).join(', ');

                                //console.log($scope.solutions);
                            }, timeoutValue);
                        }, timeoutValue);
                    }, timeoutValue);
                }, timeoutValue);
            });
        }, timeoutValue);
    })

    .controller('SingleWizardController', function ($scope, $routeParams, $http) {
        'use strict';

        $scope.name = 'SingleWizardController';
        $scope.params = $routeParams;

        // TODO: extract business logic min/max/default num of consonants, vowels, jokers
        $scope.numConsonants = 10;
        $scope.numVowels = 9;
        $scope.numJokers = 0;

        $scope.language = null;
        $scope.gameType = 'anagramProblem';
        $scope.gameTypes = ['anagramProblem'];

        $scope.loadLanguages = function () {
            $scope.languages = [];
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

                    for (i = 0; i < langCodes.length; i += 1) {
                        types = Object.keys(data[langCodes[i]].types);
                        for (j = 0; j < types.length; j += 1) {
                            language = {
                                name: langCodes[i],
                                type: types[j],
                                fullName: langCodes[i] + ' (' + types[j] + ')',
                                numWords: data[langCodes[i]].types[types[j]].numWords
                            };
                            $scope.languages.push(language);
                        }
                    }

                    $scope.languages.sort(function (a, b) {
                        return a.fullName.localeCompare(b.fullName);
                    });
                }).
                error(function (data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };
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


    .config(function ($routeProvider, $locationProvider) {
        'use strict';

        $routeProvider
            .when('/game/:gameType/single/:lang/:type/', {
                templateUrl: 'game.html',
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
            .when('/game/single/wizard', {
                templateUrl: 'singleWizard.html',
                controller: 'SingleWizardController'
            })
            .when('/home/', {
                templateUrl: 'home.html',
                controller: 'HomeController'
            })
            .when('/stats/', {
                templateUrl: 'stats.html',
                controller: 'StatsController'
            })
            .when('/auth/logout', {
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