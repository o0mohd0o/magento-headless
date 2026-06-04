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

class PricingTable extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = '';
        $element   = $this->getElement();

        if ($element->getData('table_spacing')!='') {
            $styles = [];
            $styles['padding-left']  = $this->getStyleProperty($element->getData('table_spacing'));
            $styles['padding-right'] = $this->getStyleProperty($element->getData('table_spacing'));
            $styleHtml .= $this->getStyles('.mgz-pricing-table', $styles);

            $styles = [];
            $styles['margin-left']  = '-' . $this->getStyleProperty($element->getData('table_spacing'));
            $styles['margin-right'] = '-' . $this->getStyleProperty($element->getData('table_spacing'));
            $styleHtml .= $this->getStyles('.mgz-pricing-table-wrapper', $styles);
        }

        $styles = [];
        $styles['font-size']   = $this->getStyleProperty($element->getData('heading_font_size'));
        $styles['font-weight'] = $element->getData('heading_font_weight');
        $styles['color']       = $this->getStyleColor($element->getData('heading_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('heading_background_color'));
        $styleHtml .= $this->getStyles('.mgz-pricing-table-heading', $styles);

        $styles = [];
        $styles['font-size']        = $this->getStyleProperty($element->getData('heading_featured_font_size'));
        $styles['font-weight']      = $element->getData('heading_featured_font_weight');
        $styles['color']            = $this->getStyleColor($element->getData('heading_featured_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('heading_featured_background_color'));
        $styleHtml .= $this->getStyles('.mgz-pricing-table-featured .mgz-pricing-table-heading', $styles);

        $styles = [];
        $styles['font-size']   = $this->getStyleProperty($element->getData('price_font_size'));
        $styles['font-weight'] = $element->getData('price_font_weight');
        $styles['color']       = $this->getStyleColor($element->getData('price_color'));
        $styleHtml .= $this->getStyles('.mgz-pricing-table-price', $styles);

        $styles = [];
        $styles['color'] = $this->getStyleColor($element->getData('price_text_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('price_box_background_color'));
        $styleHtml .= $this->getStyles('.mgz-pricing-table-content-top', $styles);

        $styles                = [];
        $styles['font-size']   = $this->getStyleProperty($element->getData('price_featured_font_size'));
        $styles['font-weight'] = $element->getData('price_featured_font_weight');
        $styles['color']       = $this->getStyleColor($element->getData('price_featured_color'));
        $styleHtml .= $this->getStyles('.mgz-pricing-table-featured .mgz-pricing-table-price', $styles);

        $styles = [];
        $styles['color'] = $this->getStyleColor($element->getData('price_featured_text_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('price_box_featured_background_color'));
        $styleHtml .= $this->getStyles('.mgz-pricing-table-featured .mgz-pricing-table-content-top', $styles);

        $styles                = [];
        $styles['font-size']   = $this->getStyleProperty($element->getData('features_font_size'));
        $styles['font-weight'] = $element->getData('features_font_weight');
        $styles['text-align']  = $element->getData('features_text_align');
        $styleHtml .= $this->getStyles('.mgz-pricing-table-content', $styles);

        $styles                     = [];
        $styles['font-size']        = $this->getStyleProperty($element->getData('button_font_size'));
        $styles['font-weight']      = $element->getData('button_font_weight');
        $styles['border-radius']    = $this->getStyleProperty($element->getData('button_border_radius'));
        $styles['color']            = $this->getStyleColor($element->getData('button_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('button_background_color'));
        $styleHtml .= $this->getStyles('.mgz-btn', $styles);

        $styles                     = [];
        $styles['color']            = $this->getStyleColor($element->getData('button_hover_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('button_hover_background_color'));
        $styleHtml .= $this->getStyles('.mgz-btn', $styles, ':hover');

        return $styleHtml;
    }
}
