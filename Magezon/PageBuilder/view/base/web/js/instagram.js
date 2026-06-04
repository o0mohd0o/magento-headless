define([
    'jquery',
    'mage/template',
    'Magezon_PageBuilder/js/photoswipe'
], function($, mageTemplate) {
    'use strict';

    $.widget('magezon.instagram', {
        _create: function () {
            var options = this.options;
            if(options.onclick =='photoswipe') {
                $('.' + options.html_id + ' .mgz-photoswipe').photoswipe(options.swipe_options);
            }
            $.ajax({
                url: 'https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=' + options.token,
                dataType: 'jsonp',
                type: 'GET',
                success: function(res){
                    var fileTmpl = mageTemplate($('#instagram-items').html()), i = 0, x, html = '';
                    for (x in res.data) {
                        if (i < options.max_items && (res.data[x].media_type == 'IMAGE' || res.data[x].media_type == 'CAROUSEL_ALBUM')) {
                            html += fileTmpl({item:res.data[x]});
                            i++;
                        }
                    }
                    $('#instagram-api-data').append(html);
                },
                error: function(){
                    console.log('Could not get Instagram data');
                }
            });
        }
    });

    return $.magezon.instagram;
});