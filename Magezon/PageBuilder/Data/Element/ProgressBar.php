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

class ProgressBar extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareBarsTab();
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
                    'text_position',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'text_position',
                        'defaultValue'    => 'inside',
                        'templateOptions' => [
                            'label'   => __('Text Position'),
                            'options' => $this->getTextPosition()
                        ]
                    ]
                );

                $container1->addChildren(
                    'units',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'units',
                        'defaultValue'    => '%',
                        'templateOptions' => [
                            'label' => __('Units')
                        ]
                    ]
                );

                $container1->addChildren(
                    'striped',
                    'toggle',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'striped',
                        'templateOptions' => [
                            'label' => __('Add Stripes')
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

                $container2->addChildren(
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

            $container3 = $general->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 30
                ]
            );

                $container3->addChildren(
                    'bar_height',
                    'number',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'bar_height',
                        'templateOptions' => [
                            'label' => __('Bar Height')
                        ]
                    ]
                );

                $container3->addChildren(
                    'bar_border_radius',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'bar_border_radius',
                        'templateOptions' => [
                            'label' => __('Bar Border Radius')
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
                    'label_font_size',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'label_font_size',
                        'templateOptions' => [
                            'label' => __('Label Font Size')
                        ]
                    ]
                );

                $container4->addChildren(
                    'label_font_weight',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'label_font_weight',
                        'templateOptions' => [
                            'label' => __('Label Font Weight')
                        ]
                    ]
                );

            $container5 = $general->addContainerGroup(
                'container5',
                [
                    'sortOrder' => 50
                ]
            );

                $container5->addChildren(
                    'bar_border_style',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'bar_border_style',
                        'templateOptions' => [
                            'label'   => __('Border Style'),
                            'options' => $this->getBorderStyle()
                        ]
                    ]
                );

                $container5->addChildren(
                    'bar_border_width',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'bar_border_width',
                        'templateOptions' => [
                            'label' => __('Border Width')
                        ]
                    ]
                );

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareBarsTab()
    {
        $tab = $this->addTab(
            'tab_bars',
            [
                'sortOrder'       => 20,
                'templateOptions' => [
                    'label' => __('Bars')
                ]
            ]
        );

            $items = $tab->addChildren(
                'items',
                'dynamicRows',
                [
                    'key'       => 'items',
                    'className' => 'mgz-image-carousel-items mgz-editor-simple',
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
                    $container2 = $container1->addContainer(
                        'container2',
                        [
                            'templateOptions' => [
                                'sortOrder' => 10
                            ]
                        ]
                    );

                        $container2->addChildren(
                            'label',
                            'text',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'label',
                                'templateOptions' => [
                                    'label' => __('Label')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'value',
                            'text',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'value',
                                'templateOptions' => [
                                    'label' => __('Value')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'border_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'border_color',
                                'templateOptions' => [
                                    'label' => __('Border Color')
                                ]
                            ]
                        );

                    $container3 = $container1->addContainer(
                        'container3',
                        [
                            'templateOptions' => [
                                'sortOrder' => 20
                            ]
                        ]
                    );

                        $container3->addChildren(
                            'color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'color',
                                'templateOptions' => [
                                    'label' => __('Color')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'background_color',
                                'templateOptions' => [
                                    'label' => __('Filled Color')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'unfilled_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'unfilled_color',
                                'templateOptions' => [
                                    'label' => __('Unfilled Color')
                                ]
                            ]
                        );

                $container4 = $container1->addContainer(
                    'container4',
                    [
                        'className' => 'mgz-dynamicrows-actions',
                        'sortOrder' => 20
                    ]
                );

                    $container4->addChildren(
                        'delete',
                        'actionDelete',
                        [
                            'sortOrder' => 10
                        ]
                    );

                    $container4->addChildren(
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

        return $tab;
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
    public function getTextPosition()
    {
        return [
            [
                'label' => __('Above Bar'),
                'value' => 'above'
            ],
            [
                'label' => __('Inside'),
                'value' => 'inside'
            ],
            [
                'label' => __('Below'),
                'value' => 'below'
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
    public function getDefaultValues()
    {
        return [
            'items' => [
                [
                    'label' => 'Development',
                    'value' => 90
                ],
                [
                    'label' => 'Design',
                    'value' => 80
                ],
                [
                    'label' => 'Marketing',
                    'value' => 70
                ]
            ]
        ];
    }
}
