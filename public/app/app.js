/*globals angular, console*/
/**
 * @author lattmann / https://github.com/lattmann
 */

angular.module('jm.i18next').config(function ($i18nextProvider) {
    'use strict';

    $i18nextProvider.options = {
        //lng: 'de', // If not given, i18n will detect the browser language.
        fallbackLng: 'en', // Default is dev
        useCookie: false,
        useLocalStorage: false,
        resGetPath: '../../locales/__lng__/__ns__.json'
    };

});

angular.module('LycoprhonApp', ['ngRoute', 'ngMaterial', 'jm.i18next'])

    .controller('MainController', function ($scope, $route, $routeParams, $location, $mdSidenav, $i18next, $timeout) {
        'use strict';

        console.log('MainController');
        $scope.$route = $route;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;

        $scope.toggleSidenav = function (menuId) {
            $mdSidenav(menuId).toggle();
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
    })

    .controller('HomeController', function ($scope, $routeParams) {
        'use strict';

        $scope.name = "HomeController";
        $scope.params = $routeParams;

        console.log($scope.name);
    })

    .controller('StatsController', function ($scope, $routeParams) {
        'use strict';

        $scope.name = "StatsController";
        $scope.params = $routeParams;

        console.log($scope.name);
    })

    .controller('GameSinglePlayerController', function ($scope, $routeParams) {
        'use strict';

        $scope.name = "GameSinglePlayerController";
        $scope.params = $routeParams;

        console.log($scope.name);
        console.log($scope.params);
    })

    .controller('SingleWizardController', function ($scope, $routeParams, $http) {
        'use strict';

        $scope.name = "SingleWizardController";
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


    .config(function ($routeProvider, $locationProvider) {
        'use strict';

        $routeProvider
            .when('/game/:gameType/single/:lang/:type/', {
                templateUrl: '/app/game.html',
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
                templateUrl: '/app/singleWizard.html',
                controller: 'SingleWizardController'
            })
            .when('/home/', {
                templateUrl: '/app/home.html',
                controller: 'HomeController'
            })
            .when('/stats/', {
                templateUrl: '/app/stats.html',
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
            .otherwise({ redirectTo: '/home/' });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false,
            rewriteLinks: true
        });

    });