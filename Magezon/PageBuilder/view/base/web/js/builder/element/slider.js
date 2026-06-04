define([
	'angular',
	'Magezon_Builder/js/carousel'
], function(angular) {

	var directive = function(magezonBuilderUrl) {
		return {
      		replace: true,
			templateUrl: function(elem) {
				return magezonBuilderUrl.getTemplateUrl(elem, 'Magezon_PageBuilder/js/templates/builder/element/slider.html');
			},
			controller: function($scope, $controller) {
				var parent = $controller('baseController', {$scope: $scope});
				angular.extend(this, parent);

				$scope.owlSettings = {};
				$scope.owlItems = {};

				$scope.$watchCollection('element.items', function(items) {
					$scope.owlItems = angular.copy(items);
					initCarousel();
				}, true);

				function initCarousel() {
		        	$scope.additionalClass = '';
					var _element = $scope.element;
					var config = {
						nav: _element.owl_nav ? true : false,
						dots: _element.owl_dots ? true : false,
						autoplayHoverPause: _element.owl_autoplay_hover_pause ? true : false,
						autoplay: _element.owl_autoplay ? true : false,
						autoplayTimeout: parseFloat(_element.owl_autoplay_timeout),
						lazyLoad: _element.owl_lazyload ? true : false,
						loop: _element.owl_loop ? true : false,
						margin: _element.owl_margin ? parseFloat(_element.owl_margin) : 0,
						autoHeight: _element.owl_auto_height ? true : false,
						rtl: _element.owl_rtl ? true : false,
						center: _element.owl_center ? true : false,
						slideBy: _element.owl_slide_by ? _element.owl_slide_by : 1,
						stagePadding: _element.owl_stage_padding ? _element.owl_stage_padding : 0,
						dotsSpeed: _element.owl_dots_speed ? _element.owl_dots_speed : false,
						animateIn: _element.owl_animate_in,
						animateOut: _element.owl_animate_out,
						navText: _element.owl_rtl ? ['<i class="fas mgz-fa-angle-right"/>','<i class="fas mgz-fa-angle-left"/>'] : ['<i class="fas mgz-fa-angle-left"/>','<i class="fas mgz-fa-angle-right"/>']
					};

					config['responsive'] = {
		                0: {'items': _element.owl_item_xs ? parseInt(_element.owl_item_xs) : 1},
		                576: {'items': _element.owl_item_sm ? parseInt(_element.owl_item_sm) : 1},
		                768: {'items': _element.owl_item_md ? parseInt(_element.owl_item_md) : 1},
		                992: {'items': _element.owl_item_lg ? parseInt(_element.owl_item_lg) : 1},
		                1200: {'items': _element.owl_item_xl ? parseInt(_element.owl_item_xl) : 1}
		            };

		            $scope.additionalClass += ' mgz-carousel-nav-position-' + _element.owl_nav_position;
		            $scope.additionalClass += ' mgz-carousel-nav-size-' + _element.owl_nav_size;
		            $scope.additionalClass += ' hover-type-' + _element.hover_effect + '-hover_effect';
		            $scope.additionalClass += ' image-content-' + _element.content_position;
		            $scope.additionalClass += ' mgz-image-hovers';

		            if (_element.display_on_hover) $scope.additionalClass += ' item-content-hover';

		            if (_element.owl_dots_insie) {
		            	$scope.additionalClass += ' mgz-carousel-dot-inside';
		            }

					$scope.owlSettings = config;
				}

				$scope.$on('parentChanged', function(_element) {
					var owlItems    = angular.copy($scope.owlItems);
					$scope.owlItems = [];
					$scope.owlItems = owlItems;
				});
			},
			controllerAs: 'mgz'
		}
	}

	return directive;
});