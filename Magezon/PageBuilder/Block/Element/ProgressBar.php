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

class ProgressBar extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = '';
        $element   = $this->getElement();
        if (!$element->getData('items')) {
            return;
        }
        $styles    = [];
        $styles['color'] = $this->getStyleColor($element->getData('number_color'));
        $styles['font-size'] = $this->getStyleProperty($element->getData('number_size'));
        $styleHtml .= $this->getStyles('.mgz-numbercounter-string', $styles);

        $id = $element->getHtmlId();
        $items = $this->toObjectArray($element->getItems());

        foreach ($items as $i => $_item) {
            $_styles = [];
            $_styles['color'] = $this->getStyleColor($_item['color']);
            if ($this->parseStyles($_styles)) {
                $styleHtml .= '.' . $id . ' .mgz-single-bar-' . $i . ' .mgz-numbercounter-string{';
                $styleHtml .= $this->parseStyles($_styles);
                $styleHtml .= '}';
            }
            $_styles = [];
            $_styles['background-color'] = $this->getStyleColor($_item['background_color']);
            if ($element->getData('bar_border_style')!='none') {
                $_styles['border-color'] = $this->getStyleColor($_item['border_color']);
            }
            if ($this->parseStyles($_styles)) {
                $styleHtml .= '.' . $id . ' .mgz-single-bar-' . $i . ' .mgz-numbercounter-bar{';
                $styleHtml .= $this->parseStyles($_styles);
                $styleHtml .= '}';
            }
            $_styles = [];
            $_styles['background-color'] = $this->getStyleColor($_item['unfilled_color']);
            if ($this->parseStyles($_styles)) {
                $styleHtml .= '.' . $id . ' .mgz-single-bar-' . $i . ' .mgz-single-bar-inner{';
                $styleHtml .= $this->parseStyles($_styles);
                $styleHtml .= '}';
            }
        }

        $styles = [];
        $styles['border-radius'] = $this->getStyleProperty($element->getData('bar_border_radius'));
        $styles['border-style']  = $element->getData('bar_border_style');
        if ($element->getData('bar_border_style')!='none') {
            $styles['border-width']  = $this->getStyleProperty($element->getData('bar_border_width'));
        }
        $styleHtml .= $this->getStyles('.mgz-numbercounter-bar', $styles);

        $styles = [];
        $styles['line-height'] = $this->getStyleProperty($element->getData('bar_height'));
        $styles['min-height'] = $this->getStyleProperty($element->getData('bar_height'));
        $styles['border-radius'] = $this->getStyleProperty($element->getData('bar_border_radius'));
        $styleHtml .= $this->getStyles('.mgz-single-bar-inner', $styles);

        $styles = [];
        $styles['font-size'] = $this->getStyleProperty($element->getData('label_font_size'));
        $styles['font-weight'] = $element->getData('label_font_weight');
        $styleHtml .= $this->getStyles('.mgz-numbercounter-string', $styles);

        return $styleHtml;
    }
}
