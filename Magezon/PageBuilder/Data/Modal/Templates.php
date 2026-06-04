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

namespace Magezon\PageBuilder\Data\Modal;

class Templates extends \Magezon\Builder\Data\Element\AbstractElement
{
    const TAB_TEMPLATES        = 'tab_templates';
    const TAB_TEMPLATE_LIBRARY = 'tab_template_library';

    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        $this->prepareGeneralTab();
        $this->prepareTemplatesTab();
        $this->prepareTemplateLibraryTab();
        return $this;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $tab = $this->addTab(
            self::TAB_GENERAL,
            [
                'sortOrder'       => 10,
                'templateOptions' => [
                    'label' => __('Save Template')
                ]
            ]
        );

            $tab->addChildren(
                'name',
                'text',
                [
                    'sortOrder'       => 10,
                    'key'             => 'name',
                    'className'       => 'mgz-mytemplates-name',
                    'templateOptions' => [
                        'element'         => 'Magezon_Builder/js/form/element/save-templates',
                        'templateUrl'     => 'Magezon_Builder/js/templates/form/element/save-templates.html',
                        'saveTemplateUrl' => 'mgzpagebuilder/ajax_template/save',
                        'label'           => __('Save current layout as a template')
                    ]
                ]
            );

        return $tab;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareTemplatesTab()
    {
        $tab = $this->addTab(
            self::TAB_TEMPLATES,
            [
                'sortOrder'       => 20,
                'templateOptions' => [
                    'label' => __('My Templates')
                ]
            ]
        );

            $tab->addChildren(
                'templates',
                'select',
                [
                    'sortOrder'       => 10,
                    'templateOptions' => [
                        'element'     => 'Magezon_Builder/js/form/element/templates',
                        'templateUrl' => 'Magezon_Builder/js/templates/form/element/templates.html',
                        'source'      => 'pagebuilder_template'
                    ]
                ]
            );
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareTemplateLibraryTab()
    {
        $tab = $this->addTab(
            self::TAB_TEMPLATE_LIBRARY,
            [
                'sortOrder'       => 30,
                'templateOptions' => [
                    'label' => __('Template Library')
                ]
            ]
        );

            $tab->addChildren(
                'templates',
                'select',
                [
                    'sortOrder'       => 10,
                    'templateOptions' => [
                        'element'     => 'Magezon_Builder/js/form/element/templates',
                        'templateUrl' => 'Magezon_Builder/js/templates/form/element/templates.html',
                        'url'         => 'mgzbuilder/ajax/libraryTemplate'
                    ]
                ]
            );
    }
}
