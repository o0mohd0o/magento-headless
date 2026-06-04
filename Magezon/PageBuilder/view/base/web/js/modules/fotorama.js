require([
	'jquery',
	'angular',
	'Magezon_PageBuilder/vendor/fotorama/fotorama'
], function($, angular) {
	angular.module('mgzFotorama', []).directive('mgzFotorama', ['$timeout', '$compile', function ($timeout) {
		return {
			scope: {
	            items: '<',
	            options: '<'
	        },
			link: function ($scope, element, attrs) {

				$scope.$on('parentUpdate', function() {
					initFotorama();
				});

				$scope.$watchCollection('items', function (items) {
					initFotorama();

				});

				function initFotorama() {
					if ($(element).data('fotorama')) {
						$(element).data('fotorama').destroy();
					}
					var options = $scope.options;
					$timeout(function () {
						var items = [];
						angular.forEach($scope.items, function (_item) {
							var item = {};
							if (_item.type == 'image') {
								item.img     = _item.url;
								item.thumb   = _item.url;
								item.caption = _item.caption;
								if (_item.full) {
									item.full = _item.full;
								}
							} else {
								item.thumb   = _item.thumb;
								item.caption = _item.caption;
								item.video   = _item.url;
							}
							items.push(item);
						});
						options['data'] = items;
						$(element).fotorama(options);
					}, 500);
				}
			}
		};
	}]);
});