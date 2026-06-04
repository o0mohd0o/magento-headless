<?php
/**
 * Magezon
 *
 * This source file is subject to the Magezon Software License, which is available at https://www.magezon.com/license.
 * Do not edit or add to this file if you wish to upgrade the to newer versions in the future.
 * If you wish to customize this module for your needs.
 * Please refer to https://www.magezon.com for more information.
 *
 * @category  Magezon
 * @package   Magezon_PageBuilderPageableContainer
 * @author    quanth@magezon.com
 * @copyright Copyright (C) 2020 Magezon (https://www.magezon.com)
*/

namespace Magezon\PageBuilderPageableContainer\Block\Element;

class PageableContainer extends \Magezon\Builder\Block\Element

{
	/**
	 * @return string
	 */
	public function getAdditionalStyleHtml()
	{
		$styleHtml         = '';
		$element           = $this->getElement();
		$id                = $element->getId();
		$titleSelector     = '.mgz-tabs-' . $id . ' > .mgz-tabs-nav > .mgz-tabs-tab-title';
		$titleSelector2    = '.mgz-tabs-' . $id . ' > .mgz-tabs-content > .mgz-tabs-tab-title';
		$contentSelector   = '.mgz-tabs-' . $id . ' > .mgz-tabs-content > .mgz-tabs-tab-content';
		$noFillContentArea = $element->getData('no_fill_content_area');
		$tabPosition       = $element->getData('tab_position');
		$styleHtml 		   = $this->getOwlCarouselStyles();

		// DOTS
		$styles = [];
		$styles['background']   = $this->getStyleColor($element->getData('owl_background_color'));
		$styleHtml .= $this->getStyles([
			$titleSelector . ' > a',
			$titleSelector2 . ' > a'
		], $styles);

        // DOTS HOVER
		$styles = [];
		$styles['background']   = $this->getStyleColor($element->getData('owl_hover_background_color'));
		$styleHtml .= $this->getStyles([
			$titleSelector . ' > a'
		], $styles, ':hover');

        // DOTS ACTIVE
		$styles = [];
		$styles['background']   = $this->getStyleColor($element->getData('owl_active_background_color'));
		$styleHtml .= $this->getStyles([
			$titleSelector . '.mgz-active > a',
			$titleSelector2 . '.mgz-active > a'
		], $styles);

		if ($element->getData('owl_dots_insie') == true) {
			// DOTS INSIDE
			$styles = [];
			$styles['background']   = '#ffffff';
			$styles['box-shadow']   = '0 1px 2px rgba(0, 0, 0, 0.3)';
			$styles['margin']		= '8px !important';
			$styleHtml .= $this->getStyles([
				$titleSelector . ' > a',
				$titleSelector2 . ' > a'
			], $styles);

			// DOTS INSIDE HOVER
			$styles = [];
			$styles['width']       = '16px';
			$styles['height']      = '16px';
			$styles['margin']      = '5px !important';
			$styleHtml .= $this->getStyles([
				$titleSelector . ' > a',
				$titleSelector2 . ' > a'
			], $styles, ':hover');

			// DOTS INSIDE ACTIVE
			$styles = [];
			$styles['width']       = '16px';
			$styles['height']      = '16px';
			$styles['margin']      = '5px !important';
			$styleHtml .= $this->getStyles([
				$titleSelector . '.mgz-active > a',
				$titleSelector2 . '.mgz-active > a'
			], $styles);
		}

		return $styleHtml;
	}
}