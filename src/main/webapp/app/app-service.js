
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


                /** Returns the area groups **/
                getAreaGroups: function () {
                    return $http.get('/rest/messages/area-groups');
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
                    var p = 'language=' + params.language;
                    if (params.activeNow) {
                        p += '&active=true';
                    }
                    if (params.mainTypes.NW) {
                        p += '&mainType=NW';
                    }
                    if (params.mainTypes.NM) {
                        p += '&mainType=NM';
                    }
                    for (var x = 0; x < params.areaGroups.length; x++) {
                        if (params.areaGroups[x].selected) {
                            p += '&areaId=' + params.areaGroups[x].id;
                        }
                    }
                    if (params.wkt) {
                        p += '&wkt=' + encodeURIComponent(params.wkt);
                    }
                    return $http.get('/rest/messages/search?' + p);
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
    .service('MapService', ['$rootScope', '$http',
        function ($rootScope, $http) {
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


            /** Converts a GeoJSON feature to an OL feature **/
            this.gjToOlFeature = function (feature) {
                return geoJsonFormat.readFeature(feature, {
                    dataProjection: proj4326,
                    featureProjection: projMercator
                });
            };

        }]);

