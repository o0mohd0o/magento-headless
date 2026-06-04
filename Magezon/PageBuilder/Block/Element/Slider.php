<?php
/**
 * Magezon
 *
 * This source file is subject to the Magezon Software License, which is available at https://www.magezon.com/license
 * Do not edit or add to this file if you wish to upgrade the to newer versions in the future.
 * If you wish to customize this module for your needs.
 * Please refer to https://www.magezon.com for more information.
 *
 * @category  Magezon
 * @package   Magezon_PageBuilder
 * @copyright Copyright (C) 2019 Magezon (https://www.magezon.com)
 */

namespace Magezon\PageBuilder\Block\Element;

class Slider extends \Magezon\Builder\Block\Element
{
    /**
     * @param $slide
     * @return string
     */
    public function getIframeSrc($slide)
    {
        $src = '';
        if ($slide['background_type'] == 'youtube' && $slide['youtube_id']) {
            $params['mute']                         = $slide['video_mute'] ? 1 : 0;
            $params['modestbranding']               = $slide['video_modest_branding'] ? 1 : 0;
            $params['rel']                          = $slide['video_related_videos'] ? 1 : 0;
            if ($slide['loop']) {
                $params['playlist'] = $slide['youtube_id'];
            }
            $src = 'https://www.youtube.com/embed/' . $slide['youtube_id'] . '?' . http_build_query($params);
        }
        if ($slide['background_type'] == 'vimeo' && $slide['vimeo_id']) {
            $src = 'https://player.vimeo.com/video/' . $slide['vimeo_id'];
        }
        return $src;
    }

