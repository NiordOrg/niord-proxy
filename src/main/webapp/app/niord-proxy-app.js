/**
 * The main Niord Proxy app module definition.
 *
 * Define the routes of the single page application.
 */

var app = angular.module('niord.proxy.app', ['ngSanitize', 'ui.bootstrap', 'ui.router', 'pascalprecht.translate'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        'use strict';


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

    }])


    /**
     * Interface for calling the application server
     */
    .factory('MessageService', [ '$rootScope', '$http',
        function($rootScope, $http) {
            'use strict';

            return {

                /** Returns the message filters */
                search: function(params) {
                    var p = 'language=' + params.language;
                    if (params.onlyActive) {
                        p += '&active=true';
                    }
                    if (params.mainTypes.NW) {
                        p += '&mainType=NW';
                    }
                    if (params.mainTypes.NM) {
                        p += '&mainType=NM';
                    }
                    /*
                    for (var a = 0; a < params.areaIds.length; a++) {
                        if (params.areaIds[a]) {
                            p += '&areaId=' + params.areaIds[a];
                        }
                    }
                    */
                    if (params.wkt) {
                        p += '&wkt=' + encodeURIComponent(params.wkt);
                    }
                    return $http.get('/rest/messages/search?' + p);
                }
            };
        }])



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
    }])


    .controller('MessageCtrl', ['$scope', '$rootScope', 'MessageService',
        function ($scope, $rootScope, MessageService) {
            'use strict';

            $scope.messages = [];
            $scope.params = {
                language: 'en',
                onlyActive: false,
                mainTypes: [ {
                    'NW': true,
                    'NM': false
                }],
                areaIds: [],
                wkt: undefined
            };

            /**
             * Scans through the search result and marks all messages that should potentially
             * display an area head line
             **/
            $scope.checkGroupByArea = function (maxLevels) {
                maxLevels = maxLevels || 2;
                var lastAreaId = undefined;
                if ($scope.messages && $scope.messages.length > 0) {
                    for (var m = 0; m < $scope.messages.length; m++) {
                        var msg = $scope.messages[m];
                        if (msg.areas && msg.areas.length > 0) {
                            var msgArea = msg.areas[0];
                            var areas = [];
                            for (var area = msgArea; area !== undefined; area = area.parent) {
                                areas.unshift(area);
                            }
                            if (areas.length > 0) {
                                area = areas[Math.min(areas.length - 1, maxLevels - 1)];
                                if (!lastAreaId || area.id != lastAreaId) {
                                    lastAreaId = area.id;
                                    msg.areaHeading = area;
                                }
                            }
                        } else {
                            // Use a special "General" heading for messages without an area
                            if (lastAreaId != -999999) {
                                lastAreaId = -999999;
                                msg.areaHeading =  { id: -999999 };
                            }
                        }
                    }
                }
            };


            $scope.refreshMessages = function () {
                MessageService.search($scope.params)
                    .success(function (messages) {
                        $scope.messages = messages;
                        $scope.checkGroupByArea();
                    });
            };


            // Every time the parameters change, refresh the message list
            $scope.$watch("params", $scope.refreshMessages, true)

        }]);
