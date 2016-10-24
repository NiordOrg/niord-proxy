/**
 * The main Niord Proxy app directives.
 */

angular.module('niord.proxy.app')

    /********************************
     * Renders the message details
     ********************************/
    .directive('renderMessageDetails', [ '$rootScope', 'MessageService',
        function ($rootScope, MessageService) {
        'use strict';

        return {
            restrict: 'A',
            templateUrl: '/app/render-message-details.html',
            replace: false,
            scope: {
                msg:            "=",
                messages:       "=",
                language:       "=",
                format:         "@",
                showDetails:    "&"
            },
            link: function(scope, element, attrs) {
                scope.language = scope.language || $rootScope.language;
                scope.format = scope.format || 'list';
                scope.showAttachments = false;
                scope.attachmentsAbove = [];
                scope.attachmentsBelow = [];


                /** Called when a message reference is clicked **/
                scope.referenceClicked = function(messageId) {
                    if (attrs.showDetails) {
                        scope.showDetails({messageId: messageId});
                    } else {
                        MessageService.detailsDialog(messageId, scope.messages);
                    }
                };


                /** Called whenever the message changes **/
                scope.initMessage = function () {
                    scope.attachmentsAbove.length = 0;
                    scope.attachmentsBelow.length = 0;

                    // Extract the attachments that will displayed above and below the message data
                    if (scope.msg.attachments) {
                        scope.attachmentsAbove = $.grep(scope.msg.attachments, function (att) {
                            return att.display == 'ABOVE';
                        });
                        scope.attachmentsBelow = $.grep(scope.msg.attachments, function (att) {
                            return att.display == 'BELOW';
                        });
                    }
                };


                // Sets whether to show the attachments or not
                scope.setShowAttachments = function (value) {
                    scope.showAttachments = value;
                };

                scope.$watch("msg", scope.initMessage);
            }
        };
    }])


    /****************************************************************
     * Replaces the content of the element with the area description
     ****************************************************************/
    .directive('renderMessageArea', ['$rootScope', '$translate', 'MessageService',
        function ($rootScope, $translate, MessageService) {
        return {
            restrict: 'A',
            scope: {
                renderMessageArea: "=",
                lineage: "=",
                areaDivider: "@"
            },
            link: function(scope, element, attrs) {
                var divider = (attrs.areaDivider) ? attrs.areaDivider : " - ";

                /** Prepends the prefix to the result **/
                function prepend(prefix, result) {
                    return prefix
                        + ((result.length > 0 && prefix.length > 0) ? divider : '')
                        + result;
                }

                scope.updateArea = function() {
                    var result = '';
                    var area = scope.renderMessageArea;
                    while (area) {
                        if (area.id == -999999) {
                            // Special "General" area used for messages without an assigned area
                            result = prepend($translate.instant('GENERAL_MSGS', null, null, $rootScope.language), result);
                        } else {
                            var desc = MessageService.desc(area, $rootScope.language);
                            var areaName = (desc && desc.name) ? desc.name : '';
                            result = prepend(areaName, result);
                        }
                        area = scope.lineage ? area.parent : null;
                    }
                    element.html(result);
                };

                scope.$watch("renderMessageArea", scope.updateArea, true);
                scope.$watch(function () { return $rootScope.language }, scope.updateArea, true);
            }
        };
    }])


    /****************************************************************
     * The message-attachment directive renders an attachment
     ****************************************************************/
    .directive('messageAttachment', [function () {
        return {
            restrict: 'E',
            templateUrl: '/app/render-message-attachment.html',
            replace: true,
            scope: {
                attachment: "="
            },
            link: function(scope) {

                scope.sourceStyle = {};
                scope.sourceType = (scope.attachment.type && scope.attachment.type.startsWith('video'))
                    ? "video"
                    : 'image';
                if (scope.attachment.width && scope.attachment.height) {
                    scope.sourceStyle = { width: scope.attachment.width, height: scope.attachment.height };
                } else if (scope.attachment.width) {
                    scope.sourceStyle = { width: scope.attachment.width };
                } else if (scope.attachment.height) {
                    scope.sourceStyle = { height: scope.attachment.height };
                }
                scope.sourceStyle['max-width'] = '100%';
            }
        };
    }])


    /****************************************************************
     * Binds a click event that will open the message details dialog
     ****************************************************************/
    .directive('messageDetailsLink', ['MessageService',
        function (MessageService) {
            'use strict';

            return {
                restrict: 'A',
                scope: {
                    messageDetailsLink: "=",
                    messages: "=",
                    disabled: "=?"
                },
                link: function(scope, element) {

                    if (!scope.disabled) {
                        element.addClass('clickable');
                        element.bind('click', function() {
                            MessageService.detailsDialog(scope.messageDetailsLink, scope.messages);
                        });
                    }
                }
            };
        }])


    /**
     * Converts a div into a search result map.
     *
     * The map directive may be instantiated with a "messages" list, used for maps displaying a list of messages.
     * Alternatively, the map directive can be instantiated with a single "message", used for displaying a single message.
     *
     * In the former case, the map will be interactive, i.e. with tooltip and clickable features. Not so in the latter case.
     */
    .directive('messageMap', ['$rootScope', '$location', '$timeout', 'MapService', 'MessageService',
        function ($rootScope, $location, $timeout, MapService, MessageService) {
            'use strict';

            return {
                restrict: 'E',
                replace: false,
                transclude: true,
                templateUrl: '/app/render-message-map.html',
                scope: {
                    messages:   '=?',
                    message:    '=?',
                    fitExtent:  '=',
                    maxZoom:    '@',
                    mapState:   '='
                },

                link: function (scope, element, attrs) {

                    scope.generalMessages = []; // Messages with no geometry
                    scope.language = $rootScope.language;

                    // The map will only be interactive when displaying a list of messages.
                    scope.interactive = (attrs.messages !== undefined);

                    var maxZoom = scope.maxZoom ? parseInt(scope.maxZoom) : 10;
                    var updateSizeTimer;


                    // Just used for bootstrapping the map
                    var zoom = 6;
                    var lon  = 11;
                    var lat  = 56;

                    /*********************************/
                    /* Layers                        */
                    /*********************************/

                    var layers = [];

                    // Add OSM layer
                    layers.push(new ol.layer.Tile({
                        source: new ol.source.OSM()
                    }));


                    var nwStyle = new ol.style.Style({
                        fill: new ol.style.Fill({ color: 'rgba(255, 0, 255, 0.2)' }),
                        stroke: new ol.style.Stroke({ color: '#8B008B', width: 1 }),
                        image: new ol.style.Icon({
                            anchor: [0.5, 0.5],
                            scale: 0.3,
                            src: '/img/nw.png'
                        })
                    });

                    var nmStyle = new ol.style.Style({
                        fill: new ol.style.Fill({ color: 'rgba(255, 0, 255, 0.2)' }),
                        stroke: new ol.style.Stroke({ color: '#8B008B', width: 1 }),
                        image: new ol.style.Icon({
                            anchor: [0.5, 0.5],
                            scale: 0.3,
                            src: '/img/nm.png'
                        })
                    });

                    var bufferedStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(100, 50, 100, 0.2)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: 'rgba(100, 50, 100, 0.6)',
                            width: 1
                        })
                    });

                    // Construct the NW layer
                    var nwLayer = new ol.layer.Vector({
                        source: new ol.source.Vector({
                            features: new ol.Collection(),
                            wrapX: false
                        }),
                        style: function(feature) {
                            var featureStyle = feature.get('parentFeatureIds') ? bufferedStyle : nwStyle;
                            return [ featureStyle ];
                        }
                    });
                    nwLayer.setVisible(true);
                    layers.push(nwLayer);

                    // Construct the NM layer
                    var nmLayer = new ol.layer.Vector({
                        source: new ol.source.Vector({
                            features: new ol.Collection(),
                            wrapX: false
                        }),
                        style: function(feature) {
                            var featureStyle = feature.get('parentFeatureIds') ? bufferedStyle : nmStyle;
                            return [ featureStyle ];
                        }
                    });
                    nmLayer.setVisible(true);
                    layers.push(nmLayer);


                    /*********************************/
                    /* Map                           */
                    /*********************************/

                    // Disable rotation on mobile devices
                    var controls = scope.readonly ? [] : ol.control.defaults({ rotate: false });
                    var interactions = scope.readonly ? [] : ol.interaction.defaults({ altShiftDragRotate: false, pinchRotate: false});

                    var view = new ol.View();
                    var map = new ol.Map({
                        target: angular.element(element)[0],
                        layers: layers,
                        view: view,
                        controls: controls,
                        interactions: interactions
                    });

                    // Update the map center and zoom
                    view.setCenter(MapService.fromLonLat([ lon, lat ]));
                    view.setZoom(zoom);

                    // Update the map size if the element size changes.
                    // In theory, this should not be necessary, but it seems to fix a problem
                    // where maps are sometimes distorted
                    scope.updateSize = function () {
                        updateSizeTimer = null;
                        map.updateSize();
                    };
                    scope.$watchGroup([
                        function() { return element[0].clientWidth; },
                        function() { return element[0].clientHeight; }
                    ], function () {
                        if (updateSizeTimer) {
                            $timeout.cancel(updateSizeTimer);
                        }
                        updateSizeTimer = $timeout(scope.updateSize, 100);
                    });

                    /*********************************/
                    /* Interactive Functionality     */
                    /*********************************/

                    // Whenever the map extent is changed, record the new extent in the mapState
                    if (attrs.mapState) {
                        scope.mapChanged = function () {
                            var extent = view.calculateExtent(map.getSize());
                            scope.mapState['zoom'] = view.getZoom();
                            scope.mapState['center'] = MapService.round(MapService.toLonLat(view.getCenter()), 3);
                            scope.mapState['extent'] = MapService.round(MapService.toLonLatExtent(extent), 3);
                            scope.$$phase || scope.$apply();
                        };
                        map.on('moveend', scope.mapChanged);
                    }


                    // Returns the list of messages for the given pixel
                    scope.getMessagesForPixel = function (pixel) {
                        var messageIds = {};
                        var messages = [];
                        map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                            var msg = feature.get('message');
                            if ((layer  == nwLayer || layer  == nmLayer) && msg && messageIds[msg.id] === undefined) {
                                messages.push(msg);
                                messageIds[msg.id] = msg.id;
                            }
                        });
                        return messages;
                    };


                    // Show Message details dialog when a message is clicked
                    map.on('click', function(evt) {
                        var messages = scope.getMessagesForPixel(map.getEventPixel(evt.originalEvent));
                        if (messages.length >= 1) {
                            MessageService.detailsDialog(messages[0].id, messages)
                        }
                    });

                    /*********************************/
                    /* Update Messages               */
                    /*********************************/


                    /** Called when messages are updated **/
                    function messagesUpdated() {
                        var messages = attrs.messages ? scope.messages : [ scope.message ];

                        // Reset layers
                        nwLayer.getSource().clear();
                        nmLayer.getSource().clear();
                        scope.generalMessages.length = 0;

                        for (var x = 0; x < messages.length; x++) {
                            var message = messages[x];
                            var features = MessageService.featuresForMessage(message);
                            if (features.length > 0) {
                                angular.forEach(features, function (gjFeature) {
                                    var olFeature = MapService.gjToOlFeature(gjFeature);
                                    olFeature.set('message', message);
                                    if (message.mainType == 'NW') {
                                        nwLayer.getSource().addFeature(olFeature);
                                    } else {
                                        nmLayer.getSource().addFeature(olFeature);
                                    }
                                });
                            } else {
                                scope.generalMessages.push(messages[x]);
                            }
                        }

                        if (scope.fitExtent) {
                            var extent = ol.extent.createEmpty();
                            ol.extent.extend(extent, nwLayer.getSource().getExtent());
                            ol.extent.extend(extent, nmLayer.getSource().getExtent());
                            if (!ol.extent.isEmpty(extent)) {
                                map.getView().fit(extent, map.getSize(), {
                                    padding: [5, 5, 5, 5],
                                    maxZoom: maxZoom
                                });
                            }
                        }

                    }

                    scope.$watch("message", messagesUpdated, true);
                    scope.$watchCollection("messages", messagesUpdated);

                }
            }
        }]);

