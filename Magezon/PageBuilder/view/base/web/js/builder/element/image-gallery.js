define([
	'jquery',
	'angular'
], function($, angular) {

	var directive = function(magezonBuilderUrl) {
		return {
      		replace: true,
			templateUrl: function(elem) {
				return magezonBuilderUrl.getTemplateUrl(elem, 'Magezon_PageBuilder/js/templates/builder/element/image_gallery.html');
			},
			controller: function($scope, $controller) {
				var parent = $controller('baseController', {$scope: $scope});
				angular.extend(this, parent);
			},
			link: function(scope, element) {
				scope.galleryItems = [];
				scope.options = {};

				function initGallery() {
					var _element = scope.element;
					var options = {};
					options['nav']                 = _element.nav;
					options['navposition']         = _element.navposition;
					options['thumbwidth']          = _element.thumbwidth;
					options['thumbheight']         = _element.thumbheight;
					options['thumbmargin']         = _element.thumbmargin;
					options['allowfullscreen']     = _element.allowfullscreen;
					options['captions']            = _element.captions;
					options['loop']                = _element.loop;
					options['arrows']              = _element.arrows;
					options['autoplay']            = _element.autoplay;
					options['stopautoplayontouch'] = _element.stopautoplayontouch;
					options['click']               = _element.click;
					options['swipe']               = _element.swipe;
					options['keyboard']            = _element.keyboard;
					options['margin']              = _element.margin;
					options['trackpad']            = _element.trackpad;
					options['shuffle']             = _element.shuffle;
					options['shadows']             = _element.shadows;
					options['direction']           = _element.rtl ? 'rtl' : 'ltr';
					options['hash']                = _element.hash;
					options['fit']                 = _element.fit;
					options['transition']          = _element.transition;
					options['startindex']          = _element.startindex;
					options['ratio']               = _element.ratio;
					options['width']               = _element.width;
					options['minwidth']            = _element.minwidth;
					options['maxwidth']            = _element.maxwidth;
					options['height']              = _element.height;
					options['minheight']           = _element.minheight;
					options['maxheight']           = _element.maxheight;
					scope.options                  = options;

					var items = [];
					angular.forEach(_element.items, function(item, key) {
						var newItem = {
							type: item.type,
							caption: item.caption
						};

						if (item.type == 'media') {
							newItem['url']  = magezonBuilderUrl.getImageUrl(item.image);
							newItem['type'] = 'image';

							if (item.full_image) {
								newItem['full'] = magezonBuilderUrl.getImageUrl(item.full_image);
							}
						}

						if (item.type == 'link') {
							newItem['url']  = item.link;
							newItem['type'] = 'image';
						}

						if (item.type == 'video') {
							newItem['url'] = item.video_url;

							if (item.image) {
								newItem['thumb'] = magezonBuilderUrl.getImageUrl(item.image);
							}
						}

						items.push(newItem);
					});

					scope.galleryItems = items;
				}
				scope.loadElement = function() {
					initGallery();
				}
				initGallery();
				scope.$on('parentChanged', function(_element) {
					initGallery();
				});
			},
			controllerAs: 'mgz'
		}
	}

	return directive;
});