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

    .controller('GameSinglePlayerController', function ($scope, $routeParams, $timeout) {
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
        $scope.showJoker = true;

        // game related
        $scope.solutions = {};
        $scope.letters = [];


        // FIXME: turn timeouts into promises
        // FIXME: add failure states
        // 50ms, let the browser draw our updated state
        var timeoutValue = 20;
        $timeout(function () {
            var dict = new L.Dictionary($scope.params.lang + '/' + $scope.params.type, true /* use superagent */);
            $scope.state = 'game.downloading';
            $scope.longProcess = true;

            dict.initialize(function () {
                $scope.testTiles = dict.getAllLetters().map(function (letter, index) {
                    return {letter: letter, value: dict.getLetterValue(letter)};
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
                                    return {letter: letter, value: 1};
                                });

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
                joker: '=joker'
            },
            templateUrl: 'tileGroup.html'
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