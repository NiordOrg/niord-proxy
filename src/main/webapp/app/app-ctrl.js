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
            if ($scope.mode === 'DEVELOPMENT' || $scope.mode === 'TEST') {
                $scope.modeText = $scope.mode === 'DEVELOPMENT' ? 'DEV' : 'TEST';
                $timeout(function () {
                    $('.execution-mode').fadeIn(500);
                }, 200);
            }

        }])


    /**********************************************************************
     * Controller that handles the messages used for list and map overview
     **********************************************************************
     * The messages area either fetched based on a message filter or defined
     * by a publication.
     * When the messages are fetched by message filter, every change to
     * the filter will cause a filtered set of messages to be loaded from
     * the server, except for the sub-area selection. This section is
     * handled in this controller.
     */
    .controller('MessageCtrl', ['$scope', '$rootScope', '$window', '$location', '$timeout', '$stateParams',
                'MessageService', 'AppService', 'AnalyticsService',
        function ($scope, $rootScope, $window, $location, $timeout, $stateParams,
                  MessageService, AppService, AnalyticsService) {
            'use strict';

            $scope.loading = true;
            $scope.publication = undefined;
            $scope.modeText = '';

            // All messages for area based searches
            $scope.areaMessages = [];
            $scope.subAreas = [];

            // The filtered list of messages to display
            $scope.messages = [];

            var storage = $window.localStorage;

            // Check if a root area has been specified via request parameters
            // If not, default to settings stored in local storage
            var requestParams = $location.search();
            var initRootAreaId = requestParams.area || storage.rootAreaId;

            // teaser is a variable used to get around the aggressive caching of Chrome for the teaser page
            $scope.$watch('teaser', function () {
               $scope.init();
            });

            $scope.params = {
                language: AppService.getLanguage(),

                // Publication based message list
                publicationId: undefined,

                // Active messages
                activeNow: false,
                mainTypes: {
                    'NW': storage.NW ? storage.NW === 'true' : true,
                    'NM': storage.NM ? storage.NM === 'true' : true
                },
                rootArea: undefined, // Currently selected root area
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

                // Pre-load the area roots
                MessageService.getAreaRoots()
                    .success(function (areaRoots) {

                        $scope.areaRoots = areaRoots;
                        if ($scope.areaRoots.length > 0) {
                            var selRoot = $.grep($scope.areaRoots, function (area) {
                                return initRootAreaId && (area.id === initRootAreaId || area.mrn === initRootAreaId);
                            });
                            var rootArea = selRoot.length === 1 ? selRoot[0] : $scope.areaRoots[0];
                            $scope.updateRootArea(rootArea);
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
                $scope.init();
            };

            // If specified in the URL, show the given message details
            if ($stateParams.messageId) {
                $timeout(function() { MessageService.detailsDialog($stateParams.messageId) });
            }

            /**
             * Called to initialize the controller whenever the viewmode changes.
             */
            $scope.init = function () {
                $timeout(adjustMessageListTopPosition, 100);
            };
            $scope.init();


            /**
             * Scans through the search result and marks all messages that should potentially
             * display an area head line.
             * Also, builds the list of sub-areas to display for the current root area
             **/
            $scope.checkGroupByArea = function (messages, maxLevels) {
                maxLevels = maxLevels || 2;

                $scope.subAreas.length = 0;
                var lastAreaId = undefined;
                if (messages && messages.length > 0) {
                    for (var m = 0; m < messages.length; m++) {
                        var msg = messages[m];
                        if (msg.areas && msg.areas.length > 0) {
                            var msgArea = msg.areas[0];
                            var areas = [];
                            for (var area = msgArea; area !== undefined; area = area.parent) {
                                areas.unshift(area);
                            }
                            if (areas.length > 0) {
                                area = areas[Math.min(areas.length - 1, maxLevels - 1)];
                                if (!lastAreaId || area.id !== lastAreaId) {
                                    lastAreaId = area.id;
                                    msg.areaHeading = area;
                                    if (area.parent) {
                                        $scope.subAreas.push(area);
                                    }
                                }
                            }
                        }
                    }
                }
            };


            /**
             * Returns the URL parameters string for the current search parameters
             * The subAreaFilter indicates if the subarea selection should be included
             * in the filter.
             **/
            $scope.getSearchParams = function (subAreaFilter) {
                var p = 'language=' + $scope.params.language;

                if ($scope.params.publicationId) {
                    // Publication-based searching
                    p += '&publication=' + $scope.params.publicationId;

                } else {
                    // Active messages searching
                    if ($scope.params.activeNow) {
                        p += '&active=true';
                    }
                    if ($scope.teaser) {
                        // Always show both NW and NM on teaser page
                        p += '&mainType=NW&mainType=NM';
                    } else {
                        if ($scope.params.mainTypes.NW) {
                            p += '&mainType=NW';
                        }
                        if ($scope.params.mainTypes.NM) {
                            p += '&mainType=NM';
                        }
                    }
                    var areas =  subAreaFilter && $scope.subAreas ? $scope.subAreas : [];
                    var selectedAreas = 0;
                    for (var x = 0; x < areas.length; x++) {
                        if (areas[x].selected) {
                            p += '&areaId=' + areas[x].id;
                            selectedAreas++;
                        }
                    }
                    if ($scope.params.rootArea && selectedAreas === 0) {
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
                var params = $scope.getSearchParams(false);
                MessageService.search(params)
                    .success(function (messages) {
                        $scope.areaMessages = messages;
                        $scope.checkGroupByArea($scope.areaMessages);
                        $scope.filterMessages();
                    });
            };


            /** Called when the subarea list or selection has changed **/
            $scope.filterMessages = function () {
                // Create a look-up of all selected subarea ids
                var includeAll = true;
                var selectedIds = {};
                angular.forEach($scope.subAreas, function (area) {
                    if (area.selected) {
                        selectedIds[area.id] = area.id;
                        includeAll = false;
                    }
                });

                $scope.messages.length = 0;
                if ($scope.areaMessages && $scope.areaMessages.length > 0) {
                    angular.forEach($scope.areaMessages, function (message) {
                        if (includeAll) {
                            $scope.messages.push(message);
                            return;
                        }
                        for (var a = 0; message.areas && a < message.areas.length; a++) {
                            var area = message.areas[a];
                            while (area) {
                                if (selectedIds[area.id]) {
                                    $scope.messages.push(message);
                                    return;
                                }
                                area = area.parent;
                            }
                        }
                    })
                }
            };


            /** Creates a PDF for the current search result **/
            $scope.pdf = function () {
                var params = $scope.getSearchParams(true);
                var url = '/details.pdf?' + params;

                // Log the event to Google Analytics
                AnalyticsService.logEvent('PDF', 'generate-list-report', url);

                $window.open(url, '_blank');
            };


            // Every time the parameters change, refresh the message list
            $scope.$watch("params", $scope.refreshMessages, true);

            // Monitor the list of subareas
            $scope.$watch("subAreas", $scope.filterMessages, true);

            // Every time the language change, update the params
            $scope.$watch(AppService.getLanguage, function (lang) {
                $scope.params.language = lang;
            }, true);

        }])


    /*******************************************************************
     * Controller that handles displaying message details in a dialog
     *******************************************************************/
    .controller('MessageDialogCtrl', ['$scope', '$rootScope', '$window', 'MessageService', 'AppService',
                'AnalyticsService', 'messageId', 'messages',
        function ($scope, $rootScope, $window, MessageService, AppService,
                  AnalyticsService, messageId, messages) {
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
                if ($scope.pushedMessageIds.length === 1 && $scope.index > 0) {
                    $scope.index--;
                    $scope.pushedMessageIds[0] = $scope.messages[$scope.index];
                    $scope.loadMessageDetails();
                }
            };


            // Navigate to the next message in the message list
            $scope.selectNext = function() {
                if ($scope.pushedMessageIds.length === 1 && $scope.index >= 0 && $scope.index < $scope.messages.length - 1) {
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
                var url = '/details.pdf?' + params;

                // Log the event to Google Analytics
                AnalyticsService.logEvent('PDF', 'generate-details-report', url);

                $window.open(url, '_blank');
            };


            // Return the currently displayed message id
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
                                return att.display === 'ABOVE';
                            });
                            if (attachmentsAbove.length > 0) {
                                $scope.showMap = false;
                            }
                        }
                        $scope.hasGeometry = MessageService.featuresForMessage($scope.msg).length > 0;

                        // Log the event to Google Analytics
                        var label = $scope.msg.shortId || $scope.msg.id;
                        AnalyticsService.logEvent('Message', 'show-details', label);
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
    .controller('PublicationCtrl', ['$scope', '$rootScope', '$window', '$location', '$timeout',
                'AppService', 'PublicationService', 'AnalyticsService',
        function ($scope, $rootScope, $window, $location, $timeout,
                  AppService, PublicationService, AnalyticsService) {
            'use strict';

            $scope.activePublications = [];
            $scope.historicalPublications = [];
            $scope.dateFormat = 'dd-MM-yyyy';
            $scope.params = {
                language: AppService.getLanguage(),
                dateInterval: { startDate: null, endDate: null}
            };

            $scope.datePickerConfig = {
                dropdownSelector: '#date',
                startView:'day',
                minView:'day'
            };

            $scope.dateRangeOptions = {
                linkedCalendars: false,
                showWeekNumbers: true,
                locale: {
                    applyLabel: "Apply",
                    fromLabel: "From",
                    format: "ll",
                    toLabel: "To",
                    cancelLabel: 'Cancel'
                }
            };


            // Compute a set of fixed data ranges
            $scope.ranges = [];
            var currentYear = moment().year();
            for (var x = 0; x < 5; x++) {
                var year = '' + (currentYear - x);
                $scope.ranges.push({
                    name: year,
                    dateInterval: {
                        startDate: moment("01-01-" + year, "MM-DD-YYYY"),
                        endDate: moment("12-31-" + year, "MM-DD-YYYY") }
                });
            }


            /** Updates the date range selector UI for the currently selected language **/
            $scope.updateDateSelectorLanguage = function () {
                var locale = $scope.dateRangeOptions.locale;
                locale.applyLabel = AppService.translate('TERM_APPLY');
                locale.cancelLabel = AppService.translate('TERM_CANCEL');
                locale.fromLabel = AppService.translate('DATE_FROM');
                locale.toLabel = AppService.translate('DATE_TO');
            };
            $scope.updateDateSelectorLanguage();


            /** Refreshes the active publication list from the back-end **/
            $scope.refreshActivePublications = function () {

                // Perform the search
                var params = 'language=' + $scope.params.language;
                PublicationService.search(params)
                    .success(function (publications) {
                        $scope.activePublications = publications;
                        $scope.checkGroupByCategory($scope.activePublications);
                    });
            };


            /** Refreshes the historical publication list from the back-end **/
            $scope.refreshHistoricalPublications = function () {

                // Perform the search
                var params = 'language=' + $scope.params.language;
                var startDate = $scope.params.dateInterval.startDate;
                var endDate = $scope.params.dateInterval.endDate;
                if (startDate || endDate) {
                    if (startDate) {
                        params += '&from=' + startDate;
                    }
                    if (endDate) {
                        params += '&to=' + endDate;
                    }
                    PublicationService.search(params)
                        .success(function (publications) {
                            $scope.historicalPublications = publications;
                            $scope.checkGroupByCategory($scope.historicalPublications);
                        });
                } else {
                    $scope.historicalPublications.length = 0;
                }
            };


            // Every time the parameters change, refresh the publication list
            $scope.$watch("params", $scope.refreshHistoricalPublications, true);

            // Every time the language change, update the params
            $scope.$watch(AppService.getLanguage, function (lang) {
                $scope.params.language = lang;
                $scope.refreshActivePublications();
                $scope.updateDateSelectorLanguage();
            }, true);


            /**
             * Scans through the search result and marks all publications that should
             * display a category head line
             **/
            $scope.checkGroupByCategory = function (publications) {

                var lastCategoryId = undefined;
                if (publications && publications.length > 0) {
                    for (var p = 0; p < publications.length; p++) {
                        var pub = publications[p];
                        if (pub.category && (lastCategoryId === undefined || lastCategoryId !== pub.category.categoryId)) {
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

