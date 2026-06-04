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

class Accordion extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareSection();
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

            $general->addChildren(
                'description',
                'textarea',
                [
                    'sortOrder'       => 30,
                    'key'             => 'description',
                    'templateOptions' => [
                        'label' => __('Widget Description')
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
                    'gap',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'gap',
                        'templateOptions' => [
                            'label' => __('Gap')
                        ]
                    ]
                );

                $container2->addChildren(
                    'active_sections',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'active_sections',
                        'templateOptions' => [
                            'label' => __('Active Sections'),
                            'note'  => __('Enter active sections number. Comma-separated. Leave empty or enter non-existing number to close all sections on page load.')
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
                    'collapsible_all',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'collapsible_all',
                        'templateOptions' => [
                            'label' => __('Allow Collapse All'),
                            'note'  => __('Allow collapse multiple sections.')
                        ]
                    ]
                );

                $container3->addChildren(
                    'at_least_one_open',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'at_least_one_open',
                        'templateOptions' => [
                            'label' => __('At Least Once Open')
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
                    'accordion_icon',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'accordion_icon',
                        'defaultValue'    => 'plus',
                        'templateOptions' => [
                            'label'   => __('Icon'),
                            'options' => $this->getIconOptions()
                        ]
                    ]
                );

                $container4->addChildren(
                    'icon_position',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'icon_position',
                        'defaultValue'    => 'left',
                        'templateOptions' => [
                            'label'   => __('Icon Position'),
                            'options' => $this->getIconPosition()
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
                    'icon',
                    'icon',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'icon',
                        'defaultValue'    => 'fas mgz-fa-plus',
                        'templateOptions' => [
                            'label' => __('Icon')
                        ],
                        'hideExpression' => 'model.accordion_icon!="custom"'
                    ]
                );

                $container5->addChildren(
                    'active_icon',
                    'icon',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'active_icon',
                        'defaultValue'    => 'fas mgz-fa-minus',
                        'templateOptions' => [
                            'label' => __('Active Icon')
                        ],
                        'hideExpression' => 'model.accordion_icon!="custom"'
                    ]
                );

            $container6 = $general->addContainerGroup(
                'container6',
                [
                    'sortOrder' => 80
                ]
            );

                $container6->addChildren(
                    'no_fill_content_area',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'no_fill_content_area',
                        'defaultValue'    => false,
                        'templateOptions' => [
                            'label' => __('Do not fill content area?')
                        ]
                    ]
                );

                $container6->addChildren(
                    'hide_empty_section',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'hide_empty_section',
                        'templateOptions' => [
                            'label' => __('Hide Empty Section')
                        ]
                    ]
                );

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareSection()
    {
        $section = $this->addTab(
            'section',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Section')
                ]
            ]
        );

            $container1 = $section->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 10
                ]
            );

                $container1->addChildren(
                    'section_align',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'section_align',
                        'defaultValue'    => 'left',
                        'templateOptions' => [
                            'label'   => __('Alignment'),
                            'options' => $this->getAlignOptions()
                        ]
                    ]
                );

                $container1->addChildren(
                    'spacing',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'spacing',
                        'templateOptions' => [
                            'label' => __('Spacing')
                        ]
                    ]
                );

                $container1->addChildren(
                    'title_font_size',
                    'text',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'title_font_size',
                        'templateOptions' => [
                            'label' => __('Title Font Size')
                        ]
                    ]
                );

            $border1 = $section->addContainerGroup(
                'border1',
                [
                    'sortOrder' => 20
                ]
            );

                $border1->addChildren(
                    'section_border_width',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'section_border_width',
                        'templateOptions' => [
                            'label' => __('Border Width')
                        ]
                    ]
                );

                $border1->addChildren(
                    'section_border_radius',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'section_border_radius',
                        'templateOptions' => [
                            'label'       => __('Border Radius'),
                            'placeholder' => '5px'
                        ]
                    ]
                );

                $border1->addChildren(
                    'section_border_style',
                    'select',
                    [
                        'key'             => 'section_border_style',
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label'       => __('Border Style'),
                            'options'     => $this->getBorderStyle(),
                            'placeholder' => __('Theme defaults')
                        ]
                    ]
                );

            $colors = $section->addTab(
                'colors',
                [
                    'sortOrder'       => 30,
                    'templateOptions' => [
                        'label' => __('Title Colors')
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
                            'section_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'section_color',
                                'templateOptions' => [
                                    'label' => __('Text Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'section_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'section_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'section_border_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'section_border_color',
                                'templateOptions' => [
                                    'label' => __('Border Color')
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
                            'section_hover_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'section_hover_color',
                                'templateOptions' => [
                                    'label' => __('Text Color')
                                ]
                            ]
                        );

                        $color2->addChildren(
                            'section_hover_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'section_hover_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                        $color2->addChildren(
                            'section_hover_border_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'section_hover_border_color',
                                'templateOptions' => [
                                    'label' => __('Border Color')
                                ]
                            ]
                        );

                $active = $colors->addContainerGroup(
                    'active',
                    [
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label' => __('Active')
                        ]
                    ]
                );

                    $color3 = $active->addContainerGroup(
                        'color3',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $color3->addChildren(
                            'section_active_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'section_active_color',
                                'templateOptions' => [
                                    'label' => __('Text Color')
                                ]
                            ]
                        );

                        $color3->addChildren(
                            'section_active_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'section_active_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                        $color3->addChildren(
                            'section_active_border_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'section_active_border_color',
                                'templateOptions' => [
                                    'label' => __('Border Color')
                                ]
                            ]
                        );

            $container2 = $section->addContainerGroup(
                'container2',
                [
                    'sortOrder' => 40
                ]
            );

                $container2->addChildren(
                    'section_content_background_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'section_content_background_color',
                        'templateOptions' => [
                            'label' => __('Content Background Color')
                        ]
                    ]
                );

                $container2->addChildren(
                    'section_content_padding',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'section_content_padding',
                        'templateOptions' => [
                            'label' => __('Content Padding')
                        ]
                    ]
                );

        return $section;
    }

    /**
     * @return array[]
     */
    public function getIconOptions()
    {
        return [
            [
                'label' => __('None'),
                'value' => ''
            ],
            [
                'label' => __('Chevron'),
                'value' => 'chevron'
            ],
            [
                'label' => __('Plus'),
                'value' => 'plus'
            ],
            [
                'label' => __('Triangle'),
                'value' => 'triangle'
            ],
            [
                'label' => __('Dot'),
                'value' => 'dot'
            ],
            [
                'label' => __('Custom'),
                'value' => 'custom'
            ]
        ];
    }
}
