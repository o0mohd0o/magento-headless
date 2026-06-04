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

namespace Magezon\PageBuilder\Controller\Adminhtml\Ajax\Template;

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
     * Save action
     *
     * @SuppressWarnings(PHPMD.CyclomaticComplexity)
     * @return \Magento\Framework\Controller\ResultInterface
     */
    public function execute()
    {
        $result['status'] = false;
        $data             = $this->getRequest()->getPostValue();
        if ($data) {
            /** @var \Magezon\PageBuilder\Model\Template $model */
            $model = $this->_objectManager->create(\Magezon\PageBuilder\Model\Template::class);
            try {
                $model->setData($data);
                $model->save();
                $this->messageManager->addSuccessMessage(__('You saved the template.'));
                $result['status'] = true;
            } catch (LocalizedException $e) {
                $result['message'] = $e->getMessage();
            } catch (\Exception $e) {
                $result['message'] = __('Something went wrong while saving the template.');
            }
        }
        $this->getResponse()->representJson(
            $this->_objectManager->get(\Magento\Framework\Json\Helper\Data::class)->jsonEncode($result)
        );

        return $result;
    }
}
