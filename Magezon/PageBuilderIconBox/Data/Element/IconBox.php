<?php
/**
 * Magezon
 *
 * This source file is subject to the Magezon Software License, which is available at https://www.magezon.com/license.
 * Do not edit or add to this file if you wish to upgrade the to newer versions in the future.
 * If you wish to customize this module for your needs.
 * Please refer to https://www.magezon.com for more information.
 *
 * @category  Magezon
 * @package   Magezon_PageBuilderIconBox
 * @copyright Copyright (C) 2020 Magezon (https://www.magezon.com)
 */

namespace Magezon\PageBuilderIconBox\Data\Element;

class IconBox extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareIconBoxTab();
        $this->prepareButtonDesignTab();
        return $this;
    }

    /**
     * @return Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $general = parent::prepareGeneralTab();

        $container1 = $general->addContainerGroup(
            '$container1',
            [
                'sortOrder' => 10
            ]
        );

            $container1->addChildren(
                'icon',
                'icon',
                [
                    'key' => 'icon',
                    'defaultValue' => 'fas mgz-fa-adjust',
                    'sortOrder' => 10,
                    'templateOptions' => [
                        'label' => __('Icon'),
                    ]
                ]
            );

            $container1->addChildren(
                'icon_size',
                'select',
                [
                    'sortOrder' => 20,
                    'key' => 'icon_size',
                    'defaultValue' => 'md',
                    'templateOptions' => [
                        'label' => __('Icon Size'),
                        'options' => $this->getSizeList()
                    ]
                ]
            );

            $container1->addChildren(
                'icon_position',
                'select',
                [
                    'sortOrder' => 30,
                    'key' => 'icon_position',
                    'defaultValue' => 'top',
                    'templateOptions' => [
                        'label' => __('Icon Position'),
                        'options' => $this->getIconPosition()
                    ]
                ]
            );

            $container1->addChildren(
                'icon_spacing',
                'text',
                [
                    'sortOrder' => 30,
                    'key' => 'icon_spacing',
                    'templateOptions' => [
                        'label' => __('Icon Spacing'),
                    ]
                ]
            );

        $general->addChildren(
            'title',
            'textarea',
            [
                'sortOrder' => 20,
                'key' => 'title',
                'defaultValue' => 'This is heading',
                'templateOptions' => [
                    'label' => __('Title'),
                    'rows' => 3
                ]
            ]
        );

        $general->addChildren(
            'title_type',
            'select',
            [
                'sortOrder' => 30,
                'key' => 'title_type',
                'defaultValue' => 'h2',
                'templateOptions' => [
                    'label' => __('Title Type'),
                    'options' => $this->getHeadingType()
                ]
            ]
        );

        $container2 = $general->addContainerGroup(
            'container2',
            [
                'sortOrder' => 40
            ]
        );

            $container2->addChildren(
                'font_size',
                'text',
                [
                    'sortOrder' => 10,
                    'key' => 'font_size',
                    'templateOptions' => [
                        'label' => __('Font Size')
                    ]
                ]
            );

            $container2->addChildren(
                'color_title',
                'color',
                [
                    'key' => 'color_title',
                    'sortOrder' => 20,
                    'templateOptions' => [
                        'label' => __('Title Color')
                    ]
                ]
            );

        $container3 = $general->addContainerGroup(
            'container3',
            [
                'sortOrder' => 50
            ]
        );

            $container3->addChildren(
                'line_height',
                'text',
                [
                    'sortOrder' => 10,
                    'key' => 'line_height',
                    'templateOptions' => [
                        'label' => __('Line Height')
                    ]
                ]
            );

            $container3->addChildren(
                'font_weight',
                'text',
                [
                    'sortOrder' => 20,
                    'key' => 'font_weight',
                    'templateOptions' => [
                        'label' => __('Font Weight')
                    ]
                ]
            );

            $container3->addChildren(
                'title_spacing',
                'text',
                [
                    'sortOrder' => 30,
                    'key' => 'title_spacing',
                    'templateOptions' => [
                        'label' => __('Title Spacing'),
                    ]
                ]
            );

        $container4 = $general->addContainerGroup(
            'container4',
            [
                'sortOrder' => 60
            ]
        );

            $container4->addChildren(
                'link',
                'link',
                [
                    'sortOrder' => 10,
                    'key' => 'link',
                    'className' => 'mgz-width200',
                    'templateOptions' => [
                        'label' => __('Title Link')
                    ]
                ]
            );

        $container5 = $general->addContainerGroup(
            'container5',
            [
                'sortOrder' => 70
            ]
        );

            $container5->addChildren(
                'description',
                'editor',
                [
                    'sortOrder' => 10,
                    'key' => 'description',
                    'defaultValue' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
                    'templateOptions' => [
                        'label' => __('Description')
                    ]
                ]
            );

        $general->addChildren(
            'description_spacing',
            'text',
            [
                'sortOrder' => 75,
                'key' => 'description_spacing',
                'templateOptions' => [
                    'label' => __('Description Spacing'),
                ]
            ]
        );

        $container6 = $general->addContainerGroup(
            'container6',
            [
                'sortOrder' => 80
            ]
        );

            $container6->addChildren(
                'add_button',
                'toggle',
                [
                    'sortOrder' => 10,
                    'key' => 'add_button',
                    'templateOptions' => [
                        'label' => __('Add Button')
                    ]
                ]
            );

        $container7 = $general->addContainerGroup(
            'container7',
            [
                'sortOrder' => 90,
                'hideExpression' => '!model.add_button'
            ]
        );

            $container7->addChildren(
                'button_title',
                'text',
                [
                    'sortOrder' => 10,
                    'key' => 'button_title',
                    'defaultValue' => 'Text on the button',
                    'templateOptions' => [
                        'label' => __('Text Button')
                    ]
                ]
            );

            $container7->addChildren(
                'button_spacing',
                'text',
                [
                    'sortOrder' => 20,
                    'key' => 'button_spacing',
                    'templateOptions' => [
                        'label' => __('Button Spacing')
                    ]
                ]
            );

        $container8 = $general->addContainerGroup(
            'container8',
            [
                'sortOrder' => 100
            ]
        );

            $container8->addChildren(
                'onclick_code',
                'text',
                [
                    'sortOrder' => 10,
                    'key' => 'onclick_code',
                    'templateOptions' => [
                        'label' => __('On Click Code')
                    ]
                ]
            );

            $container8->addChildren(
                'button_link',
                'link',
                [
                    'sortOrder' => 20,
                    'key' => 'button_link',
                    'templateOptions' => [
                        'label' => __('Button Link')
                    ],
                    'hideExpression' => '!model.add_button'
                ]
            );

        $container9 = $general->addContainerGroup(
            'container9',
            [
                'sortOrder' => 110
            ]
        );

            $container9->addChildren(
                'add_icon',
                'toggle',
                [
                    'sortOrder' => 10,
                    'key' => 'add_icon',
                    'templateOptions' => [
                        'label' => __('Add Button Icon')
                    ]
                ]
            );

            $container9->addChildren(
                'auto_width',
                'toggle',
                [
                    'sortOrder' => 20,
                    'key' => 'auto_width',
                    'templateOptions' => [
                        'label' => __('Element Auto Width'),
                        'note' => __('Display multiple buttons in same row')
                    ]
                ]
            );

            $container9->addChildren(
                'display_as_link',
                'toggle',
                [
                    'sortOrder' => 30,
                    'key' => 'display_as_link',
                    'templateOptions' => [
                        'label' => __('Display as link')
                    ]
                ]
            );

        $container10 = $general->addContainerGroup(
            'container10',
            [
                'sortOrder' => 120,
                'hideExpression' => '!model.add_icon'
            ]
        );

            $container10->addChildren(
                'icon_button',
                'icon',
                [
                    'sortOrder' => 10,
                    'key' => 'icon_button',
                    'templateOptions' => [
                        'label' => __('Icon Button')
                    ]
                ]
            );

            $container10->addChildren(
                'icon_button_position',
                'select',
                [
                    'sortOrder' => 20,
                    'key' => 'icon_button_position',
                    'defaultValue' => 'left',
                    'templateOptions' => [
                        'label' => __('Icon Button Position'),
                        'options' => $this->getIconButtonPosition()
                    ]
                ]
            );
        return $general;
    }

    public function prepareIconBoxTab()
    {
        $icon = $this->addTab(
            'icon_design',
            [
                'sortOrder' => 50,
                'templateOptions' => [
                    'label' => __('Icon Design')
                ]
            ]
        );
        
            $colors = $icon->addTab(
                'colors',
                [
                    'sortOrder' => 30,
                    'templateOptions' => [
                        'label' => __('Colors')
                    ]
                ]
            );

                $normal = $colors->addContainerGroup(
                    'normal',
                    [
                        'sortOrder' => 10,
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
                                'sortOrder' => 10,
                                'key' => 'icon_color',
                                'templateOptions' => [
                                    'label' => __('Icon Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'icon_background_color',
                            'color',
                            [
                                'sortOrder' => 20,
                                'key' => 'icon_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'icon_border_color',
                            'color',
                            [
                                'sortOrder' => 30,
                                'key' => 'icon_border_color',
                                'templateOptions' => [
                                    'label' => __('Border Color')
                                ]
                            ]
                        );

                    $color2 = $normal->addContainerGroup(
                        'color2',
                        [
                            'sortOrder' => 20
                        ]
                    );

                        $color2->addChildren(
                            'icon_border_width',
                            'text',
                            [
                                'sortOrder' => 10,
                                'key' => 'icon_border_width',
                                'templateOptions' => [
                                    'label' => __('Border Width'),
                                ]
                            ]
                        );

                        $color2->addChildren(
                            'icon_border_radius',
                            'text',
                            [
                                'sortOrder' => 20,
                                'key' => 'icon_border_radius',
                                'templateOptions' => [
                                    'label' => __('Border Radius'),
                                ]
                            ]
                        );

                        $color2->addChildren(
                            'icon_border_style',
                            'select',
                            [
                                'sortOrder' => 30,
                                'key' => 'icon_border_style',
                                'templateOptions' => [
                                    'label' => __('Border Style'),
                                    'options' => $this->getBorderStyle(),
                                    'placeholder' => __('Theme defaults')
                                ]
                            ]
                        );

        $hover = $colors->addContainerGroup(
            'hover',
            [
                'sortOrder' => 20,
                'templateOptions' => [
                    'label' => __('Hover')
                ]
            ]
        );

            $color3 = $hover->addContainerGroup(
                'color3',
                [
                    'sortOrder' => 10
                ]
            );

                $color3->addChildren(
                    'icon_hover_color',
                    'color',
                    [
                        'sortOrder' => 10,
                        'key' => 'icon_hover_color',
                        'templateOptions' => [
                            'label' => __('Icon Color')
                        ]
                    ]
                );

                $color3->addChildren(
                    'icon_hover_background_color',
                    'color',
                    [
                        'sortOrder' => 20,
                        'key' => 'icon_hover_background_color',
                        'templateOptions' => [
                            'label' => __('Background Color')
                        ]
                    ]
                );

                $color3->addChildren(
                    'icon_hover_border_color',
                    'color',
                    [
                        'sortOrder' => 30,
                        'key' => 'icon_hover_border_color',
                        'templateOptions' => [
                            'label' => __('Border Color')
                        ]
                    ]
                );

            $color4 = $hover->addContainerGroup(
                'color4',
                [
                    'sortOrder' => 20
                ]
            );

                $color4->addChildren(
                    'icon_border_width',
                    'text',
                    [
                        'sortOrder' => 10,
                        'key' => 'icon_border_width',
                        'templateOptions' => [
                            'label' => __('Border Width'),
                        ]
                    ]
                );

                $color4->addChildren(
                    'icon_border_radius',
                    'color',
                    [
                        'sortOrder' => 20,
                        'key' => 'icon_border_radius',
                        'templateOptions' => [
                            'label' => __('Border Radius'),
                            'placeholder' => '5px'
                        ]
                    ]
                );

                $color4->addChildren(
                    'icon_border_style',
                    'select',
                    [
                        'sortOrder' => 30,
                        'key' => 'icon_border_style',
                        'templateOptions' => [
                            'label' => __('Border Style'),
                            'options' => $this->getBorderStyle(),
                            'placeholder' => __('Theme defaults')
                        ]
                    ]
                );

        $icon->addChildren(
            'icon_css',
            'code',
            [
                'sortOrder' => 30,
                'key' => 'icon_css',
                'templateOptions' => [
                    'label' => __('Inline CSS')
                ]
            ]
        );
        return $icon;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareButtonDesignTab()
    {
        $design = $this->addTab(
            'button_design',
            [
                'sortOrder' => 50,
                'templateOptions' => [
                    'label' => __('Button Design')
                ]
            ]
        );

            $container1 = $design->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 10
                ]
            );

                $container1->addChildren(
                    'button_style',
                    'select',
                    [
                        'sortOrder' => 10,
                        'key' => 'button_style',
                        'defaultValue' => 'flat',
                        'templateOptions' => [
                            'label' => __('Button Style'),
                            'options' => $this->getButtonStyle()
                        ]
                    ]
                );

                $container1->addChildren(
                    'button_size',
                    'select',
                    [
                        'sortOrder' => 20,
                        'key' => 'button_size',
                        'defaultValue' => 'md',
                        'templateOptions' => [
                            'label' => __('Button Size'),
                            'options' => $this->getSizeList()
                        ]
                    ]
                );

                $container1->addChildren(
                    'full_width',
                    'toggle',
                    [
                        'sortOrder' => 30,
                        'key' => 'full_width',
                        'templateOptions' => [
                            'label' => __('Set Full Width Button')
                        ]
                    ]
                );

            $container2 = $design->addContainerGroup(
                'container2',
                [
                    'sortOrder' => 20,
                    'hideExpression' => 'model.button_style!="gradient"'
                ]
            );

                $container2->addChildren(
                    'gradient_color_1',
                    'color',
                    [
                        'sortOrder' => 10,
                        'key' => 'gradient_color_1',
                        'defaultValue' => '#dd3333',
                        'templateOptions' => [
                            'label' => __('Gradient Color 1')
                        ]
                    ]
                );

                $container2->addChildren(
                    'gradient_color_2',
                    'color',
                    [
                        'sortOrder' => 20,
                        'key' => 'gradient_color_2',
                        'defaultValue' => '#eeee22',
                        'templateOptions' => [
                            'label' => __('Gradient Color 2')
                        ]
                    ]
                );

            $container3 = $design->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 20,
                    'hideExpression' => 'model.button_style!="3d"'
                ]
            );

                $container3->addChildren(
                    'box_shadow_color',
                    'color',
                    [
                        'sortOrder' => 10,
                        'key' => 'box_shadow_color',
                        'defaultValue' => '#cccccc',
                        'templateOptions' => [
                            'label' => __('BoxShadow Color')
                        ]
                    ]
                );

        $border1 = $design->addContainerGroup(
            'border1',
            [
                'sortOrder' => 30
            ]
        );

        $border1->addChildren(
            'button_border_width',
            'text',
            [
                'sortOrder' => 10,
                'key' => 'button_border_width',
                'templateOptions' => [
                    'label' => __('Border Width')
                ]
            ]
        );

        $border1->addChildren(
            'button_border_radius',
            'text',
            [
                'sortOrder' => 20,
                'key' => 'button_border_radius',
                'templateOptions' => [
                    'label' => __('Border Radius')
                ]
            ]
        );

        $border1->addChildren(
            'button_border_style',
            'select',
            [
                'key' => 'button_border_style',
                'sortOrder' => 30,
                'defaultValue' => 'solid',
                'templateOptions' => [
                    'label' => __('Border Style'),
                    'options' => $this->getBorderStyle()
                ]
            ]
        );

        $colors = $design->addTab(
            'colors',
            [
                'sortOrder' => 40,
                'templateOptions' => [
                    'label' => __('Colors')
                ]
            ]
        );

            $normal = $colors->addContainerGroup(
                'normal',
                [
                    'sortOrder' => 10,
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
                        'button_color',
                        'color',
                        [
                            'sortOrder' => 10,
                            'key' => 'button_color',
                            'templateOptions' => [
                                'label' => __('Text Color')
                            ]
                        ]
                    );

                    $color1->addChildren(
                        'button_background_color',
                        'color',
                        [
                            'sortOrder' => 20,
                            'key' => 'button_background_color',
                            'templateOptions' => [
                                'label' => __('Background Color')
                            ]
                        ]
                    );

                    $color1->addChildren(
                        'button_border_color',
                        'color',
                        [
                            'sortOrder' => 30,
                            'key' => 'button_border_color',
                            'templateOptions' => [
                                'label' => __('Border Color')
                            ]
                        ]
                    );

        $hover = $colors->addContainerGroup(
            'hover',
            [
                'sortOrder' => 20,
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
                    'button_hover_color',
                    'color',
                    [
                        'sortOrder' => 10,
                        'key' => 'button_hover_color',
                        'templateOptions' => [
                            'label' => __('Text Color')
                        ]
                    ]
                );

                $color2->addChildren(
                    'button_hover_background_color',
                    'color',
                    [
                        'sortOrder' => 20,
                        'key' => 'button_hover_background_color',
                        'templateOptions' => [
                            'label' => __('Background Color')
                        ]
                    ]
                );

                $color2->addChildren(
                    'button_hover_border_color',
                    'color',
                    [
                        'sortOrder' => 30,
                        'key' => 'button_hover_border_color',
                        'templateOptions' => [
                            'label' => __('Border Color')
                        ]
                    ]
                );

        $design->addChildren(
            'button_css',
            'code',
            [
                'sortOrder' => 50,
                'key' => 'button_css',
                'templateOptions' => [
                    'label' => __('Inline CSS')
                ]
            ]
        );
        return $design;
    }

    /**
     * @return array
     */
    public function getDefaultValues()
    {
        return [
            'align' => 'center'
        ];
    }

    /**
     * @return array[]
     */
    public function getIconButtonPosition()
    {
        return [
            [
                'label' => __('Left'),
                'value' => 'left'
            ],
            [
                'label' => __('Right'),
                'value' => 'right'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getIconPosition()
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
                'label' => __('Top'),
                'value' => 'top'
            ],
            [
                'label' => __('Bottom'),
                'value' => 'bottom'
            ]
        ];
    }

    /**
     * @return array
     */
    public function getButtonStyle()
    {
        return [
            [
                'label' => __('Modern'),
                'value' => 'modern'
            ],
            [
                'label' => __('Flat'),
                'value' => 'flat'
            ],
            [
                'label' => __('3D'),
                'value' => '3d'
            ],
            [
                'label' => __('Gradient'),
                'value' => 'gradient'
            ]
        ];
    }
}
