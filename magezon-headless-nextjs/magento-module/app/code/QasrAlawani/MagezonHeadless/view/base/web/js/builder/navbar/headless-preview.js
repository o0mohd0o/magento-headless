/**
 * QasrAlawani_MagezonHeadless — "Headless Preview" navbar directive.
 *
 * Mirrors Magezon_PageBuilderPreview's own preview directive, but instead of
 * opening Magezon's PHP-rendered storefront preview it opens the Next.js headless
 * preview page, which renders the SAME content with the production React
 * components. It reuses Magezon's existing live-save pipeline
 * (mgzpagebuilder/preview/save -> mgz_pagebuilder_preview_profile keyed by
 * builderId), and the headless page reads that row via the magezonPreview GraphQL
 * query. On every edit (the Angular 'addHistory' event) we re-save and reload the
 * open preview window, giving the same live experience as core Magezon.
 *
 * Registered via etc/di.xml (CompositeConfigProvider > directives). The Next.js
 * URL comes from window.QASR_HEADLESS_PREVIEW (set by the admin PreviewConfig block).
 */
define([
    'angular'
], function (angular) {
    'use strict';

    var directive = function (magezonBuilderUrl, $timeout) {
        return {
            replace: true,
            templateUrl: function (elem) {
                return magezonBuilderUrl.getTemplateUrl(
                    elem,
                    'QasrAlawani_MagezonHeadless/js/templates/builder/navbar/headless-preview.html'
                );
            },
            controller: function ($rootScope, $scope, magezonBuilderService, profileManager) {
                var cfg = window.QASR_HEADLESS_PREVIEW || {};

                $scope.previewWindow = null;
                $scope.loading = false;
                $scope.enabled = !!cfg.baseUrl;

                $scope.getUrl = function () {
                    var base = (cfg.baseUrl || '').replace(/\/+$/, '');
                    var path = cfg.path || '/magezon-preview';
                    var q = 'builderId=' + encodeURIComponent($rootScope.builderId);
                    if (cfg.storeId) {
                        q += '&storeId=' + encodeURIComponent(cfg.storeId);
                    }
                    return base + path + '?' + q;
                };

                // Persist the LIVE builder content to the shared preview table.
                $scope.saveLive = function (callback) {
                    magezonBuilderService.post('mgzpagebuilder/preview/save', {
                        builderId: $rootScope.builderId,
                        pid: ($rootScope.profile && $rootScope.profile.pid) || '',
                        profile: profileManager.toString()
                    }, true, callback);
                };

                // Pre-warm the preview row on hover so the first open is instant.
                $scope.prime = function () {
                    if (!$scope.primed && $scope.enabled) {
                        $scope.saveLive();
                        $scope.primed = true;
                    }
                };

                $scope.openPreview = function () {
                    if (!$scope.enabled) {
                        window.alert(
                            'Set "Next.js Storefront Base URL" in Stores > Configuration > General > Magezon Headless to enable the headless preview.'
                        );
                        return;
                    }
                    if ($scope.loading) {
                        return;
                    }
                    $scope.loading = true;
                    $scope.saveLive(function () {
                        $timeout(function () {
                            $scope.loading = false;
                            $scope.previewWindow = window.open(
                                $scope.getUrl(),
                                'qasr-headless-preview-' + $rootScope.builderId
                            );
                        });
                    });
                };

                // Live refresh: re-save + reload the open preview on every edit.
                var refresh = function () {
                    if ($scope.previewWindow && !$scope.previewWindow.closed) {
                        $scope.saveLive(function () {
                            try {
                                $scope.previewWindow.location.reload();
                            } catch (e) {
                                // Cross-origin: the preview page polls magezonPreview itself,
                                // so it will still pick up the change on its next tick.
                            }
                        });
                    }
                };

                $rootScope.$on('addHistory', function () {
                    refresh();
                });
                $scope.$on('loadPreview', function () {
                    refresh();
                });
            }
        };
    };

    return directive;
});
