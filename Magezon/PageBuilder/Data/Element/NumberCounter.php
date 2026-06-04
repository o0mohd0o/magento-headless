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

class NumberCounter extends \Magezon\Builder\Data\Element\AbstractElement
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

            $containe1 = $general->addContainerGroup(
                'containe1',
                [
                    'sortOrder' => 10
                ]
            );

                $containe1->addChildren(
                    'layout',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'layout',
                        'defaultValue'    => 'circle',
                        'templateOptions' => [
                            'label'   => __('Layout'),
                            'options' => $this->getLayoutOptions()
                        ]
                    ]
                );

                $containe1->addChildren(
                    'number_type',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'number_type',
                        'defaultValue'    => 'percent',
                        'templateOptions' => [
                            'label'   => __('Number Type'),
                            'options' => $this->getNumberType()
                        ]
                    ]
                );

                $containe1->addChildren(
                    'number_position',
                    'select',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'number_position',
                        'defaultValue'    => 'inside',
                        'templateOptions' => [
                            'label'   => __('Number Position'),
                            'options' => $this->getNumberPosition()
                        ],
                        'hideExpression' => 'model.layout!="bars"'
                    ]
                );

            $containe2 = $general->addContainerGroup(
                'containe2',
                [
                    'sortOrder'      => 20,
                    'hideExpression' => 'model.layout!="circle"'
                ]
            );

                $containe2->addChildren(
                    'countdown',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'countdown',
                        'templateOptions' => [
                            'label' => __('Count Down')
                        ]
                    ]
                );

                $containe2->addChildren(
                    'linecap',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'linecap',
                        'defaultValue'    => 'round',
                        'templateOptions' => [
                            'label'   => __('Linecap'),
                            'options' => $this->getLinecapOptions()
                        ]
                    ]
                );

            $containe3 = $general->addContainerGroup(
                'containe3',
                [
                    'sortOrder' => 30
                ]
            );

                $containe3->addChildren(
                    'number',
                    'number',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'number',
                        'defaultValue'    => 100,
                        'templateOptions' => [
                            'label' => __('Number')
                        ]
                    ]
                );

                $containe3->addChildren(
                    'max',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'max',
                        'templateOptions' => [
                            'label' => __('Max')
                        ],
                        'hideExpression' => 'model.number_type!="standard"'
                    ]
                );

            $containe4 = $general->addContainerGroup(
                'containe4',
                [
                    'sortOrder' => 40
                ]
            );

                $containe4->addChildren(
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

                $containe4->addChildren(
                    'number_text',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'number_text',
                        'templateOptions' => [
                            'label' => __('Text')
                        ]
                    ]
                );

            $containe5 = $general->addContainerGroup(
                'containe5',
                [
                    'sortOrder' => 50
                ]
            );

                $containe5->addChildren(
                    'before_number_text',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'before_number_text',
                        'templateOptions' => [
                            'label'   => __('Text Before Number'),
                            'tooltip' => __('Text to appear above the number. Leave it empty for none.')
                        ]
                    ]
                );

                $containe5->addChildren(
                    'after_number_text',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'after_number_text',
                        'templateOptions' => [
                            'label'        => __('Text After Number'),
                            'tooltip'      => __('Text to appear after the number. Leave it empty for none.'),
                            'tooltipClass' => 'tooltip-top-left'
                        ]
                    ]
                );

            $containe6 = $general->addContainerGroup(
                'containe6',
                [
                    'sortOrder' => 60
                ]
            );

                $containe6->addChildren(
                    'number_prefix',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'number_prefix',
                        'templateOptions' => [
                            'label'   => __('Number Prefix'),
                            'tooltip' => __('For example, if your number is US$ 10, your prefix would be "US$ ".')
                        ]
                    ]
                );

                $containe6->addChildren(
                    'number_suffix',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'number_suffix',
                        'templateOptions' => [
                            'label'        => __('Number Suffix'),
                            'tooltip'      => __('For example, if your number is 10%, your suffix would be "%".'),
                            'tooltipClass' => 'tooltip-top-left'
                        ]
                    ]
                );

            $containe7 = $general->addContainerGroup(
                'containe7',
                [
                    'sortOrder' => 70
                ]
            );

                $containe7->addChildren(
                    'speed',
                    'number',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'speed',
                        'defaultValue'    => 1,
                        'templateOptions' => [
                            'label'   => __('Animation Speed(seconds)'),
                            'tooltip' => __('Number of seconds to complete the animation.')
                        ]
                    ]
                );

                $containe7->addChildren(
                    'delay',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'delay',
                        'templateOptions' => [
                            'label' => __('Delay(seconds)')
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
        $style = $this->addTab(
            'style',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Style')
                ]
            ]
        );

            $container1 = $style->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 10
                ]
            );

                $container1->addChildren(
                    'number_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'number_color',
                        'templateOptions' => [
                            'label' => __('Number Color')
                        ]
                    ]
                );

                $container1->addChildren(
                    'number_size',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'number_size',
                        'defaultValue'    => '32',
                        'templateOptions' => [
                            'label' => __('Number Size')
                        ]
                    ]
                );

            $container2 = $style->addContainerGroup(
                'container2',
                [
                    'sortOrder' => 20
                ]
            );

                $container2->addChildren(
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

                $container2->addChildren(
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

            $container3 = $style->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 30
                ]
            );

                $container3->addChildren(
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

                $container3->addChildren(
                    'text_size',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'text_size',
                        'templateOptions' => [
                            'label' => __('Text Size')
                        ]
                    ]
                );

            $container4 = $style->addContainerGroup(
                'container4',
                [
                    'sortOrder' => 40
                ]
            );

                $container4->addChildren(
                    'before_text_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'before_text_color',
                        'templateOptions' => [
                            'label' => __('Before Text Color')
                        ]
                    ]
                );

                $container4->addChildren(
                    'before_text_size',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'before_text_size',
                        'templateOptions' => [
                            'label' => __('Before Text Size')
                        ]
                    ]
                );

            $container5 = $style->addContainerGroup(
                'container5',
                [
                    'sortOrder' => 50
                ]
            );

                $container5->addChildren(
                    'after_text_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'after_text_color',
                        'templateOptions' => [
                            'label' => __('After Text Color')
                        ]
                    ]
                );

                $container5->addChildren(
                    'after_text_size',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'after_text_size',
                        'templateOptions' => [
                            'label' => __('After Text Size')
                        ]
                    ]
                );

            $container6 = $style->addContainerGroup(
                'container6',
                [
                    'sortOrder'      => 60,
                    'hideExpression' => 'model.layout!="circle"'
                ]
            );

                $container6->addChildren(
                    'circle_size',
                    'number',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'circle_size',
                        'defaultValue'    => '200',
                        'templateOptions' => [
                            'label' => __('Circle Size')
                        ]
                    ]
                );

                $container6->addChildren(
                    'circle_dash_width',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'circle_dash_width',
                        'defaultValue'    => '10',
                        'templateOptions' => [
                            'label' => __('Circle Stroke Size')
                        ]
                    ]
                );

            $container7 = $style->addContainerGroup(
                'container7',
                [
                    'sortOrder'      => 70,
                    'hideExpression' => 'model.layout!="circle"'
                ]
            );

                $container7->addChildren(
                    'circle_color1',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'circle_color1',
                        'defaultValue'    => '#a0ce4f',
                        'templateOptions' => [
                            'label' => __('Circle Color1'),
                            'hex'   => true
                        ]
                    ]
                );

                $container7->addChildren(
                    'circle_color2',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'circle_color2',
                        'defaultValue'    => '#eaeaea',
                        'templateOptions' => [
                            'label' => __('Circle Color2'),
                            'hex'   => true
                        ]
                    ]
                );

                $container7->addChildren(
                    'circle_background_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'circle_background_color',
                        'defaultValue'    => '#ffffff',
                        'templateOptions' => [
                            'label' => __('Circle Background Color')
                        ]
                    ]
                );

            $container8 = $style->addContainerGroup(
                'container8',
                [
                    'sortOrder'      => 80,
                    'hideExpression' => 'model.layout!="bars"'
                ]
            );

                $container8->addChildren(
                    'bar_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'bar_color',
                        'defaultValue'    => '#a0ce4f',
                        'templateOptions' => [
                            'label' => __('Bar Color')
                        ]
                    ]
                );

                $container8->addChildren(
                    'bar_background_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'bar_background_color',
                        'defaultValue'    => '#eaeaea',
                        'templateOptions' => [
                            'label' => __('Bar Background Color')
                        ]
                    ]
                );

        return $style;
    }

    /**
     * @return array[]
     */
    public function getLayoutOptions()
    {
        return [
            [
                'label' => __('Only Number'),
                'value' => 'number'
            ],
            [
                'label' => __('Circle Counter'),
                'value' => 'circle'
            ],
            [
                'label' => __('Bars Counter'),
                'value' => 'bars'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getNumberType()
    {
        return [
            [
                'label' => __('Percent'),
                'value' => 'percent'
            ],
            [
                'label' => __('Standard'),
                'value' => 'standard'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getNumberPosition()
    {
        return [
            [
                'label' => __('Inside Bar'),
                'value' => 'inside'
            ],
            [
                'label' => __('Above Bar'),
                'value' => 'above'
            ],
            [
                'label' => __('Below Bar'),
                'value' => 'bellow'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getLinecapOptions()
    {
        return [
            [
                'label' => 'butt',
                'value' => 'butt'
            ],
            [
                'label' => 'square',
                'value' => 'square'
            ],
            [
                'label' => 'round',
                'value' => 'round'
            ]
        ];
    }
}
