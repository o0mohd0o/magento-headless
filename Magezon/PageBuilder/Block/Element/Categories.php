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

class Categories extends \Magezon\Builder\Block\Element
{
    /**
     * @var \Magezon\PageBuilder\Model\Source\Categories
     */
    protected $categories;

    /**
     * @var \Magento\Framework\Registry
     */
    protected $registry;

    /**
     * @var array
     */
    protected $_categories;

    /**
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magezon\Core\Model\Source\Categories            $categories
     * @param \Magento\Framework\Registry                      $registry
     * @param array                                            $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magezon\Core\Model\Source\Categories $categories,
        \Magento\Framework\Registry $registry,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->categories = $categories;
        $this->registry   = $registry;
    }

    /**
     * @return boolean
     */
    public function isEnabled()
    {
        if (!$this->getElement()->getData('categories')) {
            return;
        }
        return parent::isEnabled();
    }

    /**
     * @return array
     */
    public function getCategories()
    {
        if ($this->_categories == null) {
            $element = $this->getElement();
            $this->_categories = $this->categories->getCategories(
                $element->getData('categories'),
                $element->getData('show_count')
            );
        }
        return $this->_categories;
    }

    /**
     * @param  array  $categories
     * @param  integer $level
     * @return string
     */
    public function getCategoriesHtml($categories, $level = 0)
    {
        $element          = $this->getElement();
        $showCount        = $element->getData('show_count');
        $showHierarchical = $element->getData('show_hierarchical');
        $html = '<ul class="mgz-categories-level' . $level . '">';
        foreach ($categories as $category) {
            $children = $category->getSubCategories();
            $classes = [];
            if ($this->isActive($category)) {
                $classes[] = 'active';
            }
            $_class = 'class="' . implode(' ', $classes) . '"';
            $html .= '<li ' . $_class . '>';
                $html .= '<a href="' . $category->getUrl() . '">';
                    $html .= '<span>' . $category->getName() . '</span>';
            if ($showCount) {
                $html .= '<span>(' . $category->getProductCount() . ')</span>';
            }
            if ($showHierarchical && $children) {
                $html .= '<span class="opener"></span>';
            }
                $html .= '</a>';
            if ($showHierarchical && $children) {
                $html .= $this->getCategoriesHtml($children, $level + 1);
            }
            $html .= '</li>';
        }
        $html .= '</ul>';
        return $html;
    }

    /**
     * @return \Magento\Catalog\Model\Category|null
     */
    public function getCurrentCategory()
    {
        return $this->registry->registry('current_category');
    }

    /**
     * @param  \Magento\Catalog\Model\Category  $category
     * @return boolean
     */
    public function isActive($category)
    {
        $currentCategory = $this->getCurrentCategory();
        if ($currentCategory && $currentCategory->getId() == $category->getId()) {
            return true;
        }
        return false;
    }

    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = parent::getAdditionalStyleHtml();
        $element = $this->getElement();

        if ($element->getData('categories')) {
            $styles = [];
            $styles['color'] = $this->getStyleColor($element->getData('link_color'));
            $styles['font-size'] = $this->getStyleProperty($element->getData('link_font_size'));
            $styles['font-weight'] = $element->getData('link_font_weight');
            $styleHtml .= $this->getStyles('.mgz-element-categories-list a', $styles);

            $styles = [];
            $styles['color'] = $this->getStyleColor($element->getData('link_hover_color'));
            $styleHtml .= $this->getStyles(
                ['.mgz-element-categories-list a:hover', '.mgz-element-categories-list li.active > a'],
                $styles,
                ''
            );

            $styles = [];
            $styles['border-bottom-width'] = $this->getStyleProperty($element->getData('link_border_width'));
            $styles['border-bottom-color'] = $this->getStyleColor($element->getData('link_border_color'));
            $styleHtml .= $this->getStyles('.mgz-element-categories-list li', $styles);
        }

        $styleHtml .= $this->getLineStyles();

        return $styleHtml;
    }
}
