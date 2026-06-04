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

class ProductGrid extends \Magezon\Builder\Block\ListProduct
{
    /**
     * @var \Magezon\Core\Model\ProductList
     */
    protected $productList;

    /**
     * @var \Magezon\Core\Helper\Data
     */
    protected $coreHelper;

    /**
     * @param \Magento\Catalog\Block\Product\Context            $context
     * @param \Magento\Framework\App\Http\Context               $httpContext
     * @param \Magento\Framework\Pricing\PriceCurrencyInterface $priceCurrency
     * @param \Magento\Framework\Url\Helper\Data                $urlHelper
     * @param \Magezon\Core\Model\ProductList            $productList
     * @param \Magezon\Core\Helper\Data                         $coreHelper
     * @param array                                             $data
     */
    public function __construct(
        \Magento\Catalog\Block\Product\Context $context,
        \Magento\Framework\App\Http\Context $httpContext,
        \Magento\Framework\Pricing\PriceCurrencyInterface $priceCurrency,
        \Magento\Framework\Url\Helper\Data $urlHelper,
        \Magezon\Core\Model\ProductList $productList,
        \Magezon\Core\Helper\Data $coreHelper,
        array $data = []
    ) {
        parent::__construct($context, $httpContext, $priceCurrency, $urlHelper, $data);
        $this->productList = $productList;
        $this->coreHelper  = $coreHelper;
    }

    /**
     * {@inheritdoc}
     */
    protected function _construct()
    {
        parent::_construct();

        $this->addData([
            'cache_lifetime' => 86400,
            'cache_tags'     => [\Magento\Catalog\Model\Product::CACHE_TAG]
        ]);
    }

    /**
     * Get cache key informative items
     *
     * @return array
     */
    public function getCacheKeyInfo()
    {
        $cache = [
            'MGZ_BUILDERS_PRODUCT_GRID',
            $this->priceCurrency->getCurrencySymbol(),
            $this->_storeManager->getStore()->getId(),
            $this->_design->getDesignTheme()->getId(),
            $this->httpContext->getValue(\Magento\Customer\Model\Context::CONTEXT_GROUP),
            intval($this->getRequest()->getParam($this->getData('page_var_name'), 1)),
            $this->coreHelper->serialize($this->getRequest()->getParams()),
            $this->getData('element_id'),
            $this->getData('element_type')
        ];
        return $cache;
    }

    public function getItems()
    {
        $element      = $this->getElement();
        $order        = $element->getData('orer_by');
        $totalItems   = (int)$element->getData('max_items');
        $items        = $this->productList->getProductCollection(
            $element->getSource(),
            $totalItems,
            $order,
            $element->getData('condition')
        );
        $count        = count($items);
        $itemsPerPage = (int)$element->getData('items_per_page') ? (int)$element->getData('items_per_page') : 1;
        $displayStyle = $element->getData('display_style');

        if ($displayStyle=='pagination') {
            if ($count%$itemsPerPage===0) {
                $totalPages = $count / $itemsPerPage;
            } else {
                $totalPages = ($count / $itemsPerPage) + 1;
            }
        } else {
            $totalPages = $count;
        }

        $newItems    = [];
        $currentPage = 0;
        $index       = 0;
        foreach ($items as $item) {
            $newItems[$currentPage][] = $item;
            if ($index == $itemsPerPage-1 && $displayStyle=='pagination') {
                $currentPage++;
                $index = 0;
                continue;
            }
            $index++;
        }
        return $newItems;
    }

    public function getHtmlId()
    {
        return '.mgz-element.' . $this->getElement()->getHtmlId() . ' .owl-carousel';
    }

    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = $this->getOwlCarouselStyles();

        $styleHtml .= $this->getLineStyles();

        return $styleHtml;
    }
}
