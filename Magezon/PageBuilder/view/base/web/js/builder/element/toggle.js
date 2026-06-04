define([
	'angular',
	'mage/collapsible'
], function(angular) {

	var directive = function(magezonBuilderUrl) {
		return {
      		replace: true,
			templateUrl: function(elem) {
				return magezonBuilderUrl.getTemplateUrl(elem, 'Magezon_PageBuilder/js/templates/builder/element/toggle.html');
			},
			controller: function($scope, $controller) {
				var parent = $controller('baseController', {$scope: $scope});
				angular.extend(this, parent);
			},
			link: function(scope, element) {
				var loadToggle = function() {
					var _element = scope.element;
					if (element.data("collapsible")) {
						element.collapsible('destroy');
					}
					element.collapsible({
						active: (_element.open ? true : false),
				        openedState: "mgz-active",
				        animate: {
				        	duration: 400,
				        	easing: "easeOutCubic"
				        },
				        collapsible: true,
				        icons: {
				        	header: _element.icon_style!='text_only' ? _element.icon : '',
				        	activeHeader: _element.icon_style!='text_only' ? _element.active_icon : ''
				        }
					});
				}
				scope.loadElement = function() {
					loadToggle();
				}
			},
			controllerAs: 'mgz'
		}
	}

	return directive;
});