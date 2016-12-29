/**
 * The main Niord Proxy app controller.
 */

angular.module('niord.proxy.app')


    /**********************************************************************
     * Controller for common functionality of the main menu
     **********************************************************************/
    .controller('AppCtrl', ['$scope', '$location', '$timeout', 'AppService',
        function ($scope, $location, $timeout, AppService) {
            'use strict';

            $scope.languages = AppService.getLanguages();
            $scope.getLanguage = AppService.getLanguage;
            $scope.setLanguage = AppService.setLanguage;

            // Check if a language has been specified via request parameters
            var requestParams = $location.search();
            AppService.initLanguage(requestParams.lang);


            // Fetch the execution mode
            $scope.mode  = AppService.getExecutionMode();
            if ($scope.mode == 'DEVELOPMENT' || $scope.mode == 'TEST') {
                $scope.modeText = $scope.mode == 'DEVELOPMENT' ? 'DEV' : 'TEST';
                $timeout(function () {
                    $('.execution-mode').fadeIn(500);
                }, 200);
            }

        }])


    /**********************************************************************
     * Controller that handles the messages used for list and map overview
     **********************************************************************/
    .controller('MessageCtrl', ['$scope', '$rootScope', '$window', '$location', '$timeout', '$stateParams', 'MessageService', 'AppService',
        function ($scope, $rootScope, $window, $location, $timeout, $stateParams, MessageService, AppService) {
            'use strict';

            $scope.loading = true;
            $scope.publication = undefined;
            $scope.modeText = '';
            $scope.messages = [];
            $scope.areaGroups = {
                rootAreas: [],
                subAreas: {}
            };
            var storage = $window.localStorage;

            // Check if a root area has been specified via request parameters
            // If not, default to settings stored in local storage
            var requestParams = $location.search();
            var initRootAreaId = requestParams.area || storage.rootAreaId;

            $scope.params = {
                language: AppService.getLanguage(),

                // Publication based message list
                publicationId: undefined,

                // Active messages
                activeNow: false,
                mainTypes: {
                    'NW': storage.NW ? storage.NW == 'true' : true,
                    'NM': storage.NM ? storage.NM == 'true' : true
                },
                rootArea: undefined, // Currently selected root area
                subAreas: [],        // Sub-areas of current root area
                wkt: undefined
            };


            if ($stateParams.publicationId) {
                // Look for selected publication
                MessageService.getPublication($stateParams.publicationId, AppService.getLanguage())
                    .success(function (publication) {
                        $scope.params.publicationId = publication.publicationId;
                        $scope.publication = publication;

                        // Ready to load messages
                        $scope.loading = false;
                    })
                    .error(function () {
                        // Ready to load messages
                        $scope.loading = false;
                    });

            } else {

                // Pre-load the area groups
                MessageService.getAreaGroups()
                    .success(function (areaGroups) {

                        $scope.areaGroups = areaGroups;
                        if ($scope.areaGroups.rootAreas.length > 0) {
                            $scope.updateRootArea($scope.areaGroups.rootAreas[0]);
                        }

                        // Ready to load messages
                        $scope.loading = false;
                    })
                    .error(function () {
                        // Ready to load messages
                        $scope.loading = false;
                    });
            }


            // Update the currently selected root area
            $scope.updateRootArea = function (rootArea) {
                $scope.params.rootArea = rootArea;
                $scope.params.subAreas = $scope.areaGroups.subAreas[rootArea.id] || [];
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
                        }
                    }
                }
            };


            /** Returns the URL parameters string for the current search parameters **/
            $scope.getSearchParams = function () {
                var p = 'language=' + $scope.params.language;

                if ($scope.params.publicationId) {
                    // Publication-based searching
                    p += '&publication=' + $scope.params.publicationId;

                } else {
                    // Active messages searching
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
                }

                return p;
            };


            /** Refreshes the message list from the back-end **/
            $scope.refreshMessages = function () {

                // If publication/area groups have not been loaded yet, wait with the messages
                if ($scope.loading) {
                    return;
                }

                // Store the current NW/NM settings
                if (!$scope.params.publicationId) {
                    storage.NW = '' + $scope.params.mainTypes.NW;
                    storage.NM = '' + $scope.params.mainTypes.NM;
                    if ($scope.params.rootArea && !requestParams.area) {
                        storage.rootAreaId = $scope.params.rootArea.id;
                    }
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
            $scope.$watch("params", $scope.refreshMessages, true);

            // Every time the language change, update the params
            $scope.$watch(AppService.getLanguage, function (lang) {
                $scope.params.language = lang;
            }, true);

        }])


    /*******************************************************************
     * Controller that handles displaying message details in a dialog
     *******************************************************************/
    .controller('MessageDialogCtrl', ['$scope', '$rootScope', '$window', 'MessageService', 'AppService', 'messageId', 'messages',
        function ($scope, $rootScope, $window, MessageService, AppService, messageId, messages) {
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
                            : AppService.translate('MSG_NOT_FOUND', {'messageId': $scope.currentMessageId()});
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

        }])




    /**********************************************************************
     * Controller that handles the list of publications
     **********************************************************************/
    .controller('PublicationCtrl', ['$scope', '$rootScope', '$window', '$location', '$timeout', 'AppService', 'PublicationService',
        function ($scope, $rootScope, $window, $location, $timeout, AppService, PublicationService) {
            'use strict';

            $scope.publications = [];
            $scope.dateFormat = 'dd-MM-yyyy';
            $scope.params = {
                language: AppService.getLanguage(),
                date: undefined
            };

            $scope.datePickerConfig = {
                dropdownSelector: '#date',
                startView:'day',
                minView:'day'
            };


            /** Refreshes the publication list from the back-end **/
            $scope.refreshPublications = function () {

                // Perform the search
                var params = 'language=' + $scope.params.language;
                if ($scope.params.date) {
                    params += '&from=' + $scope.params.date.getTime() + '&to=' + $scope.params.date.getTime();
                }

                PublicationService.search(params)
                    .success(function (publications) {
                        $scope.publications = publications;
                        $scope.checkGroupByCategory();
                    });
            };


            // Every time the parameters change, refresh the publication list
            $scope.$watch("params", $scope.refreshPublications, true);

            // Every time the language change, update the params
            $scope.$watch(AppService.getLanguage, function (lang) {
                $scope.params.language = lang;
            }, true);


            /**
             * Scans through the search result and marks all publications that should
             * display a category head line
             **/
            $scope.checkGroupByCategory = function () {

                var lastCategoryId = undefined;
                if ($scope.publications && $scope.publications.length > 0) {
                    for (var p = 0; p < $scope.publications.length; p++) {
                        var pub = $scope.publications[p];
                        if (pub.category && (lastCategoryId === undefined || lastCategoryId != pub.category.categoryId)) {
                            lastCategoryId = pub.category.categoryId;
                            pub.categoryHeading = pub.category;
                        }
                    }
                }
            };

        }])


    /**
     * Controller handling cookies and disclaimer dialogs
     */
    .controller('FooterCtrl', ['$scope', '$uibModal','AppService',
        function ($scope, $uibModal, AppService) {
            'use strict';

            $scope.cookiesDlg = function () {
                var lang = AppService.getLanguage();
                $uibModal.open({
                    templateUrl: '/app/dialogs/cookies_'+lang+'.html',
                    size: 'lg'
                });
            };

            $scope.disclaimerDlg = function () {
                var lang = AppService.getLanguage();
                $uibModal.open({
                    templateUrl: '/app/dialogs/disclaimer_'+lang+'.html',
                    size: 'lg'
                });
            }
        }]);

