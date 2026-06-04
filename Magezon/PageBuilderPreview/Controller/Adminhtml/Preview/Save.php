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

namespace Magezon\PageBuilderPreview\Controller\Adminhtml\Preview;

use Magento\Framework\Exception\LocalizedException;

class Save extends \Magento\Backend\App\Action
{
    /**
     * @var \Magezon\PageBuilderPreview\Model\ResourceModel\Profile\CollectionFactory
     */
    protected $collectionFactory;

    /**
     * @param \Magento\Backend\App\Action\Context                                       $context           
     * @param \Magezon\PageBuilderPreview\Model\ResourceModel\Profile\CollectionFactory $collectionFactory 
     */
    public function __construct(
        \Magento\Backend\App\Action\Context $context,
        \Magezon\PageBuilderPreview\Model\ResourceModel\Profile\CollectionFactory $collectionFactory
    ) {
        parent::__construct($context);
        $this->collectionFactory = $collectionFactory;
    }

    /**
     * Save action
     *
     * @SuppressWarnings(PHPMD.CyclomaticComplexity)
     * @return \Magento\Framework\Controller\ResultInterface
     */
    public function execute()
    {
        $result['status'] = false;
        $post             = $this->getRequest()->getPostValue();
        if ($post && isset($post['builderId']) && $post['builderId']) {
            try {
                $collection = $this->collectionFactory->create();
                $collection->addFieldToFilter('builder_id', $post['builderId']);
                $profile = $collection->getFirstItem();
                $profile->setData('builder_id', $post['builderId']);
                $profile->setData('content', $post['profile']);
                $profile->save();
                $result['status'] = true;
            } catch (LocalizedException $e) {
                $result['message'] = $e->getMessage();
            } catch (\Exception $e) {
                $result['message'] = __('Something went wrong while processing the request.');
            }
        }
        $this->getResponse()->representJson(
            $this->_objectManager->get(\Magento\Framework\Json\Helper\Data::class)->jsonEncode($result)
        );
    }
}
