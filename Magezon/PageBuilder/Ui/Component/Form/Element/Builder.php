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

namespace Magezon\PageBuilder\Ui\Component\Form\Element;

use Magento\Catalog\Api\CategoryAttributeRepositoryInterface;
use Magento\Framework\App\ObjectManager;
use Magento\Framework\Data\FormFactory;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\View\Asset\Repository;
use Magento\Framework\View\Element\UiComponent\ContextInterface;
use Magento\Ui\Component\Wysiwyg\ConfigInterface;

class Builder extends \Magezon\Builder\Ui\Component\Form\Element\Builder
{
    const NAME = 'textarea';

    /**
     * @var \Magento\Framework\Registry
     */
    protected $registry;

    /**
     * @var \Magezon\PageBuilder\Helper\Data
     */
    protected $dataHelper;

    /**
     * @var Repository
     */
    protected $assetRepo;

    /**
     * @param ContextInterface                      $context
     * @param FormFactory                           $formFactory
     * @param ConfigInterface                       $wysiwygConfig
     * @param \Magento\Framework\View\LayoutFactory $layoutFactory
     * @param \Magento\Framework\Registry           $registry
     * @param \Magezon\PageBuilder\Helper\Data      $dataHelper
     * @param array                                 $data
     * @param array                                 $config
     */
    public function __construct(
        ContextInterface $context,
        FormFactory $formFactory,
        ConfigInterface $wysiwygConfig,
        \Magento\Framework\View\LayoutFactory $layoutFactory,
        \Magento\Framework\Registry $registry,
        \Magezon\PageBuilder\Helper\Data $dataHelper,
        CategoryAttributeRepositoryInterface $attrRepository,
        array $components = [],
        array $data = [],
        array $config = [],
        bool $overrideSnapshot = false,
        Repository $assetRepo = null
    ) {
        $this->registry = $registry;
        $this->dataHelper = $dataHelper;

        $config['disableMagezonBuilder'] = false;
        if ($dataHelper->getConfig('general/enable')) {
            $config['ajax_data']['load_builder_url'] = 'mgzpagebuilder/builder/load';
            if (!isset($config['disableMagezonBuilder']) || !$config['disableMagezonBuilder']) {
                $config['disableMagezonBuilder'] = $this->isDisableArea($context);
            }
        }
        if ($config['disableMagezonBuilder'] || !$dataHelper->getConfig('general/enable')) {
            $this->assetRepo = $assetRepo ?: ObjectManager::getInstance()->get(Repository::class);
            $wysiwygConfigData = isset($config['wysiwygConfigData']) ? $config['wysiwygConfigData'] : [];

            // If a dataType is present we're dealing with an attribute
            if (isset($config['dataType'])) {
                try {
                    $attribute = $attrRepository->get($data['name']);

                    if ($attribute) {
                        $config['wysiwyg'] = (bool) $attribute->getIsWysiwygEnabled();
                    }
                } catch (NoSuchEntityException $e) {
                    $config['wysiwyg'] = true;
                }
            }

            $isShortDescription = isset($config['code']) && $config['code'] == 'short_description' || false;
            $isEnablePageBuilder = isset($wysiwygConfigData['is_pagebuilder_enabled'])
                && !$wysiwygConfigData['is_pagebuilder_enabled']
                || false;

            if (class_exists('Magento\PageBuilder\Model\State', true)) {
                $pageBuilderState = ObjectManager::getInstance()->get('\Magento\PageBuilder\Model\State');
                $stageConfig = ObjectManager::getInstance()->get('\Magento\PageBuilder\Model\Stage\Config');
                if (!$pageBuilderState->isPageBuilderInUse($isEnablePageBuilder) && !$isShortDescription) {
                    // This is not done using definition.xml due to https://github.com/magento/magento2/issues/5647
                    $data['config']['component'] = 'Magento_PageBuilder/js/form/element/wysiwyg';

                    // Override the templates to include our KnockoutJS code
                    $data['config']['template'] = 'ui/form/field';
                    $data['config']['elementTmpl'] = 'Magento_PageBuilder/form/element/wysiwyg';
                    $wysiwygConfigData = $stageConfig->getConfig();
                    $wysiwygConfigData['pagebuilder_button'] = true;
                    $wysiwygConfigData['pagebuilder_content_snapshot'] = true;
                    $wysiwygConfigData = $this->processBreakpointsIcons($wysiwygConfigData);

                    if ($overrideSnapshot) {
                        $pageBuilderConfig = ObjectManager::getInstance()->get('\Magento\PageBuilder\Model\Config');
                        $wysiwygConfigData['pagebuilder_content_snapshot'] = $pageBuilderConfig->isContentPreviewEnabled();
                    }

                    // Add Classes for Page Builder Stage
                    if (
                        isset($wysiwygConfigData['pagebuilder_content_snapshot'])
                        && $wysiwygConfigData['pagebuilder_content_snapshot']
                    ) {
                        $data['config']['additionalClasses'] = [
                            'admin__field-wide admin__field-page-builder' => true
                        ];
                    }

                    $data['config']['wysiwygConfigData'] = isset($config['wysiwygConfigData']) ?
                        array_replace_recursive($config['wysiwygConfigData'], $wysiwygConfigData) :
                        $wysiwygConfigData;
                    $wysiwygConfigData['activeEditorPath'] = 'Magento_PageBuilder/pageBuilderAdapter';

                    $config['wysiwygConfigData'] = $wysiwygConfigData;
                }
            }
            $config['disableMagezonBuilder'] = true;
        }

        parent::__construct(
            $context,
            $formFactory,
            $wysiwygConfig,
            $layoutFactory,
            $registry,
            $components,
            $data,
            $config
        );
    }

