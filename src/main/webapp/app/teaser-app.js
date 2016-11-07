/**
 * The main Niord Proxy teaser app module definition.
 *
 * Define the routes of the single page application.
 */

angular.module('niord.proxy.app',
    [   'ngSanitize',
        'ui.bootstrap',
        'ui.router',
        'pascalprecht.translate'
    ])

    .config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
        function ($stateProvider, $urlRouterProvider, $translateProvider) {
            'use strict';
            $translateProvider.useSanitizeValueStrategy('sanitize');
        }]);


function adjustMessageListTopPosition() {
}
