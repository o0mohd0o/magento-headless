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

class Toggle extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = '';
        $element   = $this->getElement();
        $iconStyle = $element->getData('icon_style');

        // NORMAL STYLES
        $styles = [];

        if ($iconStyle == 'default') {
            $styles['color'] = $this->getStyleColor($element->getData('icon_color'));
        }

        if ($iconStyle == 'round') {
            $styles['background-color'] = $this->getStyleColor($element->getData('icon_color'));
        }

        if ($iconStyle == 'round_outline') {
            $styles['color'] = $this->getStyleColor($element->getData('icon_color'));
            $styles['border-color'] = $this->getStyleColor($element->getData('icon_color'));
        }

        if ($iconStyle == 'square') {
            $styles['background-color'] = $this->getStyleColor($element->getData('icon_color'));
        }

        if ($iconStyle == 'square_outline') {
            $styles['color'] = $this->getStyleColor($element->getData('icon_color'));
            $styles['border-color'] = $this->getStyleColor($element->getData('icon_color'));
        }

        $styleHtml .= $this->getStyles('.mgz-toggle span[data-role="icons"]', $styles);

        return $styleHtml;
    }
}
