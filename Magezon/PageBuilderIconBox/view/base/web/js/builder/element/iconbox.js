define([
	'jquery',
	'angular'
], function($, angular) {

	var directive = function(magezonBuilderUrl, $compile, $timeout) {
		return {
      		replace: true,
			templateUrl: function(elem) {
				return magezonBuilderUrl.getViewFileUrl('Magezon_PageBuilderIconBox/js/templates/builder/element/iconbox.html');
			},
			controller: function($scope, $controller) {
				var parent = $controller('baseController', {$scope: $scope});
				angular.extend(this, parent);
				var self = this;
			},
			link: function($scope, $element, $attr) {
				var $parent = $element.find('.mgz-icon-box-text-wrapper');
				$scope.$watch('element.title_type', function(newVal) {
					var template = '<' + newVal + ' class="mgz-heading-text">{{ element.title }}</' + newVal + '>';
					var html = $compile(template)($scope);
                    $parent.html(html);
				});
				$timeout(function() {
					$scope.loaded = true;
				}, 500);
			},
			controllerAs: 'mgz'
		}
	}

	return directive;
});