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
 * @package   Magezon_Newsletter
 * @copyright Copyright (C) 2020 Magezon (https://www.magezon.com)
 */

namespace Magezon\Newsletter\Data\Element;

class NewsletterForm extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
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
                    'layout_type',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'layout_type',
                        'defaultValue'    => 'inline',
                        'templateOptions' => [
                            'label'   => __('Layout'),
                            'options' => $this->getLayoutTypeOptions()
                        ]
                    ]
                );

                $container1->addChildren(
                    'show_firstname',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'show_firstname',
                        'templateOptions' => [
                            'label'   => __('Show Firstname')
                        ]
                    ]
                );

                $container1->addChildren(
                    'show_lastname',
                    'toggle',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'show_lastname',
                        'templateOptions' => [
                            'label'   => __('Show Lastname')
                        ]
                    ]
                );

            $container3 = $general->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 20
                ]
            );

                $container3->addChildren(
                    'form_width',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'form_width',
                        'templateOptions' => [
                            'label'   => __('Width')
                        ]
                    ]
                );

                $container3->addChildren(
                    'form_height',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'form_height',
                        'templateOptions' => [
                            'label'   => __('Height')
                        ]
                    ]
                );

            $container4 = $general->addContainerGroup(
                'container4',
                [
                    'sortOrder' => 30
                ]
            );

                $container4->addChildren(
                    'title',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'title',
                        'defaultValue'    => 'Subscribe to Our Newsletter',
                        'templateOptions' => [
                            'label'        => __('Title')
                        ]
                    ]
                );

                $container4->addChildren(
                    'title_tag',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'title_tag',
                        'defaultValue'    => 'h3',
                        'className'       => 'mgz-width30',
                        'templateOptions' => [
                            'label'   => __('Title Tag'),
                            'options' => $this->getHeadingType()
                        ]
                    ]
                );

            $container5 = $general->addContainerGroup(
                'container5',
                [
                    'sortOrder'      => 40,
                    'hideExpression' => '!model.title'
                ]
            );

                $container5->addChildren(
                    'title_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'title_color',
                        'templateOptions' => [
                            'label' => __('Title Color')
                        ]
                    ]
                );

                $container5->addChildren(
                    'title_spacing',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'title_spacing',
                        'templateOptions' => [
                            'label' => __('Title Spacing')
                        ]
                    ]
                );

            $container6 = $general->addContainerGroup(
                'container6',
                [
                    'sortOrder'      => 50,
                    'hideExpression' => '!model.title'
                ]
            );

                $container6->addChildren(
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

                $container6->addChildren(
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

            $general->addChildren(
                'description',
                'text',
                [
                    'sortOrder'       => 60,
                    'key'             => 'description',
                    'defaultValue'    => 'Signup for our news, special offers, product updates.',
                    'templateOptions' => [
                        'label'   => __('Description')
                    ]
                ]
            );

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareButtonTab()
    {
        $tab = $this->addTab(
            'button_style',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Button')
                ]
            ]
        );

            $tab->addChildren(
                'btn_fullwidth',
                'toggle',
                [
                    'sortOrder'       => 10,
                    'key'             => 'btn_fullwidth',
                    'templateOptions' => [
                        'label' => __('Set Full Width Button')
                    ]
                ]
            );

            $border1 = $tab->addContainerGroup(
                'border1',
                [
                    'sortOrder' => 20
                ]
            );

                $border1->addChildren(
                    'button_border_width',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'button_border_width',
                        'templateOptions' => [
                            'label' => __('Border Width')
                        ]
                    ]
                );

                $border1->addChildren(
                    'button_border_radius',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'button_border_radius',
                        'templateOptions' => [
                            'label' => __('Border Radius')
                        ]
                    ]
                );

                $border1->addChildren(
                    'button_border_style',
                    'select',
                    [
                        'key'             => 'button_border_style',
                        'sortOrder'       => 30,
                        'defaultValue'    => 'solid',
                        'templateOptions' => [
                            'label'   => __('Border Style'),
                            'options' => $this->getBorderStyle()
                        ]
                    ]
                );

            $colors = $tab->addTab(
                'colors',
                [
                    'sortOrder'       => 30,
                    'templateOptions' => [
                        'label' => __('Colors')
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
                            'button_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'button_color',
                                'templateOptions' => [
                                    'label' => __('Text Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'button_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'button_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'button_border_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'button_border_color',
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
                            'button_hover_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'button_hover_color',
                                'templateOptions' => [
                                    'label' => __('Text Color')
                                ]
                            ]
                        );

                        $color2->addChildren(
                            'button_hover_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'button_hover_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                        $color2->addChildren(
                            'button_hover_border_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'button_hover_border_color',
                                'templateOptions' => [
                                    'label' => __('Border Color')
                                ]
                            ]
                        );

        return $tab;
    }

    /**
     * @return array[]
     */
    public function getLayoutTypeOptions()
    {
        return [
            [
                'label' => __('Inline'),
                'value' => 'inline'
            ],
            [
                'label' => __('Inline2'),
                'value' => 'inline2'
            ],
            [
                'label' => __('Box'),
                'value' => 'box'
            ]
        ];
    }
}
