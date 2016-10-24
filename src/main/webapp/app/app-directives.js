/**
 * The main Niord Proxy app directives.
 */

angular.module('niord.proxy.app')

    /********************************
     * Renders the message details
     ********************************/
    .directive('renderMessageDetails', [ '$rootScope', function ($rootScope) {
        'use strict';

        return {
            restrict: 'A',
            templateUrl: '/app/render-message-details.html',
            replace: false,
            scope: {
                msg: "=",
                messages: "=",
                format: "@"
            },
            link: function(scope) {
                scope.language = $rootScope.language;
                scope.format = scope.format || 'list';
            }
        };
    }]);
