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
 * @package   Magezon_Newsletter
 * @copyright Copyright (C) 2020 Magezon (https://www.magezon.com)
 */

namespace Magezon\Newsletter\Block\Element;

class NewsletterForm extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = '';
        $element = $this->getElement();
        if ($element->getData('title')) {
            $styles                  = [];
            $styles['color']         = $this->getStyleColor($element->getData('title_color'));
            $styles['margin-bottom'] = $this->getStyleProperty($element->getData('title_spacing'));
            $styles['font-size']     = $this->getStyleProperty($element->getData('title_font_size'));
            $styles['font-weight']   = $element->getData('title_font_weight');
            $styleHtml .= $this->getStyles('.newsletter-title', $styles);
        }

        $buttonSelector = '.mgz-newsletter-btn';
        $styles = [];
        $styles['color']            = $this->getStyleColor($element->getData('button_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('button_background_color'));
        $styles['border-color']     = $this->getStyleColor($element->getData('button_border_color'));
        $styles['border-width']     = $this->getStyleProperty($element->getData('button_border_width'));
        $styles['border-style']     = $element->getData('button_border_style');
        if ($element->getData('btn_fullwidth') && ($element->getData('btn_fullwidth') !== 'false')) {
            $styles['width'] = '100%';
        }
        $styleHtml .= $this->getStyles($buttonSelector, $styles);

        $styles = [];
        $styles['color']            = $this->getStyleColor($element->getData('button_hover_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('button_hover_background_color'));
        $styles['border-color']     = $this->getStyleColor($element->getData('button_hover_border_color'));
        $styleHtml .= $this->getStyles($buttonSelector, $styles, ':hover');

        return $styleHtml;
    }
}
