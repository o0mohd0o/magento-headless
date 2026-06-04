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

namespace Magezon\PageBuilder\Plugin\Model;

class Category
{
    /**
     * @var array
     */
    protected $_cache;

    /**
     * @var \Magento\Framework\Registry
     */
    protected $registry;

    /**
     * @var \Magento\Framework\App\RequestInterface
     */
    protected $request;

    /**
     * @var \Magento\Framework\View\LayoutInterface
     */
    protected $layout;

    /**
     * @var \Magento\Store\Model\StoreManagerInterface
     */
    protected $storeManager;

    /**
     * @var \Magezon\PageBuilder\Helper\Data
     */
    protected $dataHelper;

    /**
     * @param \Magento\Framework\Registry                $registry
     * @param \Magento\Framework\App\RequestInterface    $request
     * @param \Magento\Framework\View\LayoutInterface    $layout
     * @param \Magento\Store\Model\StoreManagerInterface $storeManager
     * @param \Magezon\PageBuilder\Helper\Data           $dataHelper
     */
    public function __construct(
        \Magento\Framework\Registry $registry,
        \Magento\Framework\App\RequestInterface $request,
        \Magento\Framework\View\LayoutInterface $layout,
        \Magento\Store\Model\StoreManagerInterface $storeManager,
        \Magezon\PageBuilder\Helper\Data $dataHelper
    ) {
        $this->registry     = $registry;
        $this->request      = $request;
        $this->layout       = $layout;
        $this->storeManager = $storeManager;
        $this->dataHelper   = $dataHelper;
    }

    public function aroundGetData(
        $subject,
        callable $proceed,
        $key = '',
        $index = null
    ) {
        $valid = true;
        $result = $proceed($key, $index);
        $defaultLayoutHandle = $this->getDefaultLayoutHandle();
        if ($defaultLayoutHandle == 'catalog_category_view') {
            $handles = $this->layout->getUpdate()->getHandles();
            if (!in_array('catalog_category_view', $handles)) {
                $valid = false;
            }
        }
        if (is_string($result) && $valid && strpos($result, $this->dataHelper->getKey()) !== false) {
            $storeId = $this->storeManager->getStore()->getId();
            if (!isset($this->_cache[$storeId][$subject->getId()][$key])) {
                $result = $this->dataHelper->filter($result);
                $this->_cache[$storeId][$subject->getId()][$key] = $result;
            } else {
                $result = $this->_cache[$storeId][$subject->getId()][$key];
            }
        }
        return $result;
    }

    /**
     * Retrieve the default layout handle name for the current action
     *
     * @return string
     */
    public function getDefaultLayoutHandle()
    {
        return strtolower($this->request->getFullActionName());
    }
}
