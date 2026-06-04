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

class FlipBox extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->preparePrimaryBlockTab();
        $this->prepareHoverBlockTab();
        $this->prepareButtonTab();
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
                    'flip_direction',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'flip_direction',
                        'defaultValue'    => 'left',
                        'templateOptions' => [
                            'label'   => __('Flip Direction'),
                            'options' => $this->getFlipDirection()
                        ]
                    ]
                );

                $container1->addChildren(
                    'flip_effect',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'flip_effect',
                        'defaultValue'    => 'flip-effect-classic',
                        'templateOptions' => [
                            'label'   => __('Flip Effect'),
                            'options' => $this->getFlipEffect()
                        ]
                    ]
                );

                $container1->addChildren(
                    'flip_duration',
                    'number',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'flip_duration',
                        'defaultValue'    => 0.4,
                        'templateOptions' => [
                            'label' => __('Flip Duration')
                        ]
                    ]
                );

            $container2 = $general->addContainerGroup(
                'container2',
                [
                    'sortOrder' => 20
                ]
            );

                $container2->addChildren(
                    'box_min_height',
                    'number',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'box_min_height',
                        'defaultValue'    => 200,
                        'templateOptions' => [
                            'label' => __('Box Min Height')
                        ]
                    ]
                );

                $container2->addChildren(
                    'box_border_radius',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'box_border_radius',
                        'defaultValue'    => 4,
                        'templateOptions' => [
                            'label' => __('Box Border Radius')
                        ]
                    ]
                );

                $container2->addChildren(
                    'box_border_width',
                    'number',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'box_border_width',
                        'defaultValue'    => 1,
                        'templateOptions' => [
                            'label' => __('Box Border Width')
                        ]
                    ]
                );

            $container3 = $general->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 30
                ]
            );

                $container3->addChildren(
                    'title_font_size',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'title_font_size',
                        'templateOptions' => [
                            'label' => __('Title Font Size')
                        ]
                    ]
                );

                $container3->addChildren(
                    'title_font_weight',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'title_font_weight',
                        'templateOptions' => [
                            'label' => __('Title Font Weight')
                        ]
                    ]
                );

           $container4 = $general->addContainerGroup(
               'container4',
               [
                    'sortOrder' => 40
                ]
           );

                $container4->addChildren(
                    'icon',
                    'icon',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'icon',
                        'templateOptions' => [
                            'label' => __('Icon')
                        ],
                        'hideExpression' => '!model.add_icon'
                    ]
                );

                $container4->addChildren(
                    'add_icon',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'add_icon',
                        'className'       => 'mgz-width50',
                        'templateOptions' => [
                            'label' => __('Add Icon')
                        ]
                    ]
                );

            $container5 = $general->addContainerGroup(
                'container5',
                [
                    'sortOrder'      => 50,
                    'hideExpression' => '!model.add_icon'
                ]
            );

                $container5->addChildren(
                    'icon_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'icon_color',
                        'className'       => 'mgz-width50',
                        'templateOptions' => [
                            'label' => __('Icon Color')
                        ],
                        'hideExpression' => '!model.add_icon'
                    ]
                );

                $container5->addChildren(
                    'icon_spin',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'icon_spin',
                        'templateOptions' => [
                            'label' => __('Icon Spin')
                        ]
                    ]
                );

            $container6 = $general->addContainerGroup(
                'container6',
                [
                    'sortOrder'      => 60,
                    'hideExpression' => '!model.add_icon'
                ]
            );

                $container6->addChildren(
                    'circle',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'circle',
                        'className'       => 'mgz-width30',
                        'templateOptions' => [
                            'label' => __('Circle')
                        ]
                    ]
                );

                $container6->addChildren(
                    'circle_border_width',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'circle_border_width',
                        'defaultValue'    => 1,
                        'templateOptions' => [
                            'label' => __('Circle Boder Width')
                        ],
                        'hideExpression' => '!model.circle'
                    ]
                );

                $container6->addChildren(
                    'circle_border_color',
                    'color',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'circle_border_color',
                        'templateOptions' => [
                            'label' => __('Circle Border Color')
                        ],
                        'hideExpression' => '!model.circle'
                    ]
                );

                $container6->addChildren(
                    'circle_background_color',
                    'color',
                    [
                        'sortOrder'       => 40,
                        'key'             => 'circle_background_color',
                        'templateOptions' => [
                            'label' => __('Circle Background Color')
                        ],
                        'hideExpression' => '!model.circle'
                    ]
                );

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function preparePrimaryBlockTab()
    {
        $primaryBlock = $this->addTab(
            'tab_primary_block',
            [
                'sortOrder'       => 20,
                'templateOptions' => [
                    'label' => __('Primary Block')
                ]
            ]
        );

            $primaryBlock->addChildren(
                'primary_title',
                'text',
                [
                    'sortOrder'       => 10,
                    'key'             => 'primary_title',
                    'defaultValue'    => 'Hover Box Element',
                    'templateOptions' => [
                        'label'   => __('Primary Title')
                    ]
                ]
            );

            $primaryBlock->addChildren(
                'primary_title_align',
                'select',
                [
                    'sortOrder'       => 20,
                    'key'             => 'primary_align',
                    'defaultValue'    => 'center',
                    'templateOptions' => [
                        'label'   => __('Primary Alignment'),
                        'options' => $this->getAlignOptions()
                    ]
                ]
            );

            $container1 = $primaryBlock->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 30
                ]
            );

                $container1->addChildren(
                    'primary_image',
                    'image',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'primary_image',
                        'className'       => 'mgz-width50',
                        'templateOptions' => [
                            'label'   => __('Image')
                        ]
                    ]
                );

                $container1->addChildren(
                    'primary_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'primary_color',
                        'templateOptions' => [
                            'label'   => __('Color')
                        ]
                    ]
                );

                $container1->addChildren(
                    'primary_background_color',
                    'color',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'primary_background_color',
                        'defaultValue'    => '#f6f6f6',
                        'templateOptions' => [
                            'label'   => __('Background Color')
                        ]
                    ]
                );

                $container1->addChildren(
                    'primary_border_color',
                    'color',
                    [
                        'sortOrder'       => 40,
                        'key'             => 'primary_border_color',
                        'templateOptions' => [
                            'label'   => __('Border Color')
                        ]
                    ]
                );

            $primaryBlock->addChildren(
                'primary_text',
                'editor',
                [
                    'sortOrder'       => 40,
                    'key'             => 'primary_text',
                    'defaultValue'    => 'Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
                    'templateOptions' => [
                        'label' => __('Primary Text')
                    ]
                ]
            );

        return $primaryBlock;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareHoverBlockTab()
    {
        $hoverBlock = $this->addTab(
            'tab_hover_block',
            [
                'sortOrder'       => 30,
                'templateOptions' => [
                    'label' => __('Hover Block')
                ]
            ]
        );

            $hoverBlock->addChildren(
                'hover_title',
                'text',
                [
                    'sortOrder'       => 10,
                    'key'             => 'hover_title',
                    'defaultValue'    => 'Hover Box Element',
                    'templateOptions' => [
                        'label'   => __('Hover Title')
                    ]
                ]
            );

            $hoverBlock->addChildren(
                'hover_align',
                'select',
                [
                    'sortOrder'       => 20,
                    'key'             => 'hover_align',
                    'defaultValue'    => 'center',
                    'templateOptions' => [
                        'label'   => __('Hover Alignment'),
                        'options' => $this->getAlignOptions()
                    ]
                ]
            );

            $container1 = $hoverBlock->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 30
                ]
            );

                $container1->addChildren(
                    'hover_image',
                    'image',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'hover_image',
                        'className'       => 'mgz-width50',
                        'templateOptions' => [
                            'label'   => __('Hover Image')
                        ]
                    ]
                );

                $container1->addChildren(
                    'hover_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'hover_color',
                        'templateOptions' => [
                            'label'   => __('Color')
                        ]
                    ]
                );

                $container1->addChildren(
                    'hover_background_color',
                    'color',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'hover_background_color',
                        'defaultValue'    => '#f6f6f6',
                        'templateOptions' => [
                            'label'   => __('Background Color')
                        ]
                    ]
                );

                $container1->addChildren(
                    'hover_border_color',
                    'color',
                    [
                        'sortOrder'       => 40,
                        'key'             => 'hover_border_color',
                        'templateOptions' => [
                            'label'   => __('Border Color')
                        ]
                    ]
                );

            $hoverBlock->addChildren(
                'hover_text',
                'editor',
                [
                    'sortOrder'       => 40,
                    'key'             => 'hover_text',
                    'defaultValue'    => 'Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
                    'templateOptions' => [
                        'label' => __('Hover Text')
                    ]
                ]
            );

        return $hoverBlock;
    }

    /**
     * @return array[]
     */
    public function getFlipDirection()
    {
        return [
            [
                'label' => __('Left'),
                'value' => 'left'
            ],
            [
                'label' => __('Right'),
                'value' => 'right'
            ],
            [
                'label' => __('Up'),
                'value' => 'up'
            ],
            [
                'label' => __('Down'),
                'value' => 'down'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getFlipEffect()
    {
        return [
            [
                'label' => __('Classic'),
                'value' => 'flip-effect-classic'
            ],
            [
                'label' => __('3D'),
                'value' => 'flip-effect-3d'
            ]
        ];
    }
}
