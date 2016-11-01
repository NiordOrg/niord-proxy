
/**
 * The main Niord Proxy Services.
 */

angular.module('niord.proxy.app')

    /**
     * Interface for calling the application server
     */
    .factory('MessageService', [ '$rootScope', '$http', '$translate', '$uibModal',
        function($rootScope, $http, $translate, $uibModal) {
            'use strict';

            /** Returs the list of message ids **/
            function extractMessageIds(messages) {
                var ids = [];
                if (messages) {
                    for (var i in messages) {
                        ids.push(messages[i].id);
                    }
                }
                return ids;
            }


            /** Translates the given key **/
            function translate(key, params, language) {
                language = language || $rootScope.language;
                return $translate.instant(key, params, null, language);
            }


            return {

                /**
                 * Registers the current language
                 * @param lang the language
                 */
                setLanguage: function(lang) {
                    if (lang != $rootScope.language) {
                        $translate.use(lang);
                        $rootScope.language = lang;
                    }
                },


                /** Returns the languages **/
                getLanguages: function () {
                    return $http.get('/rest/messages/languages');
                },


                /** Translates the given key **/
                translate : function (key, params, language) {
                    return translate(key, params, language);
                },


                /** Returns the area groups **/
                getAreaGroups: function () {
                    return $http.get('/rest/messages/area-groups');
                },


                /** Returns the root area for the given area **/
                rootArea: function (area) {
                    while (area && area.parent) {
                        area = area.parent;
                    }
                    return area;
                },


                /** Returns the description record for the given language **/
                desc: function(o, lang) {
                    lang = lang || $rootScope.language;
                    if (o && o.descs && o.descs.length > 0) {
                        for (var x = 0; x < o.descs.length; x++) {
                            if (o.descs[x].lang == lang) {
                                return o.descs[x];
                            }
                        }
                        return o.descs[0];
                    }
                    return undefined;
                },


                /** Generate the HTML to display as a message ID badge **/
                messageIdLabelHtml : function (msg, showBlank) {
                    var shortId = msg && msg.shortId ? msg.shortId : undefined;
                    var messageClass = msg.mainType == 'NW' ? 'label-message-nw' : 'label-message-nm';
                    if (msg && !shortId && showBlank) {
                        shortId = msg.type ? translate('TYPE_' + msg.type) + ' ' : '';
                        shortId += msg.mainType ? translate('MAIN_TYPE_' + msg.mainType) : '';
                    }
                    return shortId ? '<span class="' + messageClass + '">' + shortId + '</span>' : '';
                },

                /** Returns the features associated with a message **/
                featuresForMessage: function(msg) {
                    var features = [];
                    if (msg && msg.parts && msg.parts.length) {
                        angular.forEach(msg.parts, function (part) {
                            if (part.geometry && part.geometry.features && part.geometry.features.length) {
                                features.push.apply(features, part.geometry.features);
                            }
                        });
                    }
                    return features;
                },


                /** Opens a message details dialog **/
                detailsDialog: function(messageId, messages) {
                    return $uibModal.open({
                        controller: "MessageDialogCtrl",
                        templateUrl: "/app/message-details-dialog.html",
                        size: 'lg',
                        resolve: {
                            messageId: function () {
                                return messageId;
                            },
                            messages: function () {
                                return messages && messages.length > 0 ? extractMessageIds(messages) : [ messageId ];
                            }
                        }
                    });
                },


                /** Returns the message filters */
                search: function(params) {
                    return $http.get('/rest/messages/search?' + params);
                },


                details: function (id) {
                    return $http.get('/rest/messages/message/' + encodeURIComponent(id)
                                + '?language=' + $rootScope.language);
                }
            };
        }])


    /**
     * The language service is used for changing language, etc.
     */
    .service('MapService', ['$rootScope', function ($rootScope) {
            'use strict';

            var projMercator = 'EPSG:3857';
            var proj4326 = 'EPSG:4326';
            var geoJsonFormat = new ol.format.GeoJSON();


            /** Returns the data projection */
            this.dataProjection = function () {
                return proj4326;
            };


            /** Returns the feature projection */
            this.featureProjection = function () {
                return projMercator;
            };


            /** Rounds each value of the array to the given number of decimals */
            this.round = function (values, decimals) {
                for (var x = 0; values && x < values.length; x++) {
                    // NB: Prepending a '+' will convert from string to float
                    values[x] = +values[x].toFixed(decimals);
                }
                return values;
            };


            /** Converts lon-lat array to xy array in mercator */
            this.fromLonLat = function(lonLat) {
                return lonLat ? ol.proj.fromLonLat(lonLat) : null;
            };


            /** Converts xy array in mercator to a lon-lat array */
            this.toLonLat = function(xy) {
                return xy ? ol.proj.transform(xy, projMercator, proj4326) : null;
            };


            /** Converts lon-lat extent array to xy extent array in mercator */
            this.fromLonLatExtent = function(lonLatExtent) {
                if (lonLatExtent && lonLatExtent.length == 4) {
                    var minPos = this.fromLonLat([lonLatExtent[0], lonLatExtent[1]]);
                    var maxPos = this.fromLonLat([lonLatExtent[2], lonLatExtent[3]]);
                    return [minPos[0], minPos[1], maxPos[0], maxPos[1]];
                }
                return null;
            };


            /** Converts xy extent array in mercator to a lon-lat extent array */
            this.toLonLatExtent = function(xyExtent) {
                if (xyExtent && xyExtent.length == 4) {
                    var minPos = this.toLonLat([xyExtent[0], xyExtent[1]]);
                    var maxPos = this.toLonLat([xyExtent[2], xyExtent[3]]);
                    return [minPos[0], minPos[1], maxPos[0], maxPos[1]];
                }
                return null;
            };


            /** Returns the center of the extent */
            this.getExtentCenter = function (extent) {
                var x = extent[0] + (extent[2]-extent[0]) / 2.0;
                var y = extent[1] + (extent[3]-extent[1]) / 2.0;
                return [x, y];
            };


            /** Return a lon-lat center from the xy geometry */
            this.toCenterLonLat = function(geometry) {
                return this.toLonLat(this.getExtentCenter(geometry.getExtent()));
            };


            /** Returns a "sensible" center point of the geometry. Used e.g. for placing labels **/
            this.getGeometryCenter = function (g) {
                var point;
                try {
                    switch (g.getType()) {
                        case 'MultiPolygon':
                            var poly = g.getPolygons().reduce(function(left, right) {
                                return left.getArea() > right.getArea() ? left : right;
                            });
                            point = poly.getInteriorPoint().getCoordinates();
                            break;
                        case 'MultiLineString':
                            var lineString = g.getLineStrings().reduce(function(left, right) {
                                return left.getLength() > right.getLength() ? left : right;
                            });
                            point = this.getExtentCenter(lineString.getExtent());
                            break;
                        case 'Polygon':
                            point = g.getInteriorPoint().getCoordinates();
                            break;
                        case 'Point':
                            point = g.getCoordinates();
                            break;
                        case 'LineString':
                        case 'MultiPoint':
                        case 'GeometryCollection':
                            point = this.getExtentCenter(g.getExtent());
                            break;
                    }
                } catch (ex) {
                }
                return point;
            };


            /** Converts a GeoJSON feature to an OL feature **/
            this.gjToOlFeature = function (feature) {
                return geoJsonFormat.readFeature(feature, {
                    dataProjection: proj4326,
                    featureProjection: projMercator
                });
            };


        /**
         * Serializes the "readable" coordinates of a geometry
         * <p>
         * When serializing coordinates, adhere to a couple of rules:
         * <ul>
         *     <li>If the "parentFeatureIds" feature property is defined, skip the coordinates.</li>
         *     <li>If the "restriction" feature property has the value "affected", skip the coordinates.</li>
         *     <li>For polygon linear rings, skip the last coordinate (which is identical to the first).</li>
         *     <li>For (multi-)polygons, only include the exterior ring, not the interior ring.</li>
         * </ul>
         */
        this.serializeReadableCoordinates = function (g, coords, props, index, polygonType) {
            var that = this;
            props = props || {};
            index = index || 0;
            if (g) {
                if (g instanceof Array) {
                    if (g.length >= 2 && $.isNumeric(g[0])) {
                        var bufferFeature = props['parentFeatureIds'];
                        var affectedArea = props['restriction'] == 'affected';
                        var includeCoord = (polygonType != 'Exterior');
                        if (includeCoord && !bufferFeature && !affectedArea) {
                            coords.push({
                                lon: g[0],
                                lat: g[1],
                                index: index,
                                name: props['name:' + index + ':' + $rootScope.language]
                            });
                        }
                        index++;
                    } else {
                        for (var x = 0; x < g.length; x++) {
                            polygonType = (polygonType == 'Interior' && x == g.length - 1) ? 'Exterior' : polygonType;
                            index = that.serializeReadableCoordinates(g[x], coords, props, index, polygonType);
                        }
                    }
                } else if (g.type == 'FeatureCollection') {
                    for (var x = 0; g.features && x < g.features.length; x++) {
                        index = that.serializeReadableCoordinates(g.features[x], coords);
                    }
                } else if (g.type == 'Feature') {
                    index = that.serializeReadableCoordinates(g.geometry, coords, g.properties, 0);
                } else if (g.type == 'GeometryCollection') {
                    for (var x = 0; g.geometries && x < g.geometries.length; x++) {
                        index = that.serializeReadableCoordinates(g.geometries[x], coords, props, index);
                    }
                } else if (g.type == 'MultiPolygon') {
                    for (var p = 0; p < g.coordinates.length; p++) {
                        // For polygons, do not include coordinates for interior rings
                        for (var x = 0; x < g.coordinates[p].length; x++) {
                            index = that.serializeReadableCoordinates(g.coordinates[p][x], coords, props, index, x == 0 ? 'Interior' : 'Exterior');
                        }
                    }
                } else if (g.type == 'Polygon') {
                    // For polygons, do not include coordinates for interior rings
                    for (var x = 0; x < g.coordinates.length; x++) {
                        index = that.serializeReadableCoordinates(g.coordinates[x], coords, props, index, x == 0 ? 'Interior' : 'Exterior');
                    }
                } else if (g.type) {
                    index = that.serializeReadableCoordinates(g.coordinates, coords, props, index);
                }
            }
            return index;
        };

    }]);

