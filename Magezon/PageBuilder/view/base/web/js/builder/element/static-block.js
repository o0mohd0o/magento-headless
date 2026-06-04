define([
	'jquery'
], function($) {

	var directive = function(magezonBuilderUrl, magezonBuilderService) {
		return {
      		replace: true,
			templateUrl: function(elem) {
				return magezonBuilderUrl.getTemplateUrl(elem, 'Magezon_PageBuilder/js/templates/builder/element/static-block.html');
			},
			controller: function($scope, $controller) {
				var parent = $controller('baseController', {$scope: $scope});
				angular.extend(this, parent);
				$scope.name = '';
				$scope.$watch('element.block_id', function(value) {
					if (value) {
						magezonBuilderService.elemPost($scope.element, 'mgzbuilder/ajax/itemInfo', {
							type: 'block',
							q: value
						}, true, function(res) {
							$scope.$apply(function() {
								$scope.name = res.label;
							})
						});
					} else {
						$scope.name = '';
					}
				});
			},
			controllerAs: 'mgz'
		}
	}

	return directive;
});