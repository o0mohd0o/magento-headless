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

namespace Magezon\PageBuilder\Data\Element;

class Categories extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareStyleTab();
        return $this;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $general = parent::prepareGeneralTab();

            $general->addChildren(
                'title',
                'text',
                [
                    'sortOrder'       => 10,
                    'key'             => 'title',
                    'templateOptions' => [
                        'label' => __('Widget Title')
                    ]
                ]
            );

            $container1 = $general->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 20
                ]
            );

                $container1->addChildren(
                    'title_align',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'title_align',
                        'defaultValue'    => 'center',
                        'templateOptions' => [
                            'label'   => __('Title Alignment'),
                            'options' => $this->getAlignOptions()
                        ]
                    ]
                );

                $container1->addChildren(
                    'title_tag',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'title_tag',
                        'defaultValue'    => 'h2',
                        'templateOptions' => [
                            'label'   => __('Title Tag'),
                            'options' => $this->getHeadingType()
                        ]
                    ]
                );

                $container1->addChildren(
                    'show_line',
                    'toggle',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'show_line',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show Line')
                        ]
                    ]
                );

            $container2 = $general->addContainerGroup(
                'container2',
                [
                    'sortOrder'      => 30,
                    'hideExpression' => '!model.show_line'
                ]
            );

                $container2->addChildren(
                    'line_position',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'line_position',
                        'defaultValue'    => 'center',
                        'templateOptions' => [
                            'label'   => __('Line Position'),
                            'options' => $this->getLinePosition()
                        ]
                    ]
                );

                $container2->addChildren(
                    'line_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'line_color',
                        'defaultValue'    => '#cecece',
                        'templateOptions' => [
                            'label' => __('Line Color')
                        ]
                    ]
                );

                $container2->addChildren(
                    'line_width',
                    'select',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'line_width',
                        'defaultValue'    => 1,
                        'templateOptions' => [
                            'label'   => __('Line Width'),
                            'options' => $this->getRange(1, 5, 1, '', 'px')
                        ]
                    ]
                );

            $general->addChildren(
                'description',
                'textarea',
                [
                    'sortOrder'       => 40,
                    'key'             => 'description',
                    'templateOptions' => [
                        'label' => __('Widget Description')
                    ]
                ]
            );

            $general->addChildren(
                'categories',
                'uiSelect',
                [
                    'sortOrder'       => 50,
                    'key'             => 'categories',
                    'templateOptions' => [
                        'multiple'    => true,
                        'showValue'   => true,
                        'label'       => __('Categories'),
                        'source'      => 'category',
                        'placeholder' => __('Search category by name')
                    ]
                ]
            );

            $container3 = $general->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 60
                ]
            );

                $container3->addChildren(
                    'show_count',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'show_count',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show product counts')
                        ]
                    ]
                );

                $container3->addChildren(
                    'show_hierarchical',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'show_hierarchical',
                        'templateOptions' => [
                            'label' => __('Show hierarchy')
                        ]
                    ]
                );

           return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareStyleTab()
    {
        $tab = $this->addTab(
            'tab_style',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Style')
                ]
            ]
        );

            $container1 = $tab->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 10
                ]
            );

                $container1->addChildren(
                    'link_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'link_color',
                        'templateOptions' => [
                            'label' => __('Link Color')
                        ]
                    ]
                );

                $container1->addChildren(
                    'link_hover_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'link_hover_color',
                        'templateOptions' => [
                            'label' => __('Link Hover Color')
                        ]
                    ]
                );

            $container2 = $tab->addContainerGroup(
                'container2',
                [
                    'sortOrder' => 20
                ]
            );

                $container2->addChildren(
                    'link_font_size',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'link_font_size',
                        'templateOptions' => [
                            'label' => __('Link Font Size')
                        ]
                    ]
                );

                $container2->addChildren(
                    'link_font_weight',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'link_font_weight',
                        'templateOptions' => [
                            'label' => __('Link Font Weight')
                        ]
                    ]
                );

            $container3 = $tab->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 30
                ]
            );

                $container3->addChildren(
                    'link_border_width',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'link_border_width',
                        'templateOptions' => [
                            'label' => __('Link Border Width')
                        ]
                    ]
                );

                $container3->addChildren(
                    'link_border_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'link_border_color',
                        'templateOptions' => [
                            'label' => __('Link Border Color')
                        ]
                    ]
                );

        return $tab;
    }
}
