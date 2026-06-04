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

class CallToAction extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml    = parent::getButtonStyleHtml();
        $element      = $this->getElement();
        $imagePostion = $element->getData('image_position');

        $styles = [];
        $styles['border-radius'] = $this->getStyleProperty($element->getData('box_border_radius'));
        $styleHtml .= $this->getStyles('.mgz-cta', $styles);

        $styles = [];
        $styles['text-align'] = $element->getData('align');
        $styles['min-height'] = $this->getStyleProperty($element->getData('content_min_height'));
        $styles['padding'] = $this->getStyleProperty($element->getData('content_padding'));
        if ($imagePostion !== 'cover') {
            $styles['background-color'] = $this->getStyleColor($element->getData('content_background_color'));
        }
        $styles['max-width'] = $this->getStyleProperty($element->getData('content_wrapper_width'));
        $styleHtml .= $this->getStyles('.mgz-cta-content', $styles);

        $styles = [];
        $styles['width'] = $this->getStyleProperty($element->getData('content_width'));
        $styleHtml .= $this->getStyles('.mgz-cta-content-inner', $styles);

        if ($imagePostion !== 'cover') {
            $styles = [];
            $styles['background-color'] = $this->getStyleColor($element->getData('content_hover_background_color'));
            $styleHtml .= $this->getStyles('.mgz-cta:hover .mgz-cta-content', $styles);
        }
        
        $styles = [];
        $styles['margin-bottom'] = $this->getStyleProperty($element->getData('title_spacing'));
        $styles['font-size'] = $this->getStyleProperty($element->getData('title_font_size'));
        $styles['color'] = $this->getStyleColor($element->getData('title_color'));
        $styleHtml .= $this->getStyles('.mgz-cta-title', $styles);

        $styles = [];
        $styles['color'] = $this->getStyleColor($element->getData('title_hover_color'));
        $styleHtml .= $this->getStyles('.mgz-cta:hover .mgz-cta-title', $styles);

        $styles = [];
        $styles['margin-bottom'] = $this->getStyleProperty($element->getData('description_spacing'));
        $styles['color'] = $this->getStyleColor($element->getData('description_color'));
        $styleHtml .= $this->getStyles('.mgz-cta-description', $styles);

        $styles = [];
        $styles['margin-bottom'] = $this->getStyleProperty($element->getData('icon_spacing'));
        $styleHtml .= $this->getStyles('.mgz-icon-wrapper', $styles);

        $styles = [];
        $styles['color'] = $this->getStyleColor($element->getData('description_hover_color'));
        $styleHtml .= $this->getStyles('.mgz-cta:hover .mgz-cta-description', $styles);

        if ($imagePostion !== 'cover') {
            $styles = [];
            $styles['min-width'] = $this->getStyleProperty($element->getData('image_min_width'));
            $styles['min-height'] = $this->getStyleProperty($element->getData('image_min_height'));
            $styleHtml .= $this->getStyles('.mgz-cta-bg-wrapper', $styles);
        }

        if ($element->getData('label')) {
            $styles = [];
            $styles['color'] = $this->getStyleColor($element->getData('label_color'));
            $styles['background-color'] = $this->getStyleColor($element->getData('label_background_color'));
            $styleHtml .= $this->getStyles('.mgz-cta-label-inner', $styles);

            $styles = [];
            $styles['color'] = $this->getStyleColor($element->getData('hover_label_color'));
            $styles['background-color'] = $this->getStyleColor($element->getData('hover_label_background_color'));
            $styleHtml .= $this->getStyles('.mgz-cta:hover .mgz-cta-label-inner', $styles);
        }

        if ($element->getData('image_animation_duration')) {
            $styles = [];
            $styles['transition-duration'] = $element->getData('image_animation_duration') . 'ms';
            $styleHtml .= $this->getStyles(['.mgz-cta-bg', '.mgz-cta-bg-overlay'], $styles);
        }

        if ($element->getData('label_distance')!='') {
            $styles = [];
            $labelDistance = $this->getStyleProperty($element->getData('label_distance'));
            $styles['margin-top'] = $labelDistance;
            $styles['transform']  = 'translateY(-50%) translateX(-50%) translateX('. $labelDistance .') rotate(-45deg)';
            $styleHtml .= $this->getStyles('.mgz-cta-label-inner', $styles);
        }

        $styles = [];
        $styles['background-color'] = $this->getStyleColor($element->getData('overlay_color'));
        $styleHtml .= $this->getStyles('.mgz-cta-bg-overlay', $styles);

        $styles = [];
        $styles['background-color'] = $this->getStyleColor($element->getData('overlay_hover_color'));
        $styleHtml .= $this->getStyles('.mgz-cta:hover .mgz-cta-bg-overlay', $styles);

        if ($element->getData('icon')) {
            $styles = [];
            $styles['color'] = $this->getStyleColor($element->getData('icon_color'));
            $styleHtml .= $this->getStyles('.mgz-icon-element', $styles);

            $styles = [];
            $styles['color'] = $this->getStyleColor($element->getData('hover_icon_color'));
            $styleHtml .= $this->getStyles('.mgz-cta:hover .mgz-icon-element', $styles);
        }

        return $styleHtml;
    }
}
