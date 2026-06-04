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
 * @package   Magezon_PageBuilderPreview
 * @copyright Copyright (C) 2020 Magezon (https://www.magezon.com)
 */

namespace Magezon\PageBuilderPreview\Block\Profile;

class View extends \Magento\Framework\View\Element\Template implements \Magento\Widget\Block\BlockInterface
{
    /**
     * @var string
     */
    protected $_template = 'Magezon_PageBuilderPreview::profile/view.phtml';

    /**
     * @var \Magento\Framework\Registry
     */
    protected $_coreRegistry;

    /**
     * @param \Magento\Framework\View\Element\Template\Context $context  
     * @param \Magento\Framework\Registry                      $registry 
     * @param array                                            $data     
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Framework\Registry $registry,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->_coreRegistry = $registry;
    }

    /**
     * Get current form
     *
     * @return \BlueFormBuilder\Core\Model\Form
     */
    public function getCurrentProfile()
    {
        return $this->_coreRegistry->registry('mgz_pagebuilder_preview_profile');
    }

    /**
     * @return string
     */
    public function toHtml()
    {
        $profile = $this->getCurrentProfile();
        if (!$profile || !$profile->getId() || !$profile->getContent()) return;
        return parent::toHtml();
    }


    /**
     * @return $this
     */
    protected function _prepareLayout()
    {
        parent::_prepareLayout();
        $title = __('Magezon Page Builder - Live Preview');
        $this->pageConfig->getTitle()->set($title);
        return $this;
    }
}
