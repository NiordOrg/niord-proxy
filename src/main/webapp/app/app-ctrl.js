/**
 * The main Niord Proxy app controller.
 */

angular.module('niord.proxy.app')


    /**********************************************************************
     * Controller that handles the messages used for list and map overview
     **********************************************************************/
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


            /** Returns the URL parameters string for the current search parameters **/
            $scope.getSearchParams = function () {
                var p = 'language=' + $scope.params.language;
                if ($scope.params.activeNow) {
                    p += '&active=true';
                }
                if ($scope.params.mainTypes.NW) {
                    p += '&mainType=NW';
                }
                if ($scope.params.mainTypes.NM) {
                    p += '&mainType=NM';
                }
                for (var x = 0; x < $scope.params.areaGroups.length; x++) {
                    if ($scope.params.areaGroups[x].selected) {
                        p += '&areaId=' + $scope.params.areaGroups[x].id;
                    }
                }
                if ($scope.params.wkt) {
                    p += '&wkt=' + encodeURIComponent($scope.params.wkt);
                }
                return p;
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
                var params = $scope.getSearchParams();
                MessageService.search(params)
                    .success(function (messages) {
                        $scope.messages = messages;
                        $scope.checkGroupByArea();
                    });
            };


            /** Creates a PDF for the current search result **/
            $scope.pdf = function () {
                var params = $scope.getSearchParams();
                $window.open('/details.pdf?' + params, '_blank');
            };


            // Every time the parameters change, refresh the message list
            $scope.$watch("params", $scope.refreshMessages, true)

        }])


    /*******************************************************************
     * Controller that handles displaying message details in a dialog
     *******************************************************************/
    .controller('MessageDialogCtrl', ['$scope', '$window', 'MessageService', 'messageId', 'messages',
        function ($scope, $window, MessageService, messageId, messages) {
            'use strict';

            $scope.warning = undefined;
            $scope.messages = messages;
            $scope.pushedMessageIds = [];
            $scope.pushedMessageIds[0] = messageId;

            $scope.msg = undefined;
            $scope.index = $.inArray(messageId, messages);
            $scope.showNavigation = $scope.index >= 0;
            $scope.showMap = true;
            $scope.hasGeometry = false;


            // Navigate to the previous message in the message list
            $scope.selectPrev = function() {
                if ($scope.pushedMessageIds.length == 1 && $scope.index > 0) {
                    $scope.index--;
                    $scope.pushedMessageIds[0] = $scope.messages[$scope.index];
                    $scope.loadMessageDetails();
                }
            };


            // Navigate to the next message in the message list
            $scope.selectNext = function() {
                if ($scope.pushedMessageIds.length == 1 && $scope.index >= 0 && $scope.index < $scope.messages.length - 1) {
                    $scope.index++;
                    $scope.pushedMessageIds[0] = $scope.messages[$scope.index];
                    $scope.loadMessageDetails();
                }
            };


            // Navigate to a new nested message
            $scope.selectMessage = function (messageId) {
                $scope.pushedMessageIds.push(messageId);
                $scope.loadMessageDetails();
            };


            // Navigate back in the nested navigation
            $scope.back = function () {
                if ($scope.pushedMessageIds.length > 1) {
                    $scope.pushedMessageIds.pop();
                    $scope.loadMessageDetails();
                }
            };


            // Return the currently diisplayed message id
            $scope.currentMessageId = function() {
                return $scope.pushedMessageIds[$scope.pushedMessageIds.length - 1];
            };


            // Load the message details for the given message id
            $scope.loadMessageDetails = function() {

                MessageService.details($scope.currentMessageId())
                    .success(function (data) {
                        $scope.warning = (data)
                            ? undefined
                            : MessageService.translate('MSG_NOT_FOUND', {'messageId': $scope.currentMessageId()});
                        $scope.msg = data;
                        $scope.showMap = true;
                        if ($scope.msg.attachments) {
                            var attachmentsAbove = $.grep($scope.msg.attachments, function (att) {
                                return att.display == 'ABOVE';
                            });
                            if (attachmentsAbove.length > 0) {
                                $scope.showMap = false;
                            }
                        }
                        $scope.hasGeometry = MessageService.featuresForMessage($scope.msg).length > 0;
                    })
                    .error(function () {
                        $scope.msg = undefined;
                    });
            };

            $scope.loadMessageDetails();

        }]);
