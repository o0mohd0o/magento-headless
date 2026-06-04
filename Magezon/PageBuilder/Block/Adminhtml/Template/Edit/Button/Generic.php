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

namespace Magezon\PageBuilder\Block\Adminhtml\Template\Edit\Button;

use Magento\Framework\Registry;
use Magento\Framework\View\Element\UiComponent\Context;
use Magento\Framework\View\Element\UiComponent\Control\ButtonProviderInterface;

class Generic implements ButtonProviderInterface
{
    /**
     * Url Builder
     *
     * @var Context
     */
    protected $context;

    /**
     * Registry
     *
     * @var Registry
     */
    protected $registry;

    /**
     * @var \Magento\Framework\AuthorizationInterface
     */
    protected $_authorization;

    /**
     * @param Context                                   $context
     * @param Registry                                  $registry
     * @param \Magento\Framework\AuthorizationInterface $authorization
     */
    public function __construct(
        Context $context,
        Registry $registry,
        \Magento\Framework\AuthorizationInterface $authorization
    ) {
        $this->context        = $context;
        $this->registry       = $registry;
        $this->_authorization = $authorization;
    }

    /**
     * Generate url by route and parameters
     *
     * @param string $route
     * @param array $params
     * @return string
     */
    public function getUrl($route = '', $params = [])
    {
        return $this->context->getUrl($route, $params);
    }

    /**
     * {@inheritdoc}
     */
    public function getButtonData()
    {
        return [];
    }

    /**
     * Check permission for passed action
     *
     * @param string $resourceId
     * @return bool
     */
    protected function _isAllowedAction($resourceId)
    {
        return $this->_authorization->isAllowed($resourceId);
    }

    /**
     * Retrive current template instance
     *
     * @return \Magezon\PageBuilder\Model\Template
     */
    public function getCurrentTemplate()
    {
        return $this->registry->registry('current_template');
    }

    /**
     * @param  array $params
     * @return array
     */
    public function getButtonAttribute($params = [])
    {
        $attributes = [
            'mage-init' => [
                'Magento_Ui/js/form/button-adapter' => [
                    'actions' => [
                        [
                            'targetName' => 'mgzpagebuilder_template_form.mgzpagebuilder_template_form',
                            'actionName' => 'save',
                            'params'     => $params
                        ]
                    ]
                ]
            ]
        ];

        return $attributes;
    }
}
