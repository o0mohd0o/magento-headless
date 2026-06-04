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

use Magento\Review\Model\ResourceModel\Review\Collection as ReviewCollection;

class RecentReviews extends \Magezon\Builder\Block\AbstractProduct
{
    /**
     * Review collection
     *
     * @var ReviewCollection
     */
    protected $_reviewsCollection;

    /**
     * @var \Magezon\Core\Helper\Data
     */
    protected $coreHelper;

    /**
     * @var \Magento\Review\Model\ResourceModel\Review\CollectionFactory
     */
    protected $reviewsColFactory;

    /**
     * @var \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory
     */
    protected $productCollectionFactory;

    /**
     * @param \Magento\Catalog\Block\Product\Context                         $context
     * @param \Magento\Framework\App\Http\Context                            $httpContext
     * @param \Magezon\Core\Helper\Data                                      $coreHelper
     * @param \Magento\Framework\Pricing\PriceCurrencyInterface              $priceCurrency
     * @param \Magento\Review\Model\ResourceModel\Review\CollectionFactory   $collectionFactory
     * @param \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory $productCollectionFactory
     * @param array                                                          $data
     */
    public function __construct(
        \Magento\Catalog\Block\Product\Context $context,
        \Magento\Framework\App\Http\Context $httpContext,
        \Magezon\Core\Helper\Data $coreHelper,
        \Magento\Framework\Pricing\PriceCurrencyInterface $priceCurrency,
        \Magento\Review\Model\ResourceModel\Review\CollectionFactory $collectionFactory,
        \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory $productCollectionFactory,
        array $data = []
    ) {
        parent::__construct($context, $httpContext, $priceCurrency, $data);
        $this->coreHelper               = $coreHelper;
        $this->reviewsColFactory        = $collectionFactory;
        $this->productCollectionFactory = $productCollectionFactory;
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
            'MGZ_BUILDERS_RECENT_REVIEWS',
            $this->priceCurrency->getCurrencySymbol(),
            $this->_storeManager->getStore()->getId(),
            $this->_design->getDesignTheme()->getId(),
            $this->httpContext->getValue(\Magento\Customer\Model\Context::CONTEXT_GROUP),
            $this->getData('element_id'),
            $this->getData('element_type')
        ];
        return $cache;
    }

    /**
     * Get collection of reviews
     *
     * @return ReviewCollection
     */
    public function getReviewsCollection()
    {
        if (null === $this->_reviewsCollection) {
            $element = $this->getElement();
            $reviewsCount = (int) $element->getData('max_items');
            if (!$reviewsCount) {
                $reviewsCount = 5;
            }
            $collection = $this->reviewsColFactory->create()->addStoreFilter(
                $this->_storeManager->getStore()->getId()
            )->addStatusFilter(
                \Magento\Review\Model\Review::STATUS_APPROVED
            )->setPageSize(
                $reviewsCount
            );
            if ($element->getData('product_id')) {
                $collection->addFieldToFilter('entity_pk_value', $element->getData('product_id'));
            }
            $collection->setDateOrder()->addRateVotes();

            if ($element->getData('product_id')) {
                $productIds = [$element->getData('product_id')];
            } else {
                $productIds = $collection->getColumnValues('entity_pk_value');
            }
            $productCollection = $this->productCollectionFactory->create();
            $productCollection->addAttributeToSelect($this->_catalogConfig->getProductAttributes());
            $productCollection->addFieldToFilter('entity_id', ['in' => $productIds]);

            foreach ($collection as $review) {
                $product = $productCollection->getItemById($review->getEntityPkValue());
                if ($product) {
                    $review->setProduct($product);
                }
            }
            $this->_reviewsCollection = $collection;

        }
        return $this->_reviewsCollection;
    }

    /**
     * @param  \Magento\Review\Model\Review $review
     * @return string
     */
    public function getReviewContent(\Magento\Review\Model\Review $review)
    {
        $element = $this->getElement();
        $detail  = $review->getDetail();
        $content = $detail;
        $reviewContentLenght = $element->getData('review_content_length');
        if ($reviewContentLenght) {
            $content = $this->coreHelper->substr($content, $reviewContentLenght);
            if ((strlen($content) + 1) === strlen($detail)) {
                $content = $detail;
            } else {
                $content .= '...';
            }
        }
        return $content;
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
        $element   = $this->getElement();
        $id        = $element->getId();
        $styleHtml = $this->getOwlCarouselStyles();

        $styleHtml .= $this->getLineStyles();

        $styles = [];
        $styles['color'] = $this->getStyleColor($element->getData('review_color'));
        $styles['background-color'] = $this->getStyleColor($element->getData('review_background_color'));
        $styleHtml .= $this->getStyles('.mgz-review-item', $styles);

        $styles = [];
        $styles['color'] = $this->getStyleColor($element->getData('review_link_color'));
        $styleHtml .= $this->getStyles('.mgz-review-item a', $styles);

        $styles = [];
        if ($element->getData('equal_height')) {
            $styleHtml .= '.' . $id . ' .owl-stage{';
            $styleHtml .= $this->getFixedStyleProperty('flex');
            $styleHtml .= '}';
        }

        if ($element->getData('review_star_color')) {
            $styles['color'] = $this->getStyleColor($element->getData('review_star_color'));
            $styleHtml .= $this->getStyles(['.rating-result > span'], $styles, ':before');
        }

        return $styleHtml;
    }
}
