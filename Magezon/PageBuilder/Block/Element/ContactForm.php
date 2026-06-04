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

class ContactForm extends \Magezon\Builder\Block\Element
{
    /**
     * @return string
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function getContactFormHtml()
    {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $viewModel = $objectManager->get(\Magento\Contact\ViewModel\UserDataProvider::class);
        $buttonLockManager = null;
        if(class_exists('\Magento\Framework\View\Element\ButtonLockManager')){
            $buttonLockManager = $objectManager->get(\Magento\Framework\View\Element\ButtonLockManager::class);
        }
        $contactForm = $this->getLayout()->createBlock(
            \Magento\Contact\Block\ContactForm::class,
            'contactForm',
            [
                'data' => [
                    'view_model' => $viewModel,
                    'button_lock_manager' => $buttonLockManager
                ]
            ]
        )->setTemplate('Magento_Contact::form.phtml');

        return $contactForm->toHtml();
    }

    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $styleHtml = '';
        $element   = $this->getElement();

        $styles = [];
        $styles['width'] = $this->getStyleProperty($element->getData('form_width'), true);
        $styleHtml .= $this->getStyles('.form.contact', $styles);

        if (!$element->getData('show_title')) {
            $styles = [];
            $styles['display'] = 'none';
            $styleHtml .= $this->getStyles('.form.contact .legend', $styles);
        }

        if (!$element->getData('show_description')) {
            $styles = [];
            $styles['display'] = 'none';
            $styleHtml .= $this->getStyles('.field.note', $styles);
        }

        return $styleHtml;
    }
}
