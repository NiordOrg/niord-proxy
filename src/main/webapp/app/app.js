/**
 * The main Niord Proxy app module definition.
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


            $urlRouterProvider
                .when('/', '/messages/details')
                .otherwise("/");

            $stateProvider
                .state('messages', {
                    url: "/messages",
                    templateUrl: "/app/messages.html"
                })
                .state('messages.map', {
                    url: "/map",
                    templateUrl: "/app/messages-viewmode-map.html"
                })
                .state('messages.details', {
                    url: "/details",
                    templateUrl: "/app/messages-viewmode-details.html"
                });

    }]);
