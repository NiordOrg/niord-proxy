
/**
 * The main Niord Proxy Services.
 */

angular.module('niord.proxy.app')

    /**
     * Interface for calling the application server
     */
    .factory('MessageService', [ '$rootScope', '$http', '$translate',
        function($rootScope, $http, $translate) {
            'use strict';

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
                }
            };
        }]);
