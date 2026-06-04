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

class MessageBox extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareMessageBoxDesign();
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
                    'icon',
                    'icon',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'icon',
                        'defaultValue'    => 'fas mgz-fa-info-circle',
                        'templateOptions' => [
                            'label' => __('Icon')
                        ]
                    ]
                );

                $container1->addChildren(
                    'icon_size',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'icon_size',
                        'templateOptions' => [
                            'label' => __('Icon Size')
                        ]
                    ]
                );

            $general->addChildren(
                'content',
                'editor',
                [
                    'sortOrder'       => 20,
                    'key'             => 'content',
                    'defaultValue'    => __('I am message box. Click edit button to change this text.'),
                    'templateOptions' => [
                        'label' => __('Message Text')
                    ]
                ]
            );

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareMessageBoxDesign()
    {
        $design = $this->addTab(
            'message_box_design',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Message Box Design')
                ]
            ]
        );

            $design->addChildren(
                'preset',
                'select',
                [
                    'sortOrder'       => 10,
                    'key'             => 'preset',
                    'defaultValue'    => 'info',
                    'templateOptions' => [
                        'label'   => __('Message Box Presets'),
                        'options' => $this->getPresetOptions(),
                        'element' => 'Magezon_Builder/js/form/element/dependency',
                        'values'  => [
                            'info' => [
                                'message_box_color'            => '#5e7f96',
                                'message_box_border_color'     => '#cfebfe',
                                'message_box_background_color' => '#dff2fe',
                                'message_icon_color'           => '#56b0ee',
                                'icon_library'                 => 'awesome',
                                'icon'                         => 'fas mgz-fa-info-circle'
                            ],
                            'warning' => [
                                'message_box_color'            => '#9d8967',
                                'message_box_border_color'     => '#ffeccc',
                                'message_box_background_color' => '#fff4e2',
                                'message_icon_color'           => '#fcb53f',
                                'icon_library'                 => 'awesome',
                                'icon'                         => 'fas mgz-fa-exclamation-triangle'
                            ],
                            'success' => [
                                'message_box_color'            => '#5e7f96',
                                'message_box_border_color'     => '#cfebfe',
                                'message_box_background_color' => '#e6fdf8',
                                'message_icon_color'           => '#1bbc9b',
                                'icon_library'                 => 'awesome',
                                'icon'                         => 'fas mgz-fa-check'
                            ],
                            'danger' => [
                                'message_box_color'            => '#a85959',
                                'message_box_border_color'     => '#fedede',
                                'message_box_background_color' => '#fdeaea',
                                'message_icon_color'           => '#ff7877',
                                'icon_library'                 => 'awesome',
                                'icon'                         => 'fas mgz-fa-times'
                            ]
                        ]
                    ]
                ]
            );

            $container1 = $design->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 20
                ]
            );

                $container1->addChildren(
                    'message_box_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'message_box_color',
                        'defaultValue'    => '#5e7f96',
                        'templateOptions' => [
                            'label' => __('Color')
                        ]
                    ]
                );

                $container1->addChildren(
                    'message_box_background_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'message_box_background_color',
                        'defaultValue'    => '#dff2fe',
                        'templateOptions' => [
                            'label' => __('Background Color')
                        ]
                    ]
                );

                $container1->addChildren(
                    'message_box_border_color',
                    'color',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'message_box_border_color',
                        'defaultValue'    => '#cfebfe',
                        'templateOptions' => [
                            'label' => __('Border Color')
                        ]
                    ]
                );

            $container2 = $design->addContainerGroup(
                'container2',
                [
                    'sortOrder' => 30
                ]
            );

                $container2->addChildren(
                    'message_box_border_width',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'message_box_border_width',
                        'templateOptions' => [
                            'label'       => __('Border Width'),
                            'placeholder' => '1px'
                        ]
                    ]
                );

                $container2->addChildren(
                    'message_box_border_radius',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'message_box_border_radius',
                        'templateOptions' => [
                            'label'       => __('Border Radius'),
                            'placeholder' => '3px'
                        ]
                    ]
                );

                $container2->addChildren(
                    'message_box_border_style',
                    'select',
                    [
                        'key'             => 'message_box_border_style',
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label'       => __('Border Style'),
                            'options'     => $this->getBorderStyle(),
                            'placeholder' => __('Theme defaults')
                        ]
                    ]
                );

            $container3 = $design->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 30
                ]
            );

                $container3->addChildren(
                    'message_icon_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'message_icon_color',
                        'defaultValue'    => '#56b0ee',
                        'templateOptions' => [
                            'label' => __('Icon Color')
                        ]
                    ]
                );

                $container3->addChildren(
                    'message_icon_background_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'message_icon_background_color',
                        'templateOptions' => [
                            'label' => __('Icon Background Color')
                        ]
                    ]
                );

        return $design;
    }

    /**
     * @return array[]
     */
    public function getPresetOptions()
    {
        return [
            [
                'label' => __('Informational'),
                'value' => 'info'
            ],
            [
                'label' => __('Warning'),
                'value' => 'warning'
            ],
            [
                'label' => __('Success'),
                'value' => 'success'
            ],
            [
                'label' => __('Error'),
                'value' => 'danger'
            ]
        ];
    }
}
