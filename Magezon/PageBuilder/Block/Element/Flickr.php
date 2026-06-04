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

class Flickr extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = $this->getLineStyles();
        $element   = $this->getElement();
        $gap       = $element->getData('gap');
        if ($gap) {
            $gap    = (float) $gap / 2;
            $styles = [];
            $styles['padding'] = $this->getStyleProperty($gap);
            $styleHtml .= $this->getStyles([
                '.mgz-grid-item',
                '.error-wrapper'
            ], $styles);

            $styles = [];
            $styles['margin-left'] = '-' . $this->getStyleProperty($gap);
            $styles['margin-right'] = '-' . $this->getStyleProperty($gap);
            $styleHtml .= $this->getStyles('.gallery-container', $styles);
        }

        return $styleHtml;
    }
}
