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

class IconList extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = '';
        $element   = $this->getElement();

        if ($element->getData('items')) {
            $styles = [];
            if ($element->getSpacing()) {
                $spacing = $this->getStyleProperty($element->getSpacing());
                if ($element->getLayout() == 'horizontal') {
                    $styles['margin-right'] = $spacing;
                }
                if ($element->getLayout() == 'vertical') {
                    $styles['margin-bottom'] = $spacing;
                }
            }
            $styleHtml .= $this->getStyles('.mgz-icon-list-item', $styles);

            // ICON
            $styles = [];
            $styles['font-size']        = $this->getStyleProperty($element->getData('icon_size'));
            $styles['border-radius']    = $this->getStyleProperty($element->getData('icon_border_radius'));
            $styles['color']            = $this->getStyleColor($element->getData('icon_color'));
            $styles['background-color'] = $this->getStyleColor($element->getData('icon_background_color'));
            $styleHtml .= $this->getStyles('.mgz-icon-list-item-icon', $styles);

            $styles = [];
            $styles['color']            = $this->getStyleColor($element->getData('icon_hover_color'));
            $styles['background-color'] = $this->getStyleColor($element->getData('icon_hover_background_color'));
            $styleHtml .= $this->getStyles('.mgz-icon-list-item-icon', $styles, ':hover');

            // TEXT
            $styles = [];
            $styles['font-size']   = $this->getStyleProperty($element->getData('text_size'));
            $styles['color']       = $this->getStyleColor($element->getData('text_color'));
            $styles['font-weight'] = $element->getData('text_font_weight');
            $styleHtml .= $this->getStyles('.mgz-icon-list-item-text', $styles);

            $styles = [];
            $styles['color'] = $this->getStyleColor($element->getData('text_hover_color'));
            $styleHtml .= $this->getStyles('.mgz-icon-list-item-text', $styles, ':hover');
        }

        return $styleHtml;
    }
}
