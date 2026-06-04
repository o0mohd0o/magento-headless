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

namespace Magezon\PageBuilder\Block;

class Profile extends \Magezon\Builder\Block\Profile
{
    /**
     * @var \Magezon\PageBuilder\Helper\Data
     */
    protected $dataHelper;

    /**
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magezon\Builder\Helper\Data                     $builderHelper
     * @param \Magezon\PageBuilder\Helper\Data                 $dataHelper
     * @param array                                            $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magezon\Builder\Helper\Data $builderHelper,
        \Magezon\PageBuilder\Helper\Data $dataHelper,
        array $data = []
    ) {
        parent::__construct($context, $builderHelper, $data);
        $this->dataHelper = $dataHelper;
    }

    /**
     * Override this method in descendants to produce html
     *
     * @return string
     */
    protected function _toHtml()
    {
        if (!$this->dataHelper->isEnable()) {
            return;
        }
        return parent::_toHtml();
    }
}
