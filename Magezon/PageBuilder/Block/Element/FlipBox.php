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

class FlipBox extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = parent::getButtonStyleHtml();
        $element   = $this->getElement();

        $styles                     = [];
        $styles['color']            = $this->getStyleColor($element->getData('primary_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('primary_background_color'));
        $styles['border-radius']    = $this->getStyleProperty($element->getData('box_border_radius'));
        $styles['text-align']       = $element->getData('primary_align');
        $styleHtml .= $this->getStyles('.mgz-flipbox-front', $styles);

        $styles                     = [];
        $styles['color']            = $this->getStyleColor($element->getData('hover_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('hover_background_color'));
        $styles['border-radius']    = $this->getStyleProperty($element->getData('box_border_radius'));
        $styles['text-align']       = $element->getData('hover_align');
        $styleHtml .= $this->getStyles('.mgz-flipbox-back', $styles);

        $styles = [];
        $styles['font-size'] = $this->getStyleProperty($element->getData('title_font_size'));
        $styles['font-weight'] = $this->getStyleProperty($element->getData('title_font_weight'));
        $styleHtml .= $this->getStyles('.mgz-flipbox-title', $styles);

        if ($element->getData('flip_duration')) {
            $styles = [];
            $styles['transition-duration'] = $element->getData('flip_duration') . 's';
            $styleHtml .= $this->getStyles(['.mgz-flipbox-front', '.mgz-flipbox-back'], $styles);
        }

        if ($element->getData('box_border_width')) {
            if ($element->getData('primary_border_color')) {
                $styles = [];
                $styles['border-width'] = $this->getStyleProperty($element->getData('box_border_width'));
                $styles['border-color'] = $this->getStyleProperty($element->getData('primary_border_color'));
                $styles['border-style'] = 'solid';
                $styleHtml .= $this->getStyles('.mgz-flipbox-front', $styles);
            }
            if ($element->getData('hover_border_color')) {
                $styles = [];
                $styles['border-width'] = $this->getStyleProperty($element->getData('box_border_width'));
                $styles['border-color'] = $this->getStyleProperty($element->getData('hover_border_color'));
                $styles['border-style'] = 'solid';
                $styleHtml .= $this->getStyles('.mgz-flipbox-back', $styles);
            }
        }

        if ($element->getData('icon')) {
            $styles = [];
            $styles['color'] = $this->getStyleColor($element->getData('icon_color'));
            $styleHtml .= $this->getStyles('.mgz-flipbox-circle i', $styles);
            if ($element->getData('circle')) {
                $styles = [];
                $styles['background-color'] = $this->getStyleColor($element->getData('circle_background_color'));
                $styles['border-color']     = $this->getStyleColor($element->getData('circle_border_color'));
                $styles['border-width']     = $this->getStyleProperty($element->getData('circle_border_width'));
                $styleHtml .= $this->getStyles('.mgz-flipbox-circle', $styles);
            }
        }

        return $styleHtml;
    }
}
