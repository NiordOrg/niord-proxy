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



/**
 * The view mode bar and filter bar are always visible, but the filter bar can
 * have varying height and may change height when the window is re-sized.
 * Compute the correct top position of the message lists
 */
$( window ).resize(function() {
    adjustMessageListTopPosition();
});

function adjustMessageListTopPosition() {
    var filterBar = $('.filter-bars');
    if (filterBar.length) {
        var offset = 40 + filterBar.height();
        var messageDetails = $(".message-details-list");
        if (messageDetails.length) {
            messageDetails.css("margin-top", offset + "px");
        }
        var messageMap = $(".message-map");
        if (messageMap.length) {
            messageMap.css("top", offset + "px");
        }
    }
}
