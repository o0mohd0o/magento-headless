define([
    'jquery',
    'Magezon_PageBuilder/js/flickr-jquery',
    'Magezon_PageBuilder/vendor/imagesloaded/imagesloaded.pkgd.min',
    'Magezon_PageBuilder/vendor/blueimp/js/blueimp-gallery',
    'Magezon_PageBuilder/vendor/blueimp/js/blueimp-gallery-fullscreen',
    'Magezon_PageBuilder/vendor/blueimp/js/blueimp-gallery-indicator',
    'Magezon_PageBuilder/vendor/blueimp/js/blueimp-gallery-video',
    'Magezon_PageBuilder/vendor/blueimp/js/blueimp-gallery-vimeo',
    'Magezon_PageBuilder/vendor/blueimp/js/blueimp-gallery-youtube',
    'jquery-ui-modules/widget'
], function ($, flickrGallery, imagesloaded, blueimp) {
    'use strict';

    var html = '<div id="blueimp-gallery" class="blueimp-gallery blueimp-gallery-controls" style="display: none;"><div class="slides"></div><h3 class="title"></h3><a class="prev">‹</a><a class="next">›</a><a class="close">×</a><a class="play-pause"></a><ol class="indicator"></ol><div class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" aria-hidden="true">×</button><h4 class="modal-title"></h4></div><div class="modal-body next"></div><div class="modal-footer"><button type="button" class="btn btn-default pull-left prev"><i class="glyphicon glyphicon-chevron-left"></i> Previous</button><button type="button" class="btn btn-primary next">Next<i class="glyphicon glyphicon-chevron-right"></i></button></div></div></div></div></div>';

    if (!$('body').children('#blueimp-gallery').length) {
        $('body').append(html);
    }

    $.widget('magezon.flickrGallery', {
        _create: function () {
            this.element.flickr({
                apiKey: this.options.apiKey,
                photosetId: this.options.photosetId,
                loadingSpeed: 38,
                photosLimit: this.options.photosLimit ? this.options.photosLimit : 200,
                colClass: this.options.colClass,
                showPhotoTitle: this.options.showPhotoTitle
            });

            this.element.click(function(event) {
                event = event || window.event;
                var target = event.target || event.srcElement,
                    link = target.src ? target.parentNode : target,
                    options = { index: link, event: event},
                    links = this.getElementsByTagName('a');
                blueimp(links, options);
            });
        }
    });

    return $.magezon.flickrGallery;
});