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

class MessageBox extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = '';
        $element   = $this->getElement();
    
        // Box
        $styles = [];
        $styles['color'] = $this->getStyleColor($element->getData('message_box_color'));
        $styles['border-color'] = $this->getStyleColor($element->getData('message_box_border_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('message_box_background_color'));
        if ($element->getData('message_box_border_width')!='') {
            $styles['border-width'] = $this->getStyleProperty($element->getData('message_box_border_width'));
            $styles['border-style'] = $this->getStyleProperty($element->getData('message_box_border_style'));
        }
        $styles['border-radius'] = $this->getStyleProperty($element->getData('message_box_border_radius'));
        $styleHtml .= $this->getStyles('.mgz-message-box', $styles);

        // Icon
        $styles = [];
        $styles['color'] = $this->getStyleColor($element->getData('message_icon_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('message_icon_background_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('message_icon_background_color'));
        $styleHtml .= $this->getStyles(['.mgz-message-box-icon', '.mgz-message-box-icon i'], $styles);

        $styles = [];
        $styles['font-size'] = $this->getStyleProperty($element->getData('icon_size'));
        $styleHtml .= $this->getStyles('.mgz-message-box-icon i', $styles);

        return $styleHtml;
    }
}
