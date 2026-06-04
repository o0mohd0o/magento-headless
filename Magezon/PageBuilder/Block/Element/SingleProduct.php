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

class SingleProduct extends \Magezon\Builder\Block\ListProduct
{
    /**
     * @var \Magento\Catalog\Model\ProductFactory
     */
    protected $productFactory;

    /**
     * @var \Magento\Catalog\Model\Product|boolean
     */
    protected $_product;

    /**
     * @param \Magento\Catalog\Block\Product\Context            $context
     * @param \Magento\Framework\App\Http\Context               $httpContext
     * @param \Magento\Framework\Pricing\PriceCurrencyInterface $priceCurrency
     * @param \Magento\Framework\Url\Helper\Data                $urlHelper
     * @param \Magento\Catalog\Model\ProductFactory             $productFactory
     * @param array                                             $data
     */
    public function __construct(
        \Magento\Catalog\Block\Product\Context $context,
        \Magento\Framework\App\Http\Context $httpContext,
        \Magento\Framework\Pricing\PriceCurrencyInterface $priceCurrency,
        \Magento\Framework\Url\Helper\Data $urlHelper,
        \Magento\Catalog\Model\ProductFactory $productFactory,
        array $data = []
    ) {
        parent::__construct($context, $httpContext, $priceCurrency, $urlHelper, $data);
        $this->productFactory = $productFactory;
    }

    /**
     * @return boolean
     */
    public function isEnabled()
    {
        if (!$this->getProduct()) {
            return;
        }

        return parent::isEnabled();
    }

    /**
     * @return \Magento\Catalog\Model\Product
     */
    public function getProduct()
    {
        if ($this->_product === null) {
            $element = $this->getElement();
            $sku = $element->getData('product_sku');
            if ($sku) {
                $product = $this->productFactory->create()->loadByAttribute('sku', $sku);
                if ($product) {
                    $this->_product = $product;
                }
            } else {
                $this->_product = false;
            }
        }
        return $this->_product;
    }

    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $element                = $this->getElement();
        $styleHtml              = $this->getLineStyles();
        $styles                 = [];
        $styles['border-color'] = $this->getStyleColor($element->getData('border_hover_color'), true);
        $_stylesHtml            = $this->parseStyles($styles);
        if ($_stylesHtml) {
            $styleHtml .= '.' . $this->getElement()->getHtmlId() . ' .product-item-info:hover{';
                $styleHtml .= $_stylesHtml;
            $styleHtml .= '}';
        }
        return $styleHtml;
    }
}
