define([
    'jquery',
    'Magezon_PageBuilder/vendor/fotorama/fotorama',
    'jquery-ui-modules/widget'
], function ($, fotorama) {
    'use strict';

    $.widget('magezon.gallery', {
        options: {

        },

        _create: function () {
            var options = this.options;
            if (options['thumbheight']) options['thumbheight'] = parseFloat(options['thumbheight']);
            if (options['thumbwidth']) options['thumbwidth'] = parseFloat(options['thumbwidth']);
            if (options['thumbmargin']) options['thumbmargin'] = parseFloat(options['thumbmargin']);
            $(this.element).fotorama(options);
        }
    });

    return $.magezon.gallery;
});