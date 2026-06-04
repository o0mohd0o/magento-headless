define([
	'jquery',
	'angular'
], function($, angular) {

	return {
		link: function(scope, element, attrs) {
			scope.cloneItem = function() {
				scope.$emit('cloneDynamicItem', scope.model);
			}
		}
	}
});
