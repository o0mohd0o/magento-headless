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

class Accordion extends \Magezon\Builder\Block\Element
{
    /**
     * @return array
     */
    public function getWrapperClasses()
    {
        $classes = parent::getWrapperClasses();

        $element = $this->getElement();

        $classes[] = 'mgz-element-accordion-align-' . $element->getTabAlign();

        return $classes;
    }
    
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml                 = '';
        $element                   = $this->getElement();
        $id                        = $element->getId();
        //$noFillContentArea         = $element->getData('no_fill_content_area');

        $panelSelector   = '.mgz-panels-' . $id . ' > .mgz-panel';
        $headingSelector = '.mgz-panels-' . $id . ' > .mgz-panel > .mgz-panel-heading';
        $bodySelector    = '.mgz-panels-' . $id . ' > .mgz-panel > .mgz-panel-body';

        // PANEL
        if ($element->hasData('gap')) {
            $styles = [];
            $styles['margin-bottom'] = $this->getStyleProperty($element->getData('gap'));
            $styleHtml .= $this->getStyles($panelSelector, $styles);
        }

        if ($element->hasData('spacing')) {
            $styles = [];
            $styles['margin-bottom'] = $this->getStyleProperty($element->getData('spacing'));
            $styleHtml .= $this->getStyles([
                $panelSelector . '.mgz-in > .mgz-panel-heading',
                $panelSelector . '.mgz-active > .mgz-panel-heading'
            ], $styles);
        }

        // NORMAL
        $styles = [];
        $styles['border-width']  = $this->getStyleProperty($element->getData('section_border_width'));
        $styles['border-radius'] = $this->getStyleProperty($element->getData('section_border_radius'));
        $styles['border-style']  = $element->getData('section_border_style');
        
        $styles['color']        = $this->getStyleColor($element->getData('section_color'));
        $styles['background']   = $this->getStyleColor($element->getData('section_background_color'));
        $styles['border-color'] = $this->getStyleColor($element->getData('section_border_color'));
        $styleHtml .= $this->getStyles([
            $headingSelector
        ], $styles);

        // HOVER
        $styles = [];
        $styles['color']        = $this->getStyleColor($element->getData('section_hover_color'));
        $styles['background']   = $this->getStyleColor($element->getData('section_hover_background_color'));
        $styles['border-color'] = $this->getStyleColor($element->getData('section_hover_border_color'));
        $styleHtml .= $this->getStyles([
            $panelSelector . ':not(.mgz-active):hover > .mgz-panel-heading'
        ], $styles, ':hover');

        // ACTIVE
        $styles = [];
        $styles['color']        = $this->getStyleColor($element->getData('section_active_color'));
        $styles['background']   = $this->getStyleColor($element->getData('section_active_background_color'));
        $styles['border-color'] = $this->getStyleColor($element->getData('section_active_border_color'));
        $styleHtml .= $this->getStyles([
            $panelSelector . '.mgz-active > .mgz-panel-heading'
        ], $styles);

        $styles                  = [];
        $styles['background']    = $this->getStyleColor($element->getData('section_content_background_color'));
        $styles['border-color']  = $this->getStyleColor($element->getData('section_active_border_color'));
        $styles['border-width']  = $this->getStyleProperty($element->getData('section_border_width'));
        $styles['border-radius'] = $this->getStyleProperty($element->getData('section_border_radius'));
        $styleHtml .= $this->getStyles($bodySelector, $styles);

        $styles            = [];
        $styles['padding'] = $this->getStyleProperty($element->getData('section_content_padding'));
        $styleHtml .= $this->getStyles($bodySelector . ' > .mgz-panel-body-inner', $styles);

        $styles              = [];
        $styles['font-size'] = $this->getStyleProperty($element->getData('title_font_size'));
        $styleHtml .= $this->getStyles($headingSelector . ' .mgz-panel-heading-title', $styles);

        return $styleHtml;
    }
}