    /**
     * Get component name
     *
     * @return string
     */
    public function getComponentName()
    {
        return static::NAME;
    }

    /**
     * @return boolean
     */
    public function isDisableArea($context)
    {
        $namespace = $context->getNamespace();
        if ($excludeNamespaces = $this->dataHelper->getConfig('general/exclude_namespaces')) {
            $excludeNamespaces = explode("\n", str_replace("\r", "", $excludeNamespaces));
            if (in_array($namespace, $excludeNamespaces))
                return true;
        }

        $isDisableArea = false;
        $type = '';

        if ($this->registry->registry('cms_page')) {
            $type = 'page';
        }
        if ($this->registry->registry('cms_block')) {
            $type = 'block';
        }
        if ($this->registry->registry('current_product')) {
            $type = 'product';
        }
        if ($this->registry->registry('current_category')) {
            $type = 'category';
        }

        switch ($type) {
            case 'page':
                $isDisableArea = !$this->dataHelper->getConfig('general/enable_pages');
                break;

            case 'block':
                $isDisableArea = !$this->dataHelper->getConfig('general/enable_blocks');
                break;

            case 'product':
                $isDisableArea = !$this->dataHelper->getConfig('general/enable_products');
                break;

            case 'category':
                $isDisableArea = !$this->dataHelper->getConfig('general/enable_categories');
                break;
        }

        return $isDisableArea;
    }

    /**
     * Process viewport icon paths
     *
     * @param array $wysiwygConfigData
     * @return array
     */
    private function processBreakpointsIcons(array $wysiwygConfigData): array
    {
        if ($wysiwygConfigData && isset($wysiwygConfigData['viewports'])) {
            foreach ($wysiwygConfigData['viewports'] as $breakpoint => $attributes) {
                if (isset($attributes['icon'])) {
                    $wysiwygConfigData['viewports'][$breakpoint]['icon'] = $this->assetRepo->getUrl(
                        $attributes['icon']
                    );
                }
            }
        }
        return $wysiwygConfigData;
    }
}
