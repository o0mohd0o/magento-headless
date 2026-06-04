define([
	'jquery',
	'angular'
], function($, angular) {

	var directive = function(magezonBuilderUrl) {
		return {
			templateUrl: function(elem) {
				return magezonBuilderUrl.getTemplateUrl(elem, 'Magezon_PageBuilder/js/templates/builder/element/flip_box.html');
			},
			controller: function($scope, $controller) {
				var parent = $controller('baseController', {$scope: $scope});
				angular.extend(this, parent);
			},
			link: function(scope, element) {
				var callHeight = function() {
					var maxHeight            = 0;
					var flipboxSelector      = element.find('.mgz-flipbox');
					element.find('.mgz-flipbox-block-inner').each(function(index, el) {
						if ($(this).height() > maxHeight) {
							maxHeight = $(this).outerHeight();
						}
					});
					if (scope.element.box_min_height && maxHeight < scope.element.box_min_height) {
						maxHeight = scope.element.box_min_height;
					}
					flipboxSelector.find('.mgz-flipbox-inner').height(maxHeight);
				}
				scope.loadElement = function() {
					callHeight();
				}
			},
			controllerAs: 'mgz'
		}
	}

	return directive;
});