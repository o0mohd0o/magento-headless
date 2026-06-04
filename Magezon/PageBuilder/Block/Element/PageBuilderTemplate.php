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

class PageBuilderTemplate extends \Magezon\Builder\Block\Element
{
    /**
     * @var string
     */
    protected $_template = "Magezon_PageBuilder::element/pagebuilder_template.phtml";

    /**
     * @var \Magezon\PageBuilder\Model\TemplateFactory
     */
    protected $templateFactory;

    protected $_curentTemplate;

    /**
     * @param \Magento\Framework\View\Element\Template\Context  $context
     * @param \Magezon\PageBuilder\Model\TemplateFactory        $templateFactory
     * @param array                                             $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magezon\PageBuilder\Model\TemplateFactory $templateFactory,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->templateFactory = $templateFactory;
    }

    /**
     * @return boolean
     */
    public function isEnabled()
    {
        if (!$this->getPageBuilderTemplate()->getIsActive()) {
            return false;
        }
        return parent::isEnabled();
    }

    /**
     * @return \Magezon\PageBuilder\Model\Template
     */
    public function getPageBuilderTemplate()
    {
        if ($this->_curentTemplate == null) {
            $element    = $this->getElement();
            $templateId = $element->getData('template_id');
            $template   = $this->templateFactory->create();
            if ($templateId) {
                $template->load($templateId);
            }
            $this->_curentTemplate = $template;
        }
        return $this->_curentTemplate;
    }
}
