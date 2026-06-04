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

class Icon extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = '';
        $element   = $this->getElement();

        // NORMAL STYLES
        $styles = [];
        if ($element->hasData('icon_border_width')) {
            $styles['border-width'] = $this->getStyleProperty($element->getData('icon_border_width'));
            $styles['border-style'] = $element->getData('icon_border_style');
            $styles['border-color'] = $this->getStyleColor($element->getData('icon_border_color'));
        }

        if ($element->hasData('icon_border_radius')) {
            $styles['border-radius'] = $this->getStyleProperty($element->getData('icon_border_radius'));
        }
        $styles['color']            = $this->getStyleColor($element->getData('icon_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('icon_background_color'));
        $styleHtml .= $this->getStyles('.mgz-icon-wrapper', $styles);

        // HOVER
        $styles = [];
        $styles['color']            = $this->getStyleColor($element->getData('icon_hover_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('icon_hover_background_color'));
        $styles['border-color']     = $this->getStyleColor($element->getData('icon_hover_border_color'));
        $styleHtml .= $this->getStyles('.mgz-icon-wrapper', $styles, ':hover');

        // CUSTOM CSS
        if ($element->getData('icon_css')) {
            $styleHtml .= '.mgz-element.' . $this->getElement()->getHtmlId() . ' .mgz-icon-wrapper{';
                $styleHtml .= $element->getData('icon_css');
            $styleHtml .= '}';
        }
        return $styleHtml;
    }
}
