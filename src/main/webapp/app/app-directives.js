/**
 * The main Niord Proxy app directives.
 */

angular.module('niord.proxy.app')

    /********************************
     * Renders the message details
     ********************************/
    .directive('renderMessageDetails', [ '$rootScope', function ($rootScope) {
        'use strict';

        return {
            restrict: 'A',
            templateUrl: '/app/render-message-details.html',
            replace: false,
            scope: {
                msg: "=",
                language: "=",
                format: "@"
            },
            link: function(scope) {
                scope.language = scope.language || $rootScope.language;
                scope.format = scope.format || 'list';
                scope.showAttachments = false;
                scope.attachmentsAbove = [];
                scope.attachmentsBelow = [];

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
    }]);
