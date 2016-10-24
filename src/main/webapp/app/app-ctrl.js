/**
 * The main Niord Proxy app controller.
 */

angular.module('niord.proxy.app')


    .controller('MessageCtrl', ['$scope', '$rootScope', '$window', '$timeout', 'MessageService',
        function ($scope, $rootScope, $window, $timeout, MessageService) {
            'use strict';


            $scope.messages = [];
            $scope.languages = [];
            var storage = $window.localStorage;

            $scope.params = {
                language: storage.language ? storage.language : 'en',
                activeNow: false,
                mainTypes: {
                    'NW': storage.NW ? storage.NW == 'true' : true,
                    'NM': storage.NM ? storage.NM == 'true' : false
                },
                areaGroups: [],
                wkt: undefined
            };


            // Pre-load the languages
            MessageService.getLanguages()
                .success(function (languages) {
                    $scope.languages = languages;
                });

            // Pre-load the area groups
            MessageService.getAreaGroups()
                .success(function (areaGroups) {
                    $scope.params.areaGroups = areaGroups;
                });


            /**
             * Called to initialize the controller whenever the viewmode changes.
             */
            $scope.init = function () {
                $timeout(adjustMessageListTopPosition, 100);
            };
            $scope.init();


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


            /** Refreshes the message list from the back-end **/
            $scope.refreshMessages = function () {

                // Change the language use for translations
                MessageService.setLanguage($scope.params.language);

                // Persist the settings in local storage
                storage.language = $scope.params.language;
                storage.NW = '' + $scope.params.mainTypes.NW;
                storage.NM = '' + $scope.params.mainTypes.NM;

                // Perform the search
                MessageService.search($scope.params)
                    .success(function (messages) {
                        $scope.messages = messages;
                        $scope.checkGroupByArea();
                    });
            };


            // Every time the parameters change, refresh the message list
            $scope.$watch("params", $scope.refreshMessages, true)

        }]);
