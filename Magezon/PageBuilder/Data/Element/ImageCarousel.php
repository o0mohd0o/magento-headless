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

class ImageCarousel extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareImagesTab();
        $this->prepareImageTab();
        $this->prepareCarouselTab();
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

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareImagesTab()
    {
        $images = $this->addTab(
            'images',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Images')
                ]
            ]
        );

            $images->addChildren(
                'onclick',
                'select',
                [
                    'sortOrder'       => 10,
                    'key'             => 'onclick',
                    'defaultValue'    => '',
                    'templateOptions' => [
                        'controlInline'    => true,
                        'controlAutoWidth' => true,
                        'label'            => __('On click action'),
                        'options'          => $this->getOnclickOptions(),
                        'element'          => 'Magezon_Builder/js/form/element/dependency',
                        'groupsConfig'     => [
                            'magnific' => [
                                'popup_image',
                                'popup_title',
                                'video_map'
                            ],
                            'custom_link' => [
                                'custom_link'
                            ]
                        ],
                        'target' => ['items']
                    ]
                ]
            );

            $items = $images->addChildren(
                'items',
                'dynamicRows',
                [
                    'key'       => 'items',
                    'className' => 'mgz-image-carousel-items mgz-editor-simple',
                    'sortOrder' => 20
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
                            'className'       => 'mgz-width20',
                            'templateOptions' => [
                                'sortOrder' => 10
                            ]
                        ]
                    );

                        $container2->addChildren(
                            'image',
                            'image',
                            [
                                'key'             => 'image',
                                'sortOrder'       => 10,
                                'templateOptions' => [
                                    'label' => __('Image')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'popup_image',
                            'image',
                            [
                                'key'             => 'popup_image',
                                'sortOrder'       => 20,
                                'templateOptions' => [
                                    'label' => __('Popup Image')
                                ]
                            ]
                        );

                    $container3 = $container1->addContainer(
                        'container3',
                        [
                            'className'       => 'mgz-width80',
                            'templateOptions' => [
                                'sortOrder' => 10
                            ]
                        ]
                    );

                        $container3->addChildren(
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

                        $container3->addChildren(
                            'description',
                            'textarea',
                            [
                                'key'             => 'description',
                                'sortOrder'       => 20,
                                'templateOptions' => [
                                    'label'   => __('Description'),
                                    'wysiwyg' => [
                                        'height' => '50px'
                                    ]
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'popup_title',
                            'textarea',
                            [
                                'key'             => 'popup_title',
                                'sortOrder'       => 30,
                                'templateOptions' => [
                                    'label'   => __('Popup Title'),
                                    'wysiwyg' => [
                                        'height' => '50px'
                                    ]
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'custom_link',
                            'link',
                            [
                                'key'             => 'custom_link',
                                'sortOrder'       => 40,
                                'templateOptions' => [
                                    'label' => __('Custom Link')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'video_map',
                            'text',
                            [
                                'key'             => 'video_map',
                                'sortOrder'       => 40,
                                'templateOptions' => [
                                    'label' => __('Video or Map')
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

        return $images;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareImageTab()
    {
        $image = $this->addTab(
            'image',
            [
                'sortOrder'       => 60,
                'templateOptions' => [
                    'label' => __('Image')
                ]
            ]
        );

            $container1 = $image->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 10
                ]
            );
                $container1->addChildren(
                    'image_size',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'image_size',
                        'templateOptions' => [
                            'label' => __('Image Size')
                        ]
                    ]
                );

                $container1->addChildren(
                    'hover_effect',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'hover_effect',
                        'defaultValue'    => '',
                        'templateOptions' => [
                            'label'   => __('Hover Effect'),
                            'options' => $this->getHoverEffect()
                        ]
                    ]
                );

            $container2 = $image->addContainerGroup(
                'container2',
                [
                    'sortOrder' => 20
                ]
            );

                $container2->addChildren(
                    'image_border_style',
                    'select',
                    [
                        'key'             => 'image_border_style',
                        'sortOrder'       => 10,
                        'defaultValue'    => 'none',
                        'templateOptions' => [
                            'label'   => __('Border Style'),
                            'options' => $this->getBorderStyle()
                        ]
                    ]
                );

                $container2->addChildren(
                    'image_border_width',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'image_border_width',
                        'templateOptions' => [
                            'label' => __('Border Width')
                        ]
                    ]
                );

            $container3 = $image->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 30
                ]
            );

                $container3->addChildren(
                    'image_border_radius',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'image_border_radius',
                        'templateOptions' => [
                            'label' => __('Border Radius')
                        ]
                    ]
                );

                $container3->addChildren(
                    'image_border_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'defaultValue'    => '#e9eaee',
                        'key'             => 'image_border_color',
                        'templateOptions' => [
                            'label' => __('Border Color')
                        ]
                    ]
                );

            $container4 = $image->addContainerGroup(
                'container4',
                [
                    'sortOrder' => 40
                ]
            );

                $positions = $this->getContentPosition();
                array_unshift($positions, ['label' => 'Below Image', 'value' => 'below']);
                array_unshift($positions, ['label' => 'None', 'value' => 'none']);
                $container4->addChildren(
                    'content_position',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'content_position',
                        'defaultValue'    => 'middle-center',
                        'templateOptions' => [
                            'label'   => __('Content Position'),
                            'options' => $positions
                        ]
                    ]
                );

                $container4->addChildren(
                    'content_padding',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'content_padding',
                        'defaultValue'    => '10px 20px',
                        'templateOptions' => [
                            'label' => __('Content Padding')
                        ]
                    ]
                );

            $container5 = $image->addContainerGroup(
                'container5',
                [
                    'sortOrder' => 50
                ]
            );

                $container5->addChildren(
                    'display_on_hover',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'display_on_hover',
                        'templateOptions' => [
                            'label' => __('Display Content on Hover')
                        ]
                    ]
                );

                $container5->addChildren(
                    'content_fullwidth',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'content_fullwidth',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Content Fullwidth')
                        ]
                    ]
                );

            $container6 = $image->addContainerGroup(
                'container6',
                [
                    'sortOrder' => 60
                ]
            );

                $container6->addChildren(
                    'content_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'content_color',
                        'defaultValue'    => '#FFF',
                        'templateOptions' => [
                            'label' => __('Content Color')
                        ]
                    ]
                );

                $container6->addChildren(
                    'content_background',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'content_background',
                        'defaultValue'    => 'rgba(10,10,10,0.6)',
                        'templateOptions' => [
                            'label' => __('Content Background')
                        ]
                    ]
                );

            $container7 = $image->addContainerGroup(
                'container7',
                [
                    'sortOrder' => 70
                ]
            );

                $container7->addChildren(
                    'title_font_size',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'title_font_size',
                        'defaultValue'    => '16px',
                        'templateOptions' => [
                            'label' => __('Title Font Size')
                        ]
                    ]
                );

                $container7->addChildren(
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

            $container8 = $image->addContainerGroup(
                'container8',
                [
                    'sortOrder' => 80
                ]
            );

                $container8->addChildren(
                    'description_font_size',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'description_font_size',
                        'templateOptions' => [
                            'label' => __('Description Font Size')
                        ]
                    ]
                );

                $container8->addChildren(
                    'description_font_weight',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'description_font_weight',
                        'templateOptions' => [
                            'label' => __('Description Font Weight')
                        ]
                    ]
                );

            $container9 = $image->addContainerGroup(
                'container9',
                [
                    'sortOrder' => 90
                ]
            );

                $container9->addChildren(
                    'overlay_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'overlay_color',
                        'templateOptions' => [
                            'label' => __('Overlay Color')
                        ]
                    ]
                );

        return $image;
    }

    /**
     * @return array
     */
    public function getOnclickOptions()
    {
        return [
            [
                'label' => __('None'),
                'value' => ''
            ],
            [
                'label' => __('Open Magnific Popup'),
                'value' => 'magnific'
            ],
            [
                'label' => __('Open Custom Link'),
                'value' => 'custom_link'
            ]
        ];
    }

    /**
     * @return array
     */
    public function getDefaultValues()
    {
        return [
            'owl_item_xl'   => 5,
            'owl_item_lg'   => 4,
            'owl_item_md'   => 3,
            'owl_item_sm'   => 2,
            'owl_item_xs'   => 1,
            'owl_dots'      => false,
            'owl_nav'       => true,
            'owl_loop'      => true,
            'owl_margin'    => 10,
            'owl_nav_size'  => 'small',
            'items'         => [
                [
                    'image' => 'mgzbuilder/no_image.png'
                ],
                [
                    'image' => 'mgzbuilder/no_image.png'
                ],
                [
                    'image' => 'mgzbuilder/no_image.png'
                ],
                [
                    'image' => 'mgzbuilder/no_image.png'
                ],
                [
                    'image' => 'mgzbuilder/no_image.png'
                ]
            ]
        ];
    }
}
