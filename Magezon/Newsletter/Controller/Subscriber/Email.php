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
 * @package   Magezon_Newsletter
 * @copyright Copyright (C) 2020 Magezon (https://www.magezon.com)
 */

namespace Magezon\Newsletter\Controller\Subscriber;

class Email extends \Magento\Framework\App\Action\Action
{
    /**
     * @var \Magento\Newsletter\Model\SubscriberFactory
     */
    protected $subscriberFactory;

    /**
     * @param \Magento\Framework\App\Action\Context       $context
     * @param \Magento\Newsletter\Model\SubscriberFactory $subscriberFactory
     */
    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Newsletter\Model\SubscriberFactory $subscriberFactory
    ) {
        parent::__construct($context);
        $this->subscriberFactory = $subscriberFactory;
    }

    public function execute()
    {
        $result['status'] = false;
        if ($this->getRequest()->isAjax() && $this->getRequest()->getPost('email')) {
            $email = (string)$this->getRequest()->getPost('email');
            try {
                $subscriber = $this->subscriberFactory->create();
                $subscriber->loadByEmail($email);
                if ($subscriber->getId()) {
                    $firstname = $this->getRequest()->getPost('firstname');
                    $lastname = $this->getRequest()->getPost('lastname');
                    $subscriber->setSubscriberFirstname($firstname);
                    $subscriber->setSubscriberLastname($lastname);
                    $popupId = $this->getRequest()->getPost('popup_id');
                    $subscriber->setPopupId($popupId);
                    $subscriber->save();
                    $result['status'] = true;
                }
            } catch (\Exception $e) {
            }
        }
        $this->getResponse()->representJson(
            $this->_objectManager->get(\Magento\Framework\Json\Helper\Data::class)->jsonEncode($result)
        );
        return;
    }
}
