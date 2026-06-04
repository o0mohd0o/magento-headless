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

class PricingTable extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareStyleTab();
        $this->prepareItemsTab();
        return $this;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $general = parent::prepareGeneralTab();

            $general->addChildren(
                'table_type',
                'select',
                [
                    'sortOrder'       => 10,
                    'key'             => 'table_type',
                    'defaultValue'    => 'type1',
                    'templateOptions' => [
                        'label'   => __('Type'),
                        'options' => $this->getTableType()
                    ]
                ]
            );

            $general->addChildren(
                'table_spacing',
                'number',
                [
                    'sortOrder'       => 20,
                    'key'             => 'table_spacing',
                    'templateOptions' => [
                        'label' => __('Spacing')
                    ],
                    'hideExpression' => 'model.table_type!="type2"'
                ]
            );

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareItemsTab()
    {
        $items = $this->addTab(
            'tab_items',
            [
                'sortOrder'       => 20,
                'templateOptions' => [
                    'label' => __('Items')
                ]
            ]
        );

            $items = $items->addChildren(
                'items',
                'dynamicRows',
                [
                    'key'             => 'items',
                    'sortOrder'       => 10,
                    'templateOptions' => [
                        'displayIndex' => true
                    ]
                ]
            );

                $container1 = $items->addContainer(
                    'container1',
                    [
                        'sortOrder' => 10
                    ]
                );

                    $container2 = $container1->addContainerGroup(
                        'container2',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $container2->addChildren(
                            'title',
                            'text',
                            [
                                'key'             => 'title',
                                'sortOrder'       => 10,
                                'templateOptions' => [
                                    'label' => __('Title')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'sub_title',
                            'text',
                            [
                                'key'             => 'sub_title',
                                'sortOrder'       => 20,
                                'templateOptions' => [
                                    'label' => __('Sub Title')
                                ]
                            ]
                        );

                    $container3 = $container1->addContainerGroup(
                        'container3',
                        [
                            'sortOrder' => 20
                        ]
                    );

                        $container3->addChildren(
                            'price',
                            'text',
                            [
                                'key'             => 'price',
                                'sortOrder'       => 10,
                                'templateOptions' => [
                                    'label' => __('Price')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'currency',
                            'text',
                            [
                                'key'             => 'currency',
                                'sortOrder'       => 20,
                                'templateOptions' => [
                                    'label' => __('Currency')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'period',
                            'text',
                            [
                                'key'             => 'period',
                                'sortOrder'       => 30,
                                'templateOptions' => [
                                    'label' => __('Period')
                                ]
                            ]
                        );

                    $container4 = $container1->addContainerGroup(
                        'container4',
                        [
                            'sortOrder' => 30
                        ]
                    );

                        $container4->addChildren(
                            'featured',
                            'toggle',
                            [
                                'key'             => 'featured',
                                'sortOrder'       => 10,
                                'templateOptions' => [
                                    'label' => __('Is Featured')
                                ]
                            ]
                        );

                        $container4->addChildren(
                            'custom_classes',
                            'text',
                            [
                                'key'             => 'custom_classes',
                                'sortOrder'       => 20,
                                'templateOptions' => [
                                    'label' => __('Custom Classes')
                                ]
                            ]
                        );

                    $features = $container1->addContainer(
                        'features_container',
                        [
                            'sortOrder'       => 40,
                            'templateOptions' => [
                                'label'       => __('Features'),
                                'collapsible' => true
                            ]
                        ]
                    );

                        $features = $features->addChildren(
                            'slides',
                            'dynamicRows',
                            [
                                'key'       => 'features',
                                'sortOrder' => 10
                            ]
                        );

                            $container4 = $features->addContainerGroup(
                                'container4',
                                [
                                    'sortOrder' => 90
                                ]
                            );

                                $container5 = $container4->addContainer(
                                    'container5',
                                    [
                                        'sortOrder' => 10
                                    ]
                                );

                                    $container5->addChildren(
                                        'title',
                                        'text',
                                        [
                                            'sortOrder'       => 10,
                                            'key'             => 'title',
                                            'templateOptions' => [
                                                'placeholder' => __('Title')
                                            ]
                                        ]
                                    );

                                    $container6 = $container5->addContainerGroup(
                                        'container6',
                                        [
                                            'sortOrder' => 20
                                        ]
                                    );

                                        $container6->addChildren(
                                            'icon',
                                            'icon',
                                            [
                                                'sortOrder'       => 10,
                                                'key'             => 'icon',
                                                'templateOptions' => [
                                                    'placeholder' => __('Icon')
                                                ]
                                            ]
                                        );

                                        $container6->addChildren(
                                            'icon_color',
                                            'color',
                                            [
                                                'sortOrder'       => 20,
                                                'key'             => 'icon_color',
                                                'templateOptions' => [
                                                    'label' => __('Icon Color')
                                                ]
                                            ]
                                        );

                                $container4->addChildren(
                                    'delete',
                                    'actionDelete',
                                    [
                                        'sortOrder' => 20,
                                        'className' => 'mgz-width10',
                                    ]
                                );

                    $button = $container1->addContainer(
                        'button_container',
                        [
                            'sortOrder'       => 50,
                            'templateOptions' => [
                                'label'       => __('Button'),
                                'collapsible' => true
                            ]
                        ]
                    );

                        $button->addChildren(
                            'button_text',
                            'text',
                            [
                                'key'             => 'button_text',
                                'sortOrder'       => 10,
                                'templateOptions' => [
                                    'label' => __('Button Text')
                                ]
                            ]
                        );

                        $button->addChildren(
                            'button_link',
                            'link',
                            [
                                'key'             => 'button_link',
                                'sortOrder'       => 20,
                                'templateOptions' => [
                                    'label' => __('Button Link')
                                ]
                            ]
                        );

                    $container5 = $items->addContainerGroup(
                        'container5',
                        [
                            'sortOrder' => 60
                        ]
                    );

                        $container5->addChildren(
                            'delete',
                            'actionDelete',
                            [
                                'sortOrder' => 10,
                                'className' => 'mgz-width10'
                            ]
                        );

                        $container5->addChildren(
                            'position',
                            'text',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'position',
                                'className'       => 'mgz-width20',
                                'templateOptions' => [
                                    'element'     => 'Magezon_Builder/js/form/element/dynamic-rows/position',
                                    'placeholder' => __('Position')
                                ]
                            ]
                        );

        return $items;
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

            $heading = $tab->addContainer(
                'heading_container',
                [
                    'sortOrder'       => 10,
                    'templateOptions' => [
                        'label'       => __('Heading'),
                        'collapsible' => true
                    ]
                ]
            );

                $tabs = $heading->addTab(
                    'heading_tabs',
                    [
                        'sortOrder' => 10
                    ]
                );

                    $normal = $tabs->addContainerGroup(
                        'normal',
                        [
                            'sortOrder'       => 10,
                            'templateOptions' => [
                                'label' => __('Normal')
                            ]
                        ]
                    );

                        $container1 = $normal->addContainerGroup(
                            'container1',
                            [
                                'sortOrder' => 10
                            ]
                        );

                            $container1->addChildren(
                                'heading_font_size',
                                'text',
                                [
                                    'key'             => 'heading_font_size',
                                    'sortOrder'       => 10,
                                    'templateOptions' => [
                                        'label' => __('Font Size')
                                    ]
                                ]
                            );

                            $container1->addChildren(
                                'heading_font_weight',
                                'text',
                                [
                                    'key'             => 'heading_font_weight',
                                    'sortOrder'       => 10,
                                    'templateOptions' => [
                                        'label' => __('Font Weight')
                                    ]
                                ]
                            );

                        $container2 = $normal->addContainerGroup(
                            'container2',
                            [
                                'sortOrder' => 20
                            ]
                        );

                            $container2->addChildren(
                                'heading_color',
                                'color',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'heading_color',
                                    'templateOptions' => [
                                        'label' => __('Text Color')
                                    ]
                                ]
                            );

                            $container2->addChildren(
                                'heading_background_color',
                                'color',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'heading_background_color',
                                    'templateOptions' => [
                                        'label' => __('Background Color')
                                    ]
                                ]
                            );

                    $featured = $tabs->addContainerGroup(
                        'featured',
                        [
                            'sortOrder'       => 20,
                            'templateOptions' => [
                                'label' => __('Featured')
                            ]
                        ]
                    );

                        $container1 = $featured->addContainerGroup(
                            'container1',
                            [
                                'sortOrder' => 10
                            ]
                        );

                            $container1->addChildren(
                                'heading_featured_font_size',
                                'text',
                                [
                                    'key'             => 'heading_featured_font_size',
                                    'sortOrder'       => 10,
                                    'templateOptions' => [
                                        'label' => __('Font Size')
                                    ]
                                ]
                            );

                            $container1->addChildren(
                                'heading_featured_font_weight',
                                'text',
                                [
                                    'key'             => 'heading_featured_font_weight',
                                    'sortOrder'       => 10,
                                    'templateOptions' => [
                                        'label' => __('Font Weight')
                                    ]
                                ]
                            );

                        $container2 = $featured->addContainerGroup(
                            'container2',
                            [
                                'sortOrder' => 20
                            ]
                        );

                            $container2->addChildren(
                                'heading_featured_color',
                                'color',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'heading_featured_color',
                                    'templateOptions' => [
                                        'label' => __('Text Color')
                                    ]
                                ]
                            );

                            $container2->addChildren(
                                'heading_featured_background_color',
                                'color',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'heading_featured_background_color',
                                    'templateOptions' => [
                                        'label' => __('Background Color')
                                    ]
                                ]
                            );

            $price = $tab->addContainer(
                'price_container',
                [
                    'sortOrder'       => 20,
                    'templateOptions' => [
                        'label'       => __('Price'),
                        'collapsible' => true
                    ]
                ]
            );

                $tabs = $price->addTab(
                    'price_tabs',
                    [
                        'sortOrder' => 10
                    ]
                );

                    $normal = $tabs->addContainerGroup(
                        'normal',
                        [
                            'sortOrder'       => 10,
                            'templateOptions' => [
                                'label' => __('Normal')
                            ]
                        ]
                    );

                        $container1 = $normal->addContainerGroup(
                            'container1',
                            [
                                'sortOrder' => 10
                            ]
                        );

                            $container1->addChildren(
                                'price_font_size',
                                'text',
                                [
                                    'key'             => 'price_font_size',
                                    'sortOrder'       => 10,
                                    'templateOptions' => [
                                        'label' => __('Font Size')
                                    ]
                                ]
                            );

                            $container1->addChildren(
                                'price_font_weight',
                                'text',
                                [
                                    'key'             => 'price_font_weight',
                                    'sortOrder'       => 10,
                                    'templateOptions' => [
                                        'label' => __('Font Weight')
                                    ]
                                ]
                            );

                        $container2 = $normal->addContainerGroup(
                            'container2',
                            [
                                'sortOrder' => 20
                            ]
                        );

                            $container2->addChildren(
                                'price_color',
                                'color',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'price_color',
                                    'templateOptions' => [
                                        'label' => __('Price Color')
                                    ]
                                ]
                            );

                            $container2->addChildren(
                                'price_text_color',
                                'color',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'price_text_color',
                                    'templateOptions' => [
                                        'label' => __('Text Color')
                                    ]
                                ]
                            );

                            $container2->addChildren(
                                'price_box_background_color',
                                'color',
                                [
                                    'sortOrder'       => 30,
                                    'key'             => 'price_box_background_color',
                                    'templateOptions' => [
                                        'label' => __('Box Background Color')
                                    ]
                                ]
                            );

                    $featured = $tabs->addContainerGroup(
                        'featured',
                        [
                            'sortOrder'       => 20,
                            'templateOptions' => [
                                'label' => __('Featured')
                            ]
                        ]
                    );

                        $container1 = $featured->addContainerGroup(
                            'container1',
                            [
                                'sortOrder' => 10
                            ]
                        );

                            $container1->addChildren(
                                'price_featured_font_size',
                                'text',
                                [
                                    'key'             => 'price_featured_font_size',
                                    'sortOrder'       => 10,
                                    'templateOptions' => [
                                        'label' => __('Font Size')
                                    ]
                                ]
                            );

                            $container1->addChildren(
                                'price_featured_font_weight',
                                'text',
                                [
                                    'key'             => 'price_featured_font_weight',
                                    'sortOrder'       => 10,
                                    'templateOptions' => [
                                        'label' => __('Font Weight')
                                    ]
                                ]
                            );

                        $container2 = $featured->addContainerGroup(
                            'container2',
                            [
                                'sortOrder' => 20
                            ]
                        );

                            $container2->addChildren(
                                'price_featured_color',
                                'color',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'price_featured_color',
                                    'templateOptions' => [
                                        'label' => __('Price Color')
                                    ]
                                ]
                            );

                            $container2->addChildren(
                                'price_featured_text_color',
                                'color',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'price_featured_text_color',
                                    'templateOptions' => [
                                        'label' => __('Text Color')
                                    ]
                                ]
                            );

                            $container2->addChildren(
                                'price_box_featured_background_color',
                                'color',
                                [
                                    'sortOrder'       => 30,
                                    'key'             => 'price_box_featured_background_color',
                                    'templateOptions' => [
                                        'label' => __('Box Background Color')
                                    ]
                                ]
                            );

            $features = $tab->addContainer(
                'features_container',
                [
                    'sortOrder'       => 30,
                    'templateOptions' => [
                        'label'       => __('Features'),
                        'collapsible' => true
                    ]
                ]
            );

                $container1 = $features->addContainerGroup(
                    'container1',
                    [
                        'sortOrder' => 10
                    ]
                );

                    $container1->addChildren(
                        'features_font_size',
                        'text',
                        [
                            'key'             => 'features_font_size',
                            'sortOrder'       => 10,
                            'templateOptions' => [
                                'label' => __('Font Size')
                            ]
                        ]
                    );

                    $container1->addChildren(
                        'features_font_weight',
                        'text',
                        [
                            'key'             => 'features_font_weight',
                            'sortOrder'       => 20,
                            'templateOptions' => [
                                'label' => __('Font Weight')
                            ]
                        ]
                    );

                    $container1->addChildren(
                        'features_text_align',
                        'select',
                        [
                            'key'             => 'features_text_align',
                            'sortOrder'       => 30,
                            'templateOptions' => [
                                'label'   => __('Text Align'),
                                'options' => $this->getAlignOptions()
                            ]
                        ]
                    );

            $button = $tab->addContainer(
                'button_container',
                [
                    'sortOrder'       => 40,
                    'templateOptions' => [
                        'label'       => __('Button'),
                        'collapsible' => true
                    ]
                ]
            );

                $container2 = $button->addContainerGroup(
                    'container2',
                    [
                        'sortOrder' => 10
                    ]
                );

                    $container2->addChildren(
                        'button_font_size',
                        'text',
                        [
                            'key'             => 'button_font_size',
                            'sortOrder'       => 10,
                            'templateOptions' => [
                                'label' => __('Font Size')
                            ]
                        ]
                    );

                    $container2->addChildren(
                        'button_font_weight',
                        'text',
                        [
                            'key'             => 'button_font_weight',
                            'sortOrder'       => 10,
                            'templateOptions' => [
                                'label' => __('Font Weight')
                            ]
                        ]
                    );

                    $container2->addChildren(
                        'button_border_radius',
                        'number',
                        [
                            'key'             => 'button_border_radius',
                            'sortOrder'       => 30,
                            'templateOptions' => [
                                'label' => __('Border Radius')
                            ]
                        ]
                    );

                $colors = $button->addTab(
                    'button_colors',
                    [
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label' => __('Button Colors')
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

        return $tab;
    }

    /**
     * @return array[]
     */
    public function getTableType()
    {
        return [
            [
                'label' => 'Type1',
                'value' => 'type1'
            ],
            [
                'label' => 'Type2',
                'value' => 'type2'
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
                    'title'    => 'Standard',
                    'price'    => 19,
                    'currency' => '$',
                    'period'   => 'monthly',
                    'features' => [
                        [
                            'title' => '5 Projects'
                        ],
                        [
                            'title' => '5 GB Storage'
                        ],
                        [
                            'title' => 'Unlimited Users'
                        ],
                        [
                            'title' => '10 GB Bandwith'
                        ],
                        [
                            'title' => 'Support 24/7'
                        ]
                    ],
                    'button_text' => 'SIGN UP NOW!',
                    'button_link' => 'https://www.magezon.com/magezon-page-builder-for-magento-2.html'
                ],
                [
                    'title'    => 'Premium',
                    'price'    => 29,
                    'currency' => '$',
                    'period'   => 'monthly',
                    'features' => [
                        [
                            'title' => '10 Projects'
                        ],
                        [
                            'title' => '15 GB Storage'
                        ],
                        [
                            'title' => 'Unlimited Users'
                        ],
                        [
                            'title' => '20 GB Bandwith'
                        ],
                        [
                            'title' => 'Support 24/7'
                        ]
                    ],
                    'button_text' => 'SIGN UP NOW!',
                    'button_link' => 'https://www.magezon.com/magezon-page-builder-for-magento-2.html',
                ],
                [
                    'title'    => 'Professional',
                    'price'    => 39,
                    'currency' => '$',
                    'period'   => 'monthly',
                    'features' => [
                        [
                            'title' => '15 Projects'
                        ],
                        [
                            'title' => '30 GB Storage'
                        ],
                        [
                            'title' => 'Unlimited Users'
                        ],
                        [
                            'title' => '50 GB Bandwith'
                        ],
                        [
                            'title' => 'Support 24/7'
                        ]
                    ],
                    'button_text' => 'SIGN UP NOW!',
                    'button_link' => 'https://www.magezon.com/magezon-page-builder-for-magento-2.html',
                    'featured'    => true
                ],
                [
                    'title'    => 'Maximum',
                    'price'    => 49,
                    'currency' => '$',
                    'period'   => 'monthly',
                    'features' => [
                        [
                            'title' => '30 Projects'
                        ],
                        [
                            'title' => '100 GB Storage'
                        ],
                        [
                            'title' => 'Unlimited Users'
                        ],
                        [
                            'title' => '150 GB Bandwith'
                        ],
                        [
                            'title' => 'Support 24/7'
                        ]
                    ],
                    'button_text' => 'SIGN UP NOW!',
                    'button_link' => 'https://www.magezon.com/magezon-page-builder-for-magento-2.html'
                ],
                [
                    'title'    => 'Extreme',
                    'price'    => 59,
                    'currency' => '$',
                    'period'   => 'monthly',
                    'features' => [
                        [
                            'title' => 'Unlimited Projects'
                        ],
                        [
                            'title' => 'Unlimited Storage'
                        ],
                        [
                            'title' => 'Unlimited Users'
                        ],
                        [
                            'title' => 'Unlimited Bandwith'
                        ],
                        [
                            'title' => 'Support 24/7'
                        ]
                    ],
                    'button_text' => 'SIGN UP NOW!',
                    'button_link' => 'https://www.magezon.com/magezon-page-builder-for-magento-2.html'
                ]
            ]
        ];
    }
}
