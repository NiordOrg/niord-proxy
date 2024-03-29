/**
 * The main Niord Proxy teaser app module definition.
 *
 * Define the routes of the single page application.
 */

angular.module('niord.proxy.conf', []);

angular.module('niord.proxy.app',
    [   'ngSanitize',
        'ui.bootstrap',
        'ui.router',
        'pascalprecht.translate',
        'niord.proxy.conf'
    ])

    .config(['$translateProvider',
        function ($translateProvider) {
            'use strict';
            $translateProvider.useSanitizeValueStrategy('sanitize');
        }])

function adjustMessageListTopPosition() {
}