    /**
     * @return string
     */
    public function getHtmlId()
    {
        return '.mgz-element.' . $this->getElement()->getHtmlId() . ' .mgz-carousel';
    }

    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $element   = $this->getElement();
        $htmlId    = $element->getHtmlId();
        $styleHtml = $this->getOwlCarouselStyles();
        $styleHtml .= $this->getLineStyles();
        $items  = $this->toObjectArray($element->getItems());
        foreach ($items as $i => $item) {
            $id = '#' . $htmlId . '-slider-item' . $i;
            if ($item['heading']) {
                $styles                = [];
                $styles['font-size']   = $this->getStyleProperty($item['heading_font_size']);
                $styles['line-height'] = $this->getStyleProperty($item['heading_line_height']);
                $styles['font-weight'] = $item['heading_font_weight'];
                $styles['padding']     = $this->getStyleProperty($item['heading_padding']);
                $styles['color']       = $this->getStyleColor($item['heading_color']);
                $styles['background-color'] = $this->getStyleColor($item['heading_bg_color']);
                $styleHtml .= $this->getStyles($id . ' .slide-heading .slide-text', $styles);
                $styles = [];
                $styles['margin-bottom'] = $this->getStyleProperty($item['heading_distance']);
                $styleHtml .= $this->getStyles('.slide-heading', $styles);
            }

            if ($item['caption1']) {
                $styles                = [];
                $styles['font-size']   = $this->getStyleProperty($item['caption1_font_size']);
                $styles['line-height'] = $this->getStyleProperty($item['caption1_line_height']);
                $styles['font-weight'] = $item['caption1_font_weight'];
                $styles['padding']     = $this->getStyleProperty($item['caption1_padding']);
                $styles['color']       = $this->getStyleColor($item['caption1_color']);
                $styles['background-color'] = $this->getStyleColor($item['caption1_bg_color']);
                $styleHtml .= $this->getStyles($id . ' .slide-caption1 .slide-text', $styles);
                $styles = [];
                $styles['margin-bottom'] = $this->getStyleProperty($item['caption1_distance']);
                $styleHtml .= $this->getStyles('.slide-caption1', $styles);
            }

            if ($item['caption2']) {
                $styles                = [];
                $styles['font-size']   = $this->getStyleProperty($item['caption2_font_size']);
                $styles['line-height'] = $this->getStyleProperty($item['caption2_line_height']);
                $styles['font-weight'] = $item['caption2_font_weight'];
                $styles['padding']     = $this->getStyleProperty($item['caption2_padding']);
                $styles['color']       = $this->getStyleColor($item['caption2_color']);
                $styles['background-color'] = $this->getStyleColor($item['caption2_bg_color']);
                $styleHtml .= $this->getStyles($id . ' .slide-caption2 .slide-text', $styles);
                $styles = [];
                $styles['margin-bottom'] = $this->getStyleProperty($item['caption2_distance']);
                $styleHtml .= $this->getStyles('.slide-caption2', $styles);
            }

            if ($item['button1']) {
                $styles = [];
                if ($item['button1_border_width'] && $item['button1_border_color'] && $item['button1_border_style'] && $item['button1_border_style'] != 'none') {
                    $styles['border-width'] = $this->getStyleProperty($item['button1_border_width']);
                    $styles['border-style'] = $item['button1_border_style'];
                    $styles['border-color'] = $this->getStyleColor($item['button1_border_color']);
                }
                $styles['border-radius'] = $this->getStyleProperty($item['button1_border_radius']);
                $styles['font-size']   = $this->getStyleProperty($item['button1_font_size']);
                $styles['line-height'] = $this->getStyleProperty($item['button1_line_height']);
                $styles['font-weight'] = $item['button1_font_weight'];
                $styles['padding']     = $this->getStyleProperty($item['button1_padding']);
                $styles['color']       = $this->getStyleColor($item['button1_color']);
                $styles['background-color'] = $this->getStyleColor($item['button1_bg_color']);
                $styleHtml .= $this->getStyles($id . ' .slide-button1 .mgz-btn', $styles);

                $styles = [];
                $styles['color'] = $this->getStyleColor($item['button1_hover_color']);
                $styles['background-color'] = $this->getStyleColor($item['button1_hover_bg_color']);
                $styles['border-color'] = $this->getStyleColor($item['button1_hover_border_color']);
                $styleHtml .= $this->getStyles($id . ' .slide-button1 .mgz-btn:hover', $styles);
            }

            if ($item['button2']) {
                $styles = [];
                if ($item['button2_border_width'] && $item['button2_border_color'] && $item['button2_border_style'] && $item['button2_border_style'] != 'none') {
                    $styles['border-width'] = $this->getStyleProperty($item['button2_border_width']);
                    $styles['border-style'] = $item['button2_border_style'];
                    $styles['border-color'] = $this->getStyleColor($item['button2_border_color']);
                }
                $styles['border-radius'] = $this->getStyleProperty($item['button2_border_radius']);
                $styles['font-size']   = $this->getStyleProperty($item['button2_font_size']);
                $styles['line-height'] = $this->getStyleProperty($item['button2_line_height']);
                $styles['font-weight'] = $item['button2_font_weight'];
                $styles['padding']     = $this->getStyleProperty($item['button2_padding']);
                $styles['color']       = $this->getStyleColor($item['button2_color']);
                $styles['background-color'] = $this->getStyleColor($item['button2_bg_color']);
                $styleHtml .= $this->getStyles($id . ' .slide-button2 .mgz-btn', $styles);

                $styles = [];
                $styles['color'] = $this->getStyleColor($item['button2_hover_color']);
                $styles['background-color'] = $this->getStyleColor($item['button2_hover_bg_color']);
                $styles['border-color'] = $this->getStyleColor($item['button2_hover_border_color']);
                $styleHtml .= $this->getStyles($id . ' .slide-button2 .mgz-btn:hover', $styles);
            }

            if ($item['heading'] || $item['caption1'] || $item['caption2'] || $item['button1'] || $item['button2']) {
                $styles = [];
                $styles['text-align'] = $item['content_align'];
                $styles['max-width']  = $this->getStyleProperty($item['content_width']);
                $styles['padding']    = $this->getStyleProperty($item['content_padding']);
                $styleHtml .= $this->getStyles($id . ' .item-content', $styles);
                $styles = [];
                $styles['max-width']  = $this->getStyleProperty($item['content_wrapper_width']);
                $styleHtml .= $this->getStyles($id . ' .item-content-wrapper', $styles);
            }
        }

        return $styleHtml;
    }
}
