/**
 * The main Niord Proxy app directives.
 */

angular.module('niord.proxy.app')


    /** Formats a data using moment() **/
    .filter('formatDate', [function () {
        return function(input, format) {
            format = format || 'lll';
            return input ? moment(input).format(format) : '';
        };
    }])


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


    /********************************************************
     * Renders a badge with the short ID if defined, and
     * the type otherwise
     ********************************************************/
    .directive('messageIdBadge', ['MessageService', function (MessageService) {
        'use strict';

        return {
            restrict: 'E',
            scope: {
                msg:        "=",
                showStatus: "="
            },
            link: function(scope, element) {

                /** Updates the label based on the current status and short ID **/
                function updateIdLabel() {
                    element.html(MessageService.messageIdLabelHtml(scope.msg, scope.showStatus));
                }

                scope.$watch('[msg.shortId, msg.mainType, msg.type]', updateIdLabel, true);
            }
        }
    }])


    /****************************************************************
     * Replaces the content of the element with the chart list
     ****************************************************************/
    .directive('renderCharts', [function () {
        return {
            restrict: 'A',
            scope: {
                renderCharts: "="
            },
            link: function(scope, element) {
                scope.updateCharts = function(charts) {
                    var result = '';
                    if (charts && charts.length > 0) {
                        for (var x = 0; x < charts.length; x++) {
                            var chart = charts[x];
                            if (x > 0) {
                                result += ', ';
                            }
                            result += chart.chartNumber;
                            if (chart.internationalNumber) {
                                result += ' (INT ' + chart.internationalNumber + ')';
                            }
                        }
                        result += '.';
                    }
                    element.html(result);
                };

                scope.$watchCollection("renderCharts", scope.updateCharts);
            }
        };
    }])


    /****************************************************************
     * Replaces the content of the element with the area description
     ****************************************************************/
    .directive('renderMessageArea', ['$rootScope', 'MessageService', 'AppService',
        function ($rootScope, MessageService, AppService) {
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
                            result = prepend(AppService.translate('GENERAL_MSGS'), result);
                        } else {
                            var desc = MessageService.desc(area);
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
    .directive('messageMap', ['$rootScope', '$location', '$timeout', 'MapService', 'MessageService', 'AppService',
        function ($rootScope, $location, $timeout, MapService, MessageService, AppService) {
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
                    osm:        '@',
                    readOnly:   '='
                },

                link: function (scope, element, attrs) {

                    scope.generalMessages = []; // Messages with no geometry
                    scope.layerSwitcherLayers = [];
                    scope.language = $rootScope.language;

                    // Flags if the directive used for displaying message details or a message list.
                    scope.detailsMap = (attrs.message !== undefined);

                    var maxZoom = scope.maxZoom ? parseInt(scope.maxZoom) : 10;
                    var updateSizeTimer;


                    // Just used for bootstrapping the map
                    var zoom = 6;
                    var lon  = 11;
                    var lat  = 56;


                    /*********************************/
                    /* Layer switcher                */
                    /*********************************/


                    /** Adds a new layer to the layer switcher **/
                    scope.addToLayerSwitcher = function (layer, name) {
                        scope.layerSwitcherLayers.push({
                            layer: layer,
                            name: name,
                            visible: layer.getVisible()
                        })
                    };


                    /** Called when the visibility of a layer is toggled **/
                    scope.updateVisibility = function (l) {
                        l.layer.setVisible(l.visible);
                    };


                    /*********************************/
                    /* Nw-NM Layers                  */
                    /*********************************/

                    var layers = [];

                    // Add OSM layer
                    var osmSource = new ol.source.OSM();
                    if (scope.osm == 'ArcGIS') {
                        osmSource.setUrl('//services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}');
                    }
                    layers.push(new ol.layer.Tile({
                        source: osmSource
                    }));


                    var nwStyle = new ol.style.Style({
                        fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.3)' }),
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

                    var messageDetailsStyle = new ol.style.Style({
                        fill: new ol.style.Fill({ color: 'rgba(255, 0, 255, 0.2)' }),
                        stroke: new ol.style.Stroke({ color: '#8B008B', width: 1 }),
                        image: new ol.style.Circle({
                            radius: 4,
                            fill: new ol.style.Fill({
                                color: 'rgba(255, 0, 255, 0.2)'
                            }),
                            stroke: new ol.style.Stroke({color: 'darkmagenta', width: 1})
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
                            var featureStyle = null;
                            if (feature.get('parentFeatureIds')) {
                                featureStyle = bufferedStyle;
                            } else if (scope.detailsMap) {
                                featureStyle = messageDetailsStyle;
                            } else {
                              featureStyle = nwStyle;
                            }
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
                            var featureStyle = null;
                            if (feature.get('parentFeatureIds')) {
                                featureStyle = bufferedStyle;
                            } else if (scope.detailsMap) {
                                featureStyle = messageDetailsStyle;
                            } else {
                                featureStyle = nmStyle;
                            }
                            return [ featureStyle ];
                        }
                    });
                    nmLayer.setVisible(true);
                    layers.push(nmLayer);


                    /*********************************/
                    /* Label Layer                   */
                    /*********************************/


                    /** Creates a feature style that displays the feature name in the "middle" of the feature **/
                    scope.styleForFeatureName = function (feature, name) {
                        return new ol.style.Style({
                            text: new ol.style.Text({
                                textAlign: 'center',
                                font: '11px Arial',
                                text: name,
                                fill: new ol.style.Fill({color: 'darkmagenta'}),
                                stroke: new ol.style.Stroke({color: 'white', width: 2.0}),
                                offsetX: 0,
                                offsetY: 5
                            }) ,
                            geometry: function(feature) {
                                var point = MapService.getGeometryCenter(feature.getGeometry());
                                return (point) ? new ol.geom.Point(point) : null;
                            }
                        });
                    };


                    /** Creates a features style that displays the index of the coordinate **/
                    scope.styleForFeatureCoordIndex = function (feature, index, coord) {
                        return new ol.style.Style({
                            text: new ol.style.Text({
                                textAlign: 'center',
                                font: '9px Arial',
                                text: '' + index,
                                fill: new ol.style.Fill({color: 'white'}),
                                offsetX: 0,
                                offsetY: 0
                            }),
                            image: new ol.style.Circle({
                                radius: 8,
                                fill: new ol.style.Fill({
                                    color: 'darkmagenta'
                                }),
                                stroke: new ol.style.Stroke({color: 'white', width: 2.0})
                            }),
                            geometry: function() {
                                return new ol.geom.Point(coord);
                            }
                        });
                    };


                    /** Creates a features style that displays the name of a specific coordinate **/
                    scope.styleForFeatureCoordName = function (feature, name, coord) {
                        return new ol.style.Style({
                            text: new ol.style.Text({
                                textAlign: 'center',
                                font: '11px Arial',
                                text: name,
                                fill: new ol.style.Fill({color: 'darkmagenta'}),
                                stroke: new ol.style.Stroke({color: 'white', width: 2.0}),
                                offsetX: 0,
                                offsetY: 14
                            }),
                            geometry: function() {
                                return new ol.geom.Point(coord);
                            }
                        });
                    };

                    // The label layer is only added when message details is being displayed
                    if (scope.detailsMap) {

                        var labelLayer = new ol.layer.Vector({
                            source: new ol.source.Vector({
                                features: new ol.Collection(),
                                wrapX: false
                            })
                        });
                        labelLayer.setVisible(true);
                        layers.push(labelLayer);
                        scope.addToLayerSwitcher(labelLayer, "Labels");
                    }

                    /*********************************/
                    /* Map                           */
                    /*********************************/

                    // Disable rotation on mobile devices
                    var controls = scope.readOnly ? [] : ol.control.defaults({ rotate: false });
                    var interactions = scope.readOnly ? [] : ol.interaction.defaults({ altShiftDragRotate: false, pinchRotate: false});

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


                    // Interactive behaviour only applies to message list maps
                    if (!scope.detailsMap && !scope.readOnly) {

                        var info = $('#info');
                        info.tooltip({
                            html: true,
                            animation: false,
                            trigger: 'manual'
                        });


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
                                $timeout(function() { info.tooltip('hide'); });
                                MessageService.detailsDialog(messages[0].id, messages);
                            }
                        });


                        /** Generate the messages HTML to display in the tooltip **/
                        scope.renderTooltipContent = function(messages) {
                            var maxMessageNo = 3;
                            var html = '';
                            for (var x = 0; x < Math.min(messages.length, maxMessageNo); x++) {
                                var msg = messages[x];
                                html += '<div class="compact-message-list">';
                                html += MessageService.messageIdLabelHtml(msg);
                                if (msg.descs && msg.descs.length > 0) {
                                    html += '    <strong ng-if="msg.descs">' + msg.descs[0].title + '</strong>';
                                }
                                html += '</div>';
                            }
                            if (messages.length > maxMessageNo) {
                                html += '<div class="compact-message-list" style="text-align: center">';
                                html += AppService.translate('MORE_MSGS', { 'messageNo': messages.length - maxMessageNo});
                                html += '</div>';
                            }

                            return html;
                        };


                        /** Displays the tooltip info **/
                        map.on('pointermove', function (evt) {
                            if (evt.dragging) {
                                info.tooltip('hide');
                                return;
                            }
                            var pixel = map.getEventPixel(evt.originalEvent);
                            info.css({
                                left: pixel[0] + 'px',
                                top: (pixel[1] - 15) + 'px'
                            });
                            var messages = scope.getMessagesForPixel(pixel);
                            if (messages.length > 0) {
                                var oldTitle = info.attr('data-original-title');
                                var newTitle = scope.renderTooltipContent(messages);
                                if (oldTitle != newTitle) {
                                    info.tooltip('hide')
                                        .attr('data-original-title', newTitle)
                                        .tooltip('fixTitle');
                                }
                                info.tooltip('show');
                            } else {
                                info.tooltip('hide');
                            }
                        });
                    }


                    /*********************************/
                    /* Update Messages               */
                    /*********************************/

                    /** Updates the message layers **/
                    function updateMessageLayers() {
                        var messages = attrs.messages ? scope.messages : [ scope.message ];

                        // Reset layers
                        nwLayer.getSource().clear();
                        nmLayer.getSource().clear();
                        scope.generalMessages.length = 0;

                        // Update the NW-NM message layers
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
                    }


                    /** Updates the label layer **/
                    function updateLabelLayer() {

                        labelLayer.getSource().clear();
                        if (scope.message) {
                            var features = MessageService.featuresForMessage(scope.message);
                            if (features.length > 0) {
                                var coordIndex = 1;
                                angular.forEach(features, function (gjFeature) {

                                    var olFeature = MapService.gjToOlFeature(gjFeature);
                                    var styles = [];

                                    // Create a label for the feature
                                    var name = gjFeature.properties
                                        ? gjFeature.properties['name:' + $rootScope.language]
                                        : undefined;

                                    if (name) {
                                        styles.push(scope.styleForFeatureName(
                                            olFeature,
                                            name));
                                    }

                                    // Create labels for the "readable" coordinates
                                    var coords = [];
                                    MapService.serializeReadableCoordinates(gjFeature, coords);
                                    for (var x = 0; x < coords.length; x++) {

                                        var c = MapService.fromLonLat([ coords[x].lon, coords[x].lat ]);

                                        styles.push(scope.styleForFeatureCoordIndex(
                                            olFeature,
                                            coordIndex,
                                            c));

                                        if (coords[x].name) {
                                            styles.push(scope.styleForFeatureCoordName(
                                                olFeature,
                                                coords[x].name,
                                                c));
                                        }
                                        coordIndex++;
                                    }

                                    if (styles.length > 0) {
                                        olFeature.setStyle(styles);
                                        labelLayer.getSource().addFeature(olFeature);
                                    }
                                });
                            }
                        }
                    }


                    /** Called when messages are updated **/
                    function messagesUpdated() {

                        updateMessageLayers();

                        if (scope.detailsMap) {
                            updateLabelLayer();
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

