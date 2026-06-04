define([
	'jquery',
	'angular'
], function($, angular) {

	var directive = function(magezonBuilderUrl, magezonBuilderService) {
		return {
      		replace: true,
			templateUrl: function(elem) {
				return magezonBuilderUrl.getTemplateUrl(elem, 'Magezon_PageBuilder/js/templates/builder/element/pagebuilder_template.html');
			},
			controller: function($scope, $controller) {
				var parent = $controller('baseController', {$scope: $scope});
				angular.extend(this, parent);

				$scope.$watch('element.template_id', function(templateId) {
					if (templateId) {
						magezonBuilderService.elemPost($scope.element, 'mgzbuilder/ajax/itemInfo', {
							type: 'pagebuilder_template',
							q: templateId
						}, true, function(res) {
							$scope.$apply(function() {
								$scope.templateName = res.label;
							})
						});
					}
				});
			},
			controllerAs: 'mgz'
		}
	}
	return directive;
});