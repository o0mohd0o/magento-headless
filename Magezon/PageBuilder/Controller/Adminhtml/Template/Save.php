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

namespace Magezon\PageBuilder\Controller\Adminhtml\Template;

use Magento\Framework\App\Request\DataPersistorInterface;
use Magento\Framework\Exception\LocalizedException;

class Save extends \Magento\Backend\App\Action
{
    /**
     * Authorization level of a basic admin session
     *
     * @see _isAllowed()
     */
    const ADMIN_RESOURCE = 'Magezon_PageBuilder::template_save';

    /**
     * @var DataPersistorInterface
     */
    protected $dataPersistor;

    /**
     * @var \Magento\Framework\App\Cache\TypeListInterface
     */
    protected $cacheTypeList;

    /**
     * @param \Magento\Backend\App\Action\Context                   $context
     * @param \Magento\Framework\App\Request\DataPersistorInterface $dataPersistor
     */
    public function __construct(
        \Magento\Backend\App\Action\Context $context,
        \Magento\Framework\App\Request\DataPersistorInterface $dataPersistor
    ) {
        $this->dataPersistor = $dataPersistor;
        parent::__construct($context);
    }

    /**
     * Save action
     *
     * @SuppressWarnings(PHPMD.CyclomaticComplexity)
     * @return \Magento\Framework\Controller\ResultInterface
     */
    public function execute()
    {
        $data         = $this->getRequest()->getPostValue();
        $redirectBack = $this->getRequest()->getParam('back', false);
        /** @var \Magento\Backend\Model\View\Result\Redirect $resultRedirect */
        $resultRedirect = $this->resultRedirectFactory->create();
        if (empty($data['template_id'])) {
            unset($data['template_id']);
        }
        if ($data) {
            /** @var \Magezon\PageBuilder\Model\Template $model */
            $model = $this->_objectManager->create(\Magezon\PageBuilder\Model\Template::class);
            $id    = $this->getRequest()->getParam('template_id');

            try {
                $model->load($id);
                if ($id && !$model->getId()) {
                    throw new LocalizedException(__('This template no longer exists.'));
                }
                $model->setData($data);
                $model->save();

                $this->messageManager->addSuccessMessage(__('You saved the template.'));
                $this->dataPersistor->clear('current_template');

                if ($redirectBack === 'save_and_new') {
                    return $resultRedirect->setPath('*/*/new');
                }

                if ($redirectBack === 'save_and_duplicate') {
                    $duplicate = $this->_objectManager->create(\Magezon\PageBuilder\Model\Template::class);
                    $duplicate->setData($model->getData());
                    $duplicate->setCreatedAt(null);
                    $duplicate->setUpdatedAt(null);
                    $duplicate->setId(null);
                    $duplicate->save();
                    $this->messageManager->addSuccessMessage(__('You duplicated the template'));
                    return $resultRedirect->setPath(
                        '*/*/edit',
                        ['template_id' => $duplicate->getId(),
                            '_current' => true]
                    );
                }

                if ($redirectBack === 'save_and_close') {
                    return $resultRedirect->setPath('*/*/*');
                }

                return $resultRedirect->setPath('*/*/edit', ['template_id' => $model->getId(), '_current' => true]);
            } catch (LocalizedException $e) {
                $this->messageManager->addExceptionMessage($e->getPrevious() ?:$e);
            } catch (\Exception $e) {
                $this->messageManager->addExceptionMessage($e, __('Something went wrong while saving the template.'));
            }

            $this->dataPersistor->set('current_template', $data);
            return $resultRedirect->setPath(
                '*/*/edit',
                ['template_id' => $this->getRequest()->getParam('template_id')]
            );
        }
        return $resultRedirect->setPath('*/*/');
    }
}
