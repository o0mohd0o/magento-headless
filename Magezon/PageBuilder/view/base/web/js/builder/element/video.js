define([
	'jquery',
	'angular'
], function($, angular) {

	var directive = function(magezonBuilderUrl) {
		return {
      		replace: true,
			templateUrl: function(elem) {
				return magezonBuilderUrl.getTemplateUrl(elem, 'Magezon_PageBuilder/js/templates/builder/element/video.html');
			},
			controller: function($scope, $controller) {
				var parent = $controller('baseController', {$scope: $scope});
				angular.extend(this, parent);

				$scope.loadElement = function() {
					$scope.link = $scope.getVideoLink();
				}

				$scope.YouTubeGetID = function(url) {
					var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
				    var match = url.match(regExp);
				    return (match&&match[7].length==11) ? match[7] : false;
				}

				$scope.getLinkParams = function() {
					$params  = {};
					$element = $scope.element;
					if ($element.autoplay) $params['autoplay'] = 1;
					$params['loop'] = $element.loop ? 1 : 0;

					if ($element.video_type == 'youtube') {
						$params['mute']           = $element.mute ? 1 : 0;
						$params['controls']       = $element.controls ? 1 : 0;
						$params['modestbranding'] = $element.modest_branding ? 1 : 0;
						$params['rel']            = $element.related_videos ? 1 : 0;
						if (!isNaN($element.start_at) && parseInt($element.start_at)!='') {
							$params['start'] = parseInt($element.start_at);
						}
						if (!isNaN($element.end_at) && parseInt($element.end_at)!='') {
							$params['end'] = parseInt($element.end_at) ? parseInt($element.end_at) : '';
						}
						if ($element.loop) {
							$params['playlist'] = $scope.YouTubeGetID($link);
						}
					}

					if ($element.video_type == 'vimeo') {
						$params['muted']     = $element.mute ? 1 : 0;
						$params['controls']       = $element.controls ? 1 : 0;
						$params['title']     = $element.vimeo_title ? 1 : 0;
						$params['portrait']  = $element.vimeo_portrait ? 1 : 0;
						$params['byline']    = $element.vimeo_byline ? 1 : 0;
						if ($element.video_color) {
							$params['color'] = $element.video_color.replace('#', '');
						}
						$params['api']       = 1;
						$params['player_id'] = 'player';
						$params['autopause'] = 'false';
					}

					return $params;
				}

				$scope.getVideoLink = function() {
					$element = $scope.element;
					$link    = $element.link;

					if ($link.indexOf('youtube') !== -1 || $link.indexOf('youtu.be') !== -1 || $link.indexOf('vimeo') !== -1) {
						if ($link.indexOf('youtube') !== -1 || $link.indexOf('youtu.be') !== -1) {
							if ($scope.YouTubeGetID($link)) {
								$link = 'https://www.youtube.com/embed/' + $scope.YouTubeGetID($link);
							}
							if ($element.youtube_privacy) {
								$link = $link.replace('youtube.com', 'youtube-nocookie.com');
							}
						}
						if ($link.indexOf('vimeo') !== -1) {
							$link = $link.replace('vimeo.com', 'player.vimeo.com/video');
						}
					} else {
						$link = '';
					}

					if ($link) {
						var $params = $.param($scope.getLinkParams());
						if ($element.video_type == 'vimeo') {
							if (parseInt($element.start_at)) {
								$params += '#t=' + parseInt($element.start_at) + 's';
							}
						}
						$link += '?' + $params;
					}
					if ($element.link.indexOf('.mp4') !== -1) {
						$link = $element.link;
					}
					return $scope.trustAsResourceUrl($link);
				}

				$scope.link = $scope.getVideoLink();
			},
			controllerAs: 'mgz'
		}
	}

	return directive;
});