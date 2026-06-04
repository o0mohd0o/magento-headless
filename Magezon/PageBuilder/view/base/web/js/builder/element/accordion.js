define([
	'angular',
	'underscore'
], function(angular, _) {

	var directive = function(magezonBuilderUrl, magezonBuilderService, $rootScope) {
		return {
      		replace: true,
			templateUrl: function(elem) {
				return magezonBuilderUrl.getViewFileUrl('Magezon_PageBuilder/js/templates/builder/element/accordion.html');
			},
			controller: function($scope, $controller) {
				var parent = $controller('listController', {$scope: $scope});
				angular.extend(this, parent);
				var self = this;

				$scope.element.builder.dndDisabled = true;

				angular.forEach($scope.element.elements, function(element, index) {
					if (index == 0) {
						element.builder.visible = true;
					} else {
						element.builder.visible = false;
					}
				});

				$scope.$on('afterAddElement', function(e, elem) {
					$scope.activeEventElement(elem);
				});

				$scope.$on('afterCloneElement', function(e, elem) {
					$scope.activeEventElement(elem);
				});

				$scope.$on('beforeDropElement', function(e, elem) {
					if ($scope.isChildren(elem)) {
						$scope.activeEventElement(elem);
					}
				});

				$scope.activeEventElement = function(elem) {
					if ($scope.isChildren(elem)) {
						$scope.activeElement(elem);
					}
				}

				$scope.$on('beforeRemoveElement', function(e, elem) {
					if ($scope.isChildren(elem)) {
						$scope.activeFirstElement();
					}
				});

				$scope.activeElement = function(element) {
					if (!element) return;
					if ($scope.element.at_least_one_open) {
						angular.forEach($scope.element.elements, function(el, index) {
							if (el !== element) {
								el.builder.visible = false;
								el.builder.additionalClasses = _.without(element.builder.additionalClasses, 'mgz-active');
							}
						});
					}
					if ($scope.element.at_least_one_open) {
						element.builder.visible = true;
						element.builder.additionalClasses.push('mgz-active');	
					} else {
						element.builder.visible = !element.builder.visible;
						if (element.builder.visible) {
							element.builder.additionalClasses.push('mgz-active');
						} else {
							element.builder.additionalClasses = _.without(element.builder.additionalClasses, 'mgz-active');
						}
					}
				}

				$scope.activeFirstElement = function() {
					var active = true;
					angular.forEach($scope.element.elements, function(element) {
						if (!element.builder.visible) {
							active = false;
						}
					});
					if (!active) {
						$scope.activeElement($scope.element.elements[0]);
					}
				}
				$scope.activeFirstElement();

				$scope.getClassess = function() {
					var _elem = $scope.element;
					var clasess = [];
					clasess.push('mgz-panels');
					clasess.push('mgz-panels-' + _elem.id);
					if (_elem.no_fill_content_area) clasess.push('mgz-panels-no-fill-content');
					return clasess;
				}

				$scope.getSpacing = function() {
					return $scope.element.spacing ? parseFloat($scope.element.spacing) : 0;
				}

				$scope.getGap = function() {
					return $scope.element.gap ? parseFloat($scope.element.gap) : 0;
				}
			},
			controllerAs: 'mgz'
		}
	}

	return directive;
});