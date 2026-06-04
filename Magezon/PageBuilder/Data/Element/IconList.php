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

class IconList extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareIconListTab();
        $this->prepareIconTab();
        return $this;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $general = parent::prepareGeneralTab();

            $container1 = $general->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 10
                ]
            );

                $container1->addChildren(
                    'layout',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'layout',
                        'defaultValue'    => 'vertical',
                        'templateOptions' => [
                            'label'   => __('Layout'),
                            'options' => $this->getLayoutOptions()
                        ]
                    ]
                );

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareIconTab()
    {
        $icon = $this->addTab(
            'icon_design',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Icon & Text Design')
                ]
            ]
        );

               $container1 = $icon->addContainerGroup(
                   'container1',
                   [
                    'sortOrder' => 10
                   ]
               );

                $container1->addChildren(
                    'spacing',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'spacing',
                        'defaultValue'    => '5px',
                        'templateOptions' => [
                            'label' => __('Spacing')
                        ]
                    ]
                );

                $container1->addChildren(
                    'icon_size',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'icon_size',
                        'templateOptions' => [
                            'label' => __('Icon Size')
                        ]
                    ]
                );

               $container2 = $icon->addContainerGroup(
                   'container2',
                   [
                    'sortOrder' => 20
                   ]
               );

                $container2->addChildren(
                    'text_size',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'text_size',
                        'templateOptions' => [
                            'label' => __('Text Size')
                        ]
                    ]
                );

                $container2->addChildren(
                    'text_font_weight',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'text_font_weight',
                        'templateOptions' => [
                            'label' => __('Text Font Weight')
                        ]
                    ]
                );

               $colors = $icon->addTab(
                   'colors',
                   [
                    'sortOrder'       => 30,
                    'templateOptions' => [
                        'label' => __('Icon Colors')
                    ]
                   ]
               );

                $normal = $colors->addContainerGroup(
                    'normal',
                    [
                        'sortOrder'       => 10,
                        'templateOptions' => [
                            'label' => __('Normal')
                        ]
                    ]
                );

                    $color1 = $normal->addContainerGroup(
                        'color1',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $color1->addChildren(
                            'icon_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'icon_color',
                                'templateOptions' => [
                                    'label' => __('Icon Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'icon_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'icon_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                $hover = $colors->addContainerGroup(
                    'hover',
                    [
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label' => __('Hover')
                        ]
                    ]
                );

                    $color2 = $hover->addContainerGroup(
                        'color2',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $color2->addChildren(
                            'icon_hover_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'icon_hover_color',
                                'templateOptions' => [
                                    'label' => __('Icon Color')
                                ]
                            ]
                        );

                        $color2->addChildren(
                            'icon_hover_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'icon_hover_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

            $colors2 = $icon->addTab(
                'colors2',
                [
                    'sortOrder'       => 40,
                    'templateOptions' => [
                        'label' => __('Text Colors')
                    ]
                ]
            );

                $normal = $colors2->addContainerGroup(
                    'normal',
                    [
                        'sortOrder'       => 10,
                        'templateOptions' => [
                            'label' => __('Normal')
                        ]
                    ]
                );

                    $color1 = $normal->addContainerGroup(
                        'color1',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $color1->addChildren(
                            'text_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'text_color',
                                'templateOptions' => [
                                    'label' => __('Text Color')
                                ]
                            ]
                        );

                $hover = $colors2->addContainerGroup(
                    'hover',
                    [
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label' => __('Hover')
                        ]
                    ]
                );

                    $color2 = $hover->addContainerGroup(
                        'color2',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $color2->addChildren(
                            'text_hover_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'text_hover_color',
                                'templateOptions' => [
                                    'label' => __('Text Color')
                                ]
                            ]
                        );

        return $icon;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareIconListTab()
    {
        $list = $this->addTab(
            'icon_list',
            [
                'sortOrder'       => 40,
                'templateOptions' => [
                    'label' => __('Icon List')
                ]
            ]
        );

            $items = $list->addChildren(
                'items',
                'dynamicRows',
                [
                    'key'       => 'items',
                    'sortOrder' => 10
                ]
            );

                $container1 = $items->addContainerGroup(
                    'container1',
                    [
                        'templateOptions' => [
                            'sortOrder' => 10
                        ]
                    ]
                );

                    $container1->addChildren(
                        'icon',
                        'icon',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'icon',
                            'templateOptions' => [
                                'label' => __('Icon')
                            ]
                        ]
                    );

                    $container2 = $container1->addContainer(
                        'container2',
                        [
                            'sortOrder' => 20
                        ]
                    );

                        $container2->addChildren(
                            'link_text',
                            'text',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'link_text',
                                'templateOptions' => [
                                    'label' => __('Link Text')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'link_url',
                            'link',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'link_url',
                                'templateOptions' => [
                                    'label' => __('Link')
                                ]
                            ]
                        );

                    $container3 = $container1->addContainer(
                        'container3',
                        [
                            'className' => 'mgz-dynamicrows-actions',
                            'sortOrder' => 30
                        ]
                    );

                        $container3->addChildren(
                            'delete',
                            'actionDelete',
                            [
                                'sortOrder' => 10
                            ]
                        );

                        $container3->addChildren(
                            'position',
                            'text',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'position',
                                'templateOptions' => [
                                    'element' => 'Magezon_Builder/js/form/element/dynamic-rows/position'
                                ]
                            ]
                        );

        return $list;
    }

    /**
     * @return array[]
     */
    public function getLayoutOptions()
    {
        return [
            [
                'label' => __('Horizontal'),
                'value' => 'horizontal'
            ],
            [
                'label' => __('Vertical'),
                'value' => 'vertical'
            ]
        ];
    }

    /**
     * @return array
     */
    public function getDefaultValues()
    {
        return [
            'icon_color' => '#333',
            'text_color' => '#333',
            'items' => [
                [
                    'icon'      => 'fas mgz-fa-check',
                    'link_text' => 'Icon 1'
                ],
                [
                    'icon'      => 'fas mgz-fa-plus',
                    'link_text' => 'Icon 2'
                ],
                [
                    'icon'      => 'far mgz-fa-dot-circle',
                    'link_text' => 'Icon 3'
                ]
            ]
        ];
    }
}
