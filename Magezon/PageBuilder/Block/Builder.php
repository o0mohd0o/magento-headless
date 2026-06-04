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

class Builder extends \Magezon\Builder\Block\Builder
{
    /**
     * Path to template file in theme.
     *
     * @var string
     */
    protected $_template = 'Magezon_PageBuilder::builder.phtml';

    /**
     * @var \Magezon\PageBuilder\Helper\Data
     */
    protected $dataHelper;

    /**
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magezon\Builder\Model\CompositeConfigProvider   $configProvider
     * @param \Magezon\PageBuilder\Helper\Data                 $dataHelper
     * @param array                                            $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magezon\PageBuilder\Model\CompositeConfigProvider $configProvider,
        \Magezon\PageBuilder\Helper\Data $dataHelper,
        array $data = []
    ) {
        parent::__construct($context, $configProvider, $data);
        $this->dataHelper = $dataHelper;
    }
}
