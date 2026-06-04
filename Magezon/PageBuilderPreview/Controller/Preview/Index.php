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

namespace Magezon\PageBuilderPreview\Controller\Preview;

use Magento\Framework\Controller\ResultFactory;

class Index extends \Magento\Framework\App\Action\Action
{
    /**
     * @var \Magento\Framework\Controller\Result\ForwardFactory
     */
    protected $resultForwardFactory;

    /**
     * @var \Magento\Cms\Model\Page\Source\PageLayout
     */
    protected $pageLayout;

    /**
     * @var \Magento\Framework\Registry
     */
    protected $coreRegistry;

    /**
     * @var \Magezon\PageBuilderPreview\Model\ResourceModel\Profile\CollectionFactory
     */
    protected $collectionFactory;

    /**
     * @param \Magento\Framework\App\Action\Context                                     $context              
     * @param \Magento\Framework\Controller\Result\ForwardFactory                       $resultForwardFactory 
     * @param \Magento\Cms\Model\Page\Source\PageLayout                                 $pageLayout           
     * @param \Magento\Framework\Registry                                               $coreRegistry         
     * @param \Magezon\PageBuilderPreview\Model\ResourceModel\Profile\CollectionFactory $collectionFactory    
     */
    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Framework\Controller\Result\ForwardFactory $resultForwardFactory,
        \Magento\Cms\Model\Page\Source\PageLayout $pageLayout,
        \Magento\Framework\Registry $coreRegistry,
        \Magezon\PageBuilderPreview\Model\ResourceModel\Profile\CollectionFactory $collectionFactory
    ) {
        parent::__construct($context);
        $this->resultForwardFactory = $resultForwardFactory;
        $this->pageLayout           = $pageLayout;
        $this->coreRegistry         = $coreRegistry;
        $this->collectionFactory    = $collectionFactory;
    }

    /**
     * Form view action
     *
     * @return \Magento\Framework\Controller\ResultInterface
     */
    public function execute()
    {
        $resultPage = $this->resultFactory->create(ResultFactory::TYPE_PAGE);
        $params     = $this->getRequest()->getParams();
        if (isset($params['id']) && $params['id']) {
            $layouts = [];
            foreach ($this->pageLayout->toOptionArray() as $layout) {
                $layouts[] = $layout['value'];
            }
            $pageLayout = (isset($params['page_layout']) && $params['page_layout']) ? $params['page_layout'] : '';
            if (!in_array($pageLayout, $layouts)) {
                $pageLayout = '1column';
            }
            $collection = $this->collectionFactory->create();
            $collection->addFieldToFilter('builder_id', trim($params['id']));
            $profile = $collection->getFirstItem();
            if ($profile->getId()) {
                $this->coreRegistry->register('mgz_pagebuilder_preview_profile', $profile);
                $resultPage->getConfig()->setPageLayout($pageLayout);
                $this->getResponse()->setNoCacheHeaders();
                return $resultPage;
            }
        }
        $resultForward = $this->resultForwardFactory->create();
        return $resultForward->forward('noroute');
    }
}
