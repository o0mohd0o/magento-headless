define([
	'jquery',
	'angular',
	'Magezon_PageBuilder/js/number-counter'
], function($, angular) {

	var directive = function(magezonBuilderUrl) {
		return {
      		replace: true,
			templateUrl: function(elem) {
				return magezonBuilderUrl.getTemplateUrl(elem, 'Magezon_PageBuilder/js/templates/builder/element/number_counter.html');
			},
			controller: function($rootScope, $scope, $controller) {
				var parent = $controller('baseController', {$scope: $scope});
				angular.extend(this, parent);

				$scope.getCounterStyles = function() {
					var styles = {};
					if ($scope.element.layout == 'circle') {
						styles['width'] = parseInt($scope.element.circle_size);
						styles['height'] = parseInt($scope.element.circle_size);
					}
					return styles;
				}

				$scope.getCircumference = function() {
					var element = $scope.element;
					return ($rootScope.parseInt(element.circle_size) - ($rootScope.parseInt(element.circle_dash_width) * 2)) * $rootScope.$window.Math.PI;
				}

				$scope.getViewBox = function() {
					var element = $scope.element;
					return '0 0 ' + parseInt(element.circle_size) + ' ' + parseInt(element.circle_size);
				}
			},
			link: function(scope, element) {
				var loadNumberCounter = function() {
					var _element  = scope.element;
					var max       = _element.max;
					if (!max) max = _element.number;
					var speed     = _element.speed ? parseFloat(_element.speed) * 1000 : 0;
					var delay     = _element.delay ? parseFloat(_element.delay) : 0;
					var radius    = (parseInt(_element.circle_size) / 2) - parseInt(_element.circle_dash_width);
					if (element.data("numberCounter")) {
						element.find('.mgz-element-bar').css({
							'stroke-dashoffset': '',
							'width': ''
						});
						element.find('.mgz-numbercounter-bar').css({
							'width': ''
						});
						element.numberCounter('destroy');
					}
					setTimeout(function() {
						element.numberCounter({
							layout: _element.layout,
							type:_element.number_type,
							number: parseFloat(_element.number),
							max: parseFloat(max),
							speed: speed,
							delay: delay,
							circleDashWidth: parseFloat(_element.circle_dash_width),
							radius: radius
						});
					}, 500);
				}
				scope.loadElement = function() {
					loadNumberCounter();
				}
			},
			controllerAs: 'mgz'
		}
	}

	return directive;
});