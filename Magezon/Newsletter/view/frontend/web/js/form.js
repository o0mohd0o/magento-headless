define([
    'jquery',
    'underscore',
    'mage/template',
    'mage/mage'
], function ($, _, mageTemplate) {
    'use strict';

    $.widget('magezon.newsletter', {

        /**
         *
         * @private
         */
        _create: function () {
            this.initValidation();
        },

        initValidation: function () {
            var self = this;

            this.element.mage('validation', {
                submitHandler: function () {
                    if ($.isEmptyObject(self.element.validate().invalid)) {
                        self.ajaxSubmit($(self.element));
                    }
                }
            });
        },

        ajaxSubmit: function(form) {
            form.addClass('loading');
            form.find('button').attr('disabled', 'disabled');
            var self = this;
            var data = $(form).serialize();
            $.ajax({
                url: form.attr('action'),
                data: $(form).serialize(),
                type: 'post',
                dataType: 'json',
                success: function(res) {
                    form.find('button').removeAttr('disabled', 'disabled');
                    form.removeClass('loading');
                    form.parent().children('.mgz-newsletter-message').remove();
                    if (res.message) {
                        var message = '<div class="mgz-newsletter-message ' + (res.status ? 'mgz-newsletter-message-success' : 'mgz-newsletter-message-error') + '">' + res.message + '</div>';
                        form.parent().append(message);
                    }
                    if (res.status) {
                        $.ajax({
                            url: self.options.emailAjaxUrl,
                            data: data,
                            type: 'post',
                            dataType: 'json',
                            success: function(res) {
                                if (res.status) {

                                }
                            }
                        });
                    }
                }
            });
        }
    });

    return $.magezon.newsletter;
});