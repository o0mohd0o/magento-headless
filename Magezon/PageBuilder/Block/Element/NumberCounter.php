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

class NumberCounter extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = '';
        $element   = $this->getElement();
        $layout    = $element->getData('layout');

        $styles              = [];
        $styles['color']     = $this->getStyleColor($element->getData('text_color'));
        $styles['font-size'] = $this->getStyleProperty($element->getData('text_size'));
        $styleHtml .= $this->getStyles('.mgz-numbercounter-number-text', $styles);

        $styles              = [];
        $styles['color']     = $this->getStyleColor($element->getData('before_text_color'));
        $styles['font-size'] = $this->getStyleProperty($element->getData('before_text_size'));
        $styleHtml .= $this->getStyles('.mgz-numbercounter-before-text', $styles);
    
        $styles              = [];
        $styles['color']     = $this->getStyleColor($element->getData('after_text_color'));
        $styles['font-size'] = $this->getStyleProperty($element->getData('after_text_size'));
        $styleHtml .= $this->getStyles('.mgz-numbercounter-after-text', $styles);
    
        $styles              = [];
        $styles['color']     = $this->getStyleColor($element->getData('number_color'));
        $styles['font-size'] = $this->getStyleProperty($element->getData('number_size'));
        $styleHtml .= $this->getStyles(['.mgz-numbercounter-int', '.mgz-numbercounter-number-percent'], $styles);
    
        $styles              = [];
        $styles['color']     = $this->getStyleColor($element->getData('icon_color'));
        $styles['font-size'] = $this->getStyleProperty($element->getData('icon_size'));
        $styleHtml .= $this->getStyles('.mgz-numbercounter-icon', $styles);
        
        if ($layout == 'circle') {
            $styles           = [];
            $styles['width']  = $this->getStyleProperty($element->getData('circle_size'));
            $styleHtml .= $this->getStyles('.mgz-numbercounter-circle', $styles);

            $styles = [];
            $styles['stroke-width'] = $this->getStyleProperty($element->getData('circle_dash_width'));
            $styleHtml .= $this->getStyles('circle', $styles);

            $styles = [];
            $styles['stroke'] = $this->getStyleColor($element->getData('circle_color2'));
            $styleHtml .= $this->getStyles('.svg .mgz-element-bar-bg', $styles);

            $styles = [];
            $styles['stroke'] = $this->getStyleColor($element->getData('circle_color1'));
            $styleHtml .= $this->getStyles('.svg .mgz-element-bar', $styles);
        }

        if ($layout == 'bars') {
            $styles = [];
            $styles['background-color'] = $this->getStyleColor($element->getData('bar_color'));
            $styleHtml .= $this->getStyles('.mgz-numbercounter-bar', $styles);

            $styles = [];
            $styles['background-color'] = $this->getStyleColor($element->getData('bar_background_color'));
            $styleHtml .= $this->getStyles('.mgz-numbercounter-bars-container', $styles);
        }

        return $styleHtml;
    }
}
