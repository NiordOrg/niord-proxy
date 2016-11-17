/**
 * The main Niord Proxy app controller.
 */

angular.module('niord.proxy.app')


    /**********************************************************************
     * Controller that handles the messages used for list and map overview
     **********************************************************************/
    .controller('MessageCtrl', ['$scope', '$rootScope', '$window', '$location', '$timeout', 'MessageService',
        function ($scope, $rootScope, $window, $location, $timeout, MessageService) {
            'use strict';

            $scope.loading = true;
            $scope.modeText = '';
            $scope.messages = [];
            $scope.languages = [];
            $scope.areas = [];
            $scope.rootAreas = []; // All root areas
            var storage = $window.localStorage;

            // Check if root area and language has been specified via request parameters
            // If not, default to settings stored in local storage
            var requestParams = $location.search();
            var initLang = requestParams.lang || storage.language;
            var initRootAreaId = requestParams.area || storage.rootAreaId;

            $scope.params = {
                language: initLang || 'en',
                activeNow: false,
                mainTypes: {
                    'NW': storage.NW ? storage.NW == 'true' : true,
                    'NM': storage.NM ? storage.NM == 'true' : true
                },
                rootArea: undefined, // Currently selected root area
                subAreas: [],        // Sub-areas of current root area
                wkt: undefined
            };


            // Fetch the execution mode
            MessageService.getExecutionMode()
                .success(function (mode) {
                    $scope.mode = mode;
                    if (mode == 'DEVELOPMENT' || mode == 'TEST') {
                        $scope.modeText = mode == 'DEVELOPMENT' ? 'DEV' : 'TEST';
                        $timeout(function() {
                            $('.execution-mode').fadeIn(500);
                        }, 200);
                    }
                });

            // Pre-load the languages
            MessageService.getLanguages()
                .success(function (languages) {
                    $scope.languages = languages;
                });

            // Pre-load the area groups
            MessageService.getAreaGroups()
                .success(function (areaGroups) {

                    $scope.areas = areaGroups;

                    $scope.rootAreas.length = 0;
                    $scope.params.rootArea = undefined;
                    var prevRootArea = undefined;
                    for (var x = 0; x < $scope.areas.length; x++) {
                        var area = $scope.areas[x];
                        var rootArea = MessageService.rootArea(area);
                        if (!prevRootArea || rootArea.id != prevRootArea.id) {
                            $scope.rootAreas.push(rootArea);
                            prevRootArea = rootArea;
                        }
                    }

                    // Set the currently selected root area to the one registered in the local-storage
                    if ($scope.rootAreas.length > 0) {
                        angular.forEach($scope.rootAreas, function (rootArea) {
                           if ('' + rootArea.id == initRootAreaId) {
                               $scope.params.rootArea = rootArea;
                           }
                        });
                        if (!$scope.params.rootArea) {
                            $scope.params.rootArea = $scope.rootAreas[0];
                        }
                        $scope.updateSubAreas();
                    }

                    // Ready to load messages
                    $scope.loading = false;
                })
                .error(function () {
                    // Ready to load messages
                    $scope.loading = false;
                });


            // Update the list of sub-areas of the currently selected root area
            $scope.updateSubAreas = function () {
                $scope.params.subAreas.length = 0;
                if ($scope.params.rootArea) {
                    var rootId = $scope.params.rootArea.id;
                    for (var x = 0; x < $scope.areas.length; x++) {
                        var area = $scope.areas[x];
                        if (area.parent && MessageService.rootArea(area).id == rootId) {
                            $scope.params.subAreas.push(area);
                        }
                    }
                }
            };


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
                var areas =  $scope.params.subAreas ? $scope.params.subAreas : [];
                var selectedAreas = 0;
                for (var x = 0; x < areas.length; x++) {
                    if (areas[x].selected) {
                        p += '&areaId=' + areas[x].id;
                        selectedAreas++;
                    }
                }
                if ($scope.params.rootArea && selectedAreas == 0) {
                    p += '&areaId=' + $scope.params.rootArea.id;
                }
                if ($scope.params.wkt) {
                    p += '&wkt=' + encodeURIComponent($scope.params.wkt);
                }
                return p;
            };


            /** Refreshes the message list from the back-end **/
            $scope.refreshMessages = function () {

                // If area groups have not been loaded yet, wait with the messages
                if ($scope.loading) {
                    return;
                }

                // Change the language use for translations
                MessageService.setLanguage($scope.params.language);

                // Persist the settings in local storage
                if (!requestParams.lang) {
                    storage.language = $scope.params.language;
                }
                storage.NW = '' + $scope.params.mainTypes.NW;
                storage.NM = '' + $scope.params.mainTypes.NM;
                if ($scope.params.rootArea && !requestParams.area) {
                    storage.rootAreaId = $scope.params.rootArea.id;
                }

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
    .controller('MessageDialogCtrl', ['$scope', '$rootScope', '$window', 'MessageService', 'messageId', 'messages',
        function ($scope, $rootScope, $window, MessageService, messageId, messages) {
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


            // Creates a PDF for the current search result
            $scope.pdf = function () {
                var params = 'messageId=' + encodeURIComponent($scope.currentMessageId())
                        + '&language=' + $rootScope.language;
                $window.open('/details.pdf?' + params, '_blank');
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
