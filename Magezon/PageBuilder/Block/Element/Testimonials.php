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

class Testimonials extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getHtmlId()
    {
        return '.mgz-element.' . $this->getElement()->getHtmlId() . ' .owl-carousel';
    }

    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml       = '';
        $element         = $this->getElement();
        $testimonialType = $element->getData('testimonial_type');
        $items           = $this->toObjectArray($element->getData('items'));
        $id              = $element->getHtmlId();

        if ($items) {
            $styleHtml = $this->getOwlCarouselStyles();
            $styles                  = [];
            $styles['width']         = $this->getStyleProperty($element->getData('image_width'));
            $styles['border-radius'] = $this->getStyleProperty($element->getData('image_border_radius'));
            $styleHtml .= $this->getStyles('.mgz-testimonial-image img', $styles);

            if ($testimonialType == 'type1' || $testimonialType == 'type2') {
                $styles = [];
                $styles['background-color'] = $this->getStyleColor($element->getData('box_background_color'));
                $styles['color'] = $this->getStyleColor($element->getData('box_color'));
                $styles['border-radius'] = $this->getStyleProperty($element->getData('box_border_radius'));
                $styleHtml .= $this->getStyles('.mgz-testimonial', $styles);
                foreach ($items as $i => $_item) {
                    $_styles = [];
                    $_styles['color']            = $this->getStyleColor($_item['box_color']);
                    $_styles['background-color'] = $this->getStyleColor($_item['box_background_color']);
                    if ($this->parseStyles($_styles)) {
                        $styleHtml .= '.' . $id . ' .mgz-testimonial' . $i . '{';
                        $styleHtml .= $this->parseStyles($_styles);
                        $styleHtml .= '}';
                    }
                }
            }

            if ($testimonialType == 'type3') {
                $styles = [];
                $styles['background-color'] = $this->getStyleColor($element->getData('box_background_color'));
                $styles['color'] = $this->getStyleColor($element->getData('box_color'));
                $styles['border-radius'] = $this->getStyleProperty($element->getData('box_border_radius'));
                $styleHtml .= $this->getStyles('.mgz-testimonial-content', $styles);
                $styles = [];
                $styles['border-top-color'] = $this->getStyleColor($element->getData('box_background_color'));
                $styleHtml .= $this->getStyles('.mgz-testimonial-content:before', $styles);
                foreach ($items as $i => $_item) {
                    $_styles = [];
                    $_styles['color']            = $this->getStyleColor($_item['box_color']);
                    $_styles['background-color'] = $this->getStyleColor($_item['box_background_color']);
                    if ($this->parseStyles($_styles)) {
                        $styleHtml .= '.' . $id . ' .mgz-testimonial' . $i . ' .mgz-testimonial-content{';
                        $styleHtml .= $this->parseStyles($_styles);
                        $styleHtml .= '}';
                    }
                    $_styles = [];
                    $_styles['border-top-color'] = $this->getStyleColor($_item['box_background_color']);
                    if ($this->parseStyles($_styles)) {
                        $styleHtml .= '.' . $id . ' .mgz-testimonial' . $i . ' .mgz-testimonial-content:before{';
                        $styleHtml .= $this->parseStyles($_styles);
                        $styleHtml .= '}';
                    }
                }
            }

            $styles = [];
            $styles['font-size']  = $this->getStyleProperty($element->getData('content_font_size'));
            $styles['font-weight'] = $element->getData('content_font_weight');
            $styles['text-align'] = $element->getData('content_align');
            $styles['color'] = $this->getStyleColor($element->getData('content_color'));
            $styleHtml .= $this->getStyles('.mgz-testimonial-content', $styles);

            $styles = [];
            $styles['font-size'] = $this->getStyleProperty($element->getData('name_font_size'));
            $styles['font-weight'] = $element->getData('name_font_weight');
            $styles['color'] = $this->getStyleColor($element->getData('name_color'));
            $styleHtml .= $this->getStyles('.mgz-testimonial-name', $styles);

            $styles = [];
            $styles['font-size'] = $this->getStyleProperty($element->getData('job_font_size'));
            $styles['font-weight'] = $element->getData('job_font_weight');
            $styles['color'] = $this->getStyleColor($element->getData('job_color'));
            $styleHtml .= $this->getStyles('.mgz-testimonial-job', $styles);
        }

        return $styleHtml;
    }
}
