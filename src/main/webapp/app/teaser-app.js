/**
 * The main Niord Proxy teaser app module definition.
 *
 * Define the routes of the single page application.
 */

angular.module('niord.proxy.app',
    [   'ngSanitize',
        'ui.bootstrap',
        'pascalprecht.translate'
    ])

    .config(['$translateProvider',
        function ($translateProvider) {
            'use strict';
            $translateProvider.useSanitizeValueStrategy('sanitize');
        }]);


function adjustMessageListTopPosition() {
}
