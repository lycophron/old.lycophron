/*globals angular*/
/**
 * @author lattmann / https://github.com/lattmann
 */

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


var app = angular.module('LoginApp', ['ngMaterial', 'jm.i18next']);

app.controller('AppCtrl', function ($rootScope, $scope, $timeout, $i18next, $http) {
    'use strict';

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

    $scope.username = 'unknown';

    // Simple GET request example :
    $http.get('/auth/').
        success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.username = data.displayName;
        }).
        error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
});