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

class Slider extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareSlidesTab();
        $this->prepareCarouselTab();
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
                    'slider_height',
                    'number',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'slider_height',
                        'defaultValue'    => 625,
                        'templateOptions' => [
                            'label' => __('Slider Height')
                        ]
                    ]
                );

                $container1->addChildren(
                    'image_hover_effect',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'image_hover_effect',
                        'defaultValue'    => '',
                        'templateOptions' => [
                            'label'   => __('Image Hover Effect'),
                            'options' => $this->getHoverEffect()
                        ]
                    ]
                );

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareSlidesTab()
    {
        $tab = $this->addTab(
            'tab_slides',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Slides')
                ]
            ]
        );

            $items = $tab->addChildren(
                'slides',
                'dynamicRows',
                [
                    'key'             => 'items',
                    'sortOrder'       => 10,
                    'templateOptions' => [
                        'displayIndex' => true
                    ]
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
                        'background_type',
                        'select',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'background_type',
                            'defaultValue'    => 'image',
                            'className'       => 'mgz-width40',
                            'templateOptions' => [
                                'label'   => __('Background Type'),
                                'options' => $this->getBackgroundType()
                            ]
                        ]
                    );

                    $container1->addChildren(
                        'image',
                        'image',
                        [
                            'sortOrder'       => 20,
                            'key'             => 'image',
                            'templateOptions' => [
                                'label' => __('Image')
                            ],
                            'hideExpression' => 'model.background_type!="image"'
                        ]
                    );

                    $container1->addChildren(
                        'youtube_id',
                        'text',
                        [
                            'sortOrder'       => 20,
                            'key'             => 'youtube_id',
                            'templateOptions' => [
                                'label' => __('Youtube Video ID'),
                                'note'  => 'For example the Video ID for https://www.youtube.com/watch?v=<strong>HPan7HtIYOw</strong> is <strong>HPan7HtIYOw</strong>'
                            ],
                            'hideExpression' => 'model.background_type!="youtube"'
                        ]
                    );

                    $container1->addChildren(
                        'vimeo_id',
                        'text',
                        [
                            'sortOrder'       => 30,
                            'key'             => 'vimeo_id',
                            'templateOptions' => [
                                'label' => __('Vimeo Video ID'),
                                'note'  => 'For example the Video ID for https://player.vimeo.com/video/<strong>156767727</strong> is <strong>156767727</strong>'
                            ],
                            'hideExpression' => 'model.background_type!="vimeo"'
                        ]
                    );

                    $container1->addChildren(
                        'local_link',
                        'text',
                        [
                            'sortOrder'       => 30,
                            'key'             => 'local_link',
                            'templateOptions' => [
                                'label' => __('Local Video')
                            ],
                            'hideExpression' => 'model.background_type!="local"'
                        ]
                    );

                $container2 = $items->addContainer(
                    'container2',
                    [
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'collapsible' => true,
                            'label'       => __('Content')
                        ]
                    ]
                );

                    $container21 = $container2->addContainerGroup(
                        'container21',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $container21->addChildren(
                            'content_position',
                            'select',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'content_position',
                                'defaultValue'    => 'middle-center',
                                'templateOptions' => [
                                    'label'   => __('Content Position'),
                                    'options' => $this->getContentPosition()
                                ]
                            ]
                        );

                        $container21->addChildren(
                            'content_align',
                            'select',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'content_align',
                                'defaultValue'    => 'left',
                                'templateOptions' => [
                                    'label'   => __('Content Alignment'),
                                    'options' => $this->getAlignOptions()
                                ]
                            ]
                        );

                        $container21->addChildren(
                            'content_padding',
                            'number',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'content_padding',
                                'templateOptions' => [
                                    'label' => __('Content Padding')
                                ]
                            ]
                        );

                    $container22 = $container2->addContainerGroup(
                        'container22',
                        [
                            'templateOptions' => [
                                'sortOrder' => 20
                            ]
                        ]
                    );

                        $container22->addChildren(
                            'content_wrapper_width',
                            'number',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'content_wrapper_width',
                                'templateOptions' => [
                                    'label' => __('Content Wrapper Width')
                                ]
                            ]
                        );

                        $container22->addChildren(
                            'content_width',
                            'number',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'content_width',
                                'templateOptions' => [
                                    'label' => __('Content Width')
                                ]
                            ]
                        );

                $heading = $items->addContainer(
                    'heading_container',
                    [
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label'       => __('Heading'),
                            'collapsible' => true
                        ]
                    ]
                );

                    $heading->addChildren(
                        'heading',
                        'textarea',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'heading',
                            'defaultValue'    => 'This is a heading',
                            'templateOptions' => [
                                'label' => __('Text'),
                                'rows'  => 2
                            ]
                        ]
                    );

                    $container1 = $heading->addContainerGroup(
                        'container1',
                        [
                            'sortOrder'      => 20,
                            'hideExpression' => '!model.heading'
                        ]
                    );

                        $container1->addChildren(
                            'heading_type',
                            'select',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'heading_type',
                                'defaultValue'    => 'h2',
                                'templateOptions' => [
                                    'label'   => __('Type'),
                                    'options' => $this->getHeadingType()
                                ]
                            ]
                        );

                        $container1->addChildren(
                            'heading_animation',
                            'select',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'heading_animation',
                                'templateOptions' => [
                                    'label'         => __('Animation'),
                                    'builderConfig' => 'animationIn'
                                ]
                            ]
                        );

                        $container1->addChildren(
                            'heading_animation_delay',
                            'number',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'heading_animation_delay',
                                'templateOptions' => [
                                    'label' => __('Animation Delay(s)')
                                ]
                            ]
                        );

                    $container2 = $heading->addContainerGroup(
                        'container2',
                        [
                            'sortOrder'      => 30,
                            'hideExpression' => '!model.heading'
                        ]
                    );

                        $container2->addChildren(
                            'heading_font_size',
                            'number',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'heading_font_size',
                                'templateOptions' => [
                                    'label' => __('Font Size')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'heading_line_height',
                            'number',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'heading_line_height',
                                'templateOptions' => [
                                    'label' => __('Line Height')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'heading_font_weight',
                            'text',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'heading_font_weight',
                                'templateOptions' => [
                                    'label' => __('Font Weight')
                                ]
                            ]
                        );

                    $container3 = $heading->addContainerGroup(
                        'container3',
                        [
                            'sortOrder'      => 40,
                            'hideExpression' => '!model.heading'
                        ]
                    );

                        $container3->addChildren(
                            'heading_padding',
                            'text',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'heading_padding',
                                'templateOptions' => [
                                    'label' => __('Padding')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'heading_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'heading_color',
                                'templateOptions' => [
                                    'label' => __('Text Color')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'heading_bg_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'heading_bg_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                    $heading->addChildren(
                        'heading_distance',
                        'number',
                        [
                            'sortOrder'       => 50,
                            'key'             => 'heading_distance',
                            'templateOptions' => [
                                'label' => __('Distance')
                            ],
                            'hideExpression' => '!model.heading'
                        ]
                    );

                $caption1 = $items->addContainer(
                    'caption1_container',
                    [
                        'sortOrder'       => 70,
                        'templateOptions' => [
                            'label'       => __('Caption1'),
                            'collapsible' => true
                        ]
                    ]
                );

                    $caption1->addChildren(
                        'caption1',
                        'textarea',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'caption1',
                            'templateOptions' => [
                                'label' => __('Text'),
                                'rows'  => 2
                            ]
                        ]
                    );

                    $container1 = $caption1->addContainerGroup(
                        'container1',
                        [
                            'sortOrder'      => 20,
                            'hideExpression' => '!model.caption1'
                        ]
                    );

                        $container1->addChildren(
                            'caption1_type',
                            'select',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'caption1_type',
                                'defaultValue'    => 'h3',
                                'templateOptions' => [
                                    'label'   => __('Type'),
                                    'options' => $this->getHeadingType()
                                ]
                            ]
                        );

                        $container1->addChildren(
                            'caption1_animation',
                            'select',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'caption1_animation',
                                'templateOptions' => [
                                    'label'         => __('Animation'),
                                    'builderConfig' => 'animationIn'
                                ]
                            ]
                        );

                        $container1->addChildren(
                            'caption1_animation_delay',
                            'number',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'caption1_animation_delay',
                                'templateOptions' => [
                                    'label' => __('Animation Delay(s)')
                                ]
                            ]
                        );

                    $container2 = $caption1->addContainerGroup(
                        'container2',
                        [
                            'sortOrder'      => 30,
                            'hideExpression' => '!model.caption1'
                        ]
                    );

                        $container2->addChildren(
                            'caption1_font_size',
                            'number',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'caption1_font_size',
                                'templateOptions' => [
                                    'label' => __('Font Size')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'caption1_line_height',
                            'number',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'caption1_line_height',
                                'templateOptions' => [
                                    'label' => __('Line Height')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'caption1_font_weight',
                            'text',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'caption1_font_weight',
                                'templateOptions' => [
                                    'label' => __('Font Weight')
                                ]
                            ]
                        );

                    $container3 = $caption1->addContainerGroup(
                        'container3',
                        [
                            'sortOrder'      => 40,
                            'hideExpression' => '!model.caption1'
                        ]
                    );

                        $container3->addChildren(
                            'caption1_padding',
                            'text',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'caption1_padding',
                                'templateOptions' => [
                                    'label' => __('Padding')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'caption1_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'caption1_color',
                                'templateOptions' => [
                                    'label' => __('Text Color')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'caption1_bg_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'caption1_bg_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                    $caption1->addChildren(
                        'caption1_distance',
                        'number',
                        [
                            'sortOrder'       => 50,
                            'key'             => 'caption1_distance',
                            'templateOptions' => [
                                'label' => __('Distance')
                            ],
                            'hideExpression' => '!model.caption1'
                        ]
                    );

                $caption2 = $items->addContainer(
                    'caption2_container',
                    [
                        'sortOrder'       => 80,
                        'templateOptions' => [
                            'label'       => __('Caption2'),
                            'collapsible' => true
                        ]
                    ]
                );

                    $caption2->addChildren(
                        'caption2',
                        'textarea',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'caption2',
                            'templateOptions' => [
                                'label' => __('Text'),
                                'rows'  => 2
                            ]
                        ]
                    );

                    $container1 = $caption2->addContainerGroup(
                        'container1',
                        [
                            'sortOrder'      => 20,
                            'hideExpression' => '!model.caption2'
                        ]
                    );

                        $container1->addChildren(
                            'caption2_type',
                            'select',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'caption2_type',
                                'defaultValue'    => 'h3',
                                'templateOptions' => [
                                    'label'   => __('Type'),
                                    'options' => $this->getHeadingType()
                                ]
                            ]
                        );

                        $container1->addChildren(
                            'caption2_animation',
                            'select',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'caption2_animation',
                                'templateOptions' => [
                                    'label'         => __('Animation'),
                                    'builderConfig' => 'animationIn'
                                ]
                            ]
                        );

                        $container1->addChildren(
                            'caption2_animation_delay',
                            'number',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'caption2_animation_delay',
                                'templateOptions' => [
                                    'label' => __('Animation Delay(s)')
                                ]
                            ]
                        );

                    $container2 = $caption2->addContainerGroup(
                        'container2',
                        [
                            'sortOrder'      => 30,
                            'hideExpression' => '!model.caption2'
                        ]
                    );

                        $container2->addChildren(
                            'caption2_font_size',
                            'number',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'caption2_font_size',
                                'templateOptions' => [
                                    'label' => __('Font Size')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'caption2_line_height',
                            'number',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'caption2_line_height',
                                'templateOptions' => [
                                    'label' => __('Line Height')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'caption2_font_weight',
                            'text',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'caption2_font_weight',
                                'templateOptions' => [
                                    'label' => __('Font Weight')
                                ]
                            ]
                        );

                    $container3 = $caption2->addContainerGroup(
                        'container3',
                        [
                            'sortOrder'      => 40,
                            'hideExpression' => '!model.caption2'
                        ]
                    );

                        $container3->addChildren(
                            'caption2_padding',
                            'text',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'caption2_padding',
                                'templateOptions' => [
                                    'label' => __('Padding')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'caption2_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'caption2_color',
                                'templateOptions' => [
                                    'label' => __('Text Color')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'caption2_bg_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'caption2_bg_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                    $caption2->addChildren(
                        'caption2_distance',
                        'number',
                        [
                            'sortOrder'       => 50,
                            'key'             => 'caption2_distance',
                            'templateOptions' => [
                                'label' => __('Distance')
                            ],
                            'hideExpression' => '!model.caption2'
                        ]
                    );

                $link = $items->addContainer(
                    'link_container',
                    [
                        'sortOrder'       => 80,
                        'templateOptions' => [
                            'label'       => __('Slide Link'),
                            'collapsible' => true
                        ]
                    ]
                );

                    $link->addChildren(
                        'link_type',
                        'select',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'link_type',
                            'defaultValue'    => 'full',
                            'templateOptions' => [
                                'label'   => __('Slide Link Type'),
                                'options' => $this->getSlideLinkType()
                            ]
                        ]
                    );

                    $link->addChildren(
                        'slide_link',
                        'link',
                        [
                            'sortOrder'       => 20,
                            'key'             => 'slide_link',
                            'templateOptions' => [
                                'label' => __('Slide Link')
                            ],
                            'hideExpression' => 'model.link_type!="full"'
                        ]
                    );

                    $button1 = $link->addContainer(
                        'button1_container',
                        [
                            'sortOrder'       => 30,
                            'templateOptions' => [
                                'label'       => __('Button1'),
                                'collapsible' => true
                            ],
                            'hideExpression' => 'model.link_type!="button"'
                        ]
                    );

                        $container1 = $button1->addContainerGroup(
                            'container1',
                            [
                                'sortOrder' => 10
                            ]
                        );

                            $container1->addChildren(
                                'button1',
                                'text',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button1',
                                    'defaultValue'    => 'Button1 Text',
                                    'templateOptions' => [
                                        'label' => __('Text')
                                    ]
                                ]
                            );

                            $container1->addChildren(
                                'button1_animation',
                                'select',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button1_animation',
                                    'templateOptions' => [
                                        'label'         => __('Animation'),
                                        'builderConfig' => 'animationIn'
                                    ]
                                ]
                            );

                            $container1->addChildren(
                                'button1_animation_delay',
                                'number',
                                [
                                    'sortOrder'       => 30,
                                    'key'             => 'button1_animation_delay',
                                    'templateOptions' => [
                                        'label' => __('Animation Delay(s)')
                                    ]
                                ]
                            );

                        $button1->addChildren(
                            'button1_link',
                            'link',
                            [
                                'sortOrder'       => 15,
                                'key'             => 'button1_link',
                                'templateOptions' => [
                                    'label' => __('Link')
                                ],
                                'hideExpression' => '!model.button1'
                            ]
                        );

                        $container2 = $button1->addContainerGroup(
                            'container2',
                            [
                                'sortOrder'      => 20,
                                'hideExpression' => '!model.button1'
                            ]
                        );

                            $container2->addChildren(
                                'button1_style',
                                'select',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button1_style',
                                    'defaultValue'    => 'flat',
                                    'templateOptions' => [
                                        'label'   => __('Style'),
                                        'options' => $this->getButtonStyle()
                                    ]
                                ]
                            );

                            $container2->addChildren(
                                'button1_size',
                                'select',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button1_size',
                                    'defaultValue'    => 'lg',
                                    'templateOptions' => [
                                        'label'   => __('Size'),
                                        'options' => $this->getSizeList()
                                    ]
                                ]
                            );

                        $container3 = $button1->addContainerGroup(
                            'container3',
                            [
                                'sortOrder'      => 30,
                                'hideExpression' => '!model.button1'
                            ]
                        );

                            $container3->addChildren(
                                'button1_font_size',
                                'number',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button1_font_size',
                                    'templateOptions' => [
                                        'label' => __('Font Size')
                                    ]
                                ]
                            );

                            $container3->addChildren(
                                'button1_line_height',
                                'number',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button1_line_height',
                                    'templateOptions' => [
                                        'label' => __('Line Height')
                                    ]
                                ]
                            );

                            $container3->addChildren(
                                'button1_font_weight',
                                'text',
                                [
                                    'sortOrder'       => 30,
                                    'key'             => 'button1_font_weight',
                                    'templateOptions' => [
                                        'label' => __('Font Weight')
                                    ]
                                ]
                            );

                        $container4 = $button1->addContainerGroup(
                            'container4',
                            [
                                'sortOrder'      => 40,
                                'hideExpression' => '!model.button1'
                            ]
                        );

                            $container4->addChildren(
                                'button1_border_width',
                                'text',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button1_border_width',
                                    'templateOptions' => [
                                        'label' => __('Border Width')
                                    ]
                                ]
                            );

                            $container4->addChildren(
                                'button1_border_radius',
                                'text',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button1_border_radius',
                                    'templateOptions' => [
                                        'label' => __('Border Radius')
                                    ]
                                ]
                            );

                            $container4->addChildren(
                                'button1_border_style',
                                'select',
                                [
                                    'key'             => 'button1_border_style',
                                    'sortOrder'       => 30,
                                    'defaultValue'    => 'solid',
                                    'templateOptions' => [
                                        'label'   => __('Border Style'),
                                        'options' => $this->getBorderStyle()
                                    ]
                                ]
                            );

                        $container5 = $button1->addContainerGroup(
                            'container5',
                            [
                                'sortOrder'      => 50,
                                'hideExpression' => '!model.button1'
                            ]
                        );

                            $container5->addChildren(
                                'button1_color',
                                'color',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button1_color',
                                    'templateOptions' => [
                                        'label' => __('Text Color')
                                    ]
                                ]
                            );

                            $container5->addChildren(
                                'button1_bg_color',
                                'color',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button1_bg_color',
                                    'templateOptions' => [
                                        'label' => __('Background Color')
                                    ]
                                ]
                            );

                            $container5->addChildren(
                                'button1_border_color',
                                'color',
                                [
                                    'sortOrder'       => 30,
                                    'key'             => 'button1_border_color',
                                    'templateOptions' => [
                                        'label' => __('Border Color')
                                    ]
                                ]
                            );

                        $container6 = $button1->addContainerGroup(
                            'container6',
                            [
                                'sortOrder'      => 60,
                                'hideExpression' => '!model.button1'
                            ]
                        );

                            $container6->addChildren(
                                'button1_hover_color',
                                'color',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button1_hover_color',
                                    'templateOptions' => [
                                        'label' => __('Hover Text Color')
                                    ]
                                ]
                            );

                            $container6->addChildren(
                                'button1_hover_bg_color',
                                'color',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button1_hover_bg_color',
                                    'templateOptions' => [
                                        'label' => __('Hover Background Color')
                                    ]
                                ]
                            );

                            $container6->addChildren(
                                'button1_hover_border_color',
                                'color',
                                [
                                    'sortOrder'       => 30,
                                    'key'             => 'button1_hover_border_color',
                                    'templateOptions' => [
                                        'label' => __('Hover Border Color')
                                    ]
                                ]
                            );

                    $button2 = $link->addContainer(
                        'button2_container',
                        [
                            'sortOrder'       => 40,
                            'templateOptions' => [
                                'label'       => __('Button2'),
                                'collapsible' => true
                            ],
                            'hideExpression' => 'model.link_type!="button"'
                        ]
                    );

                        $container1 = $button2->addContainerGroup(
                            'container1',
                            [
                                'sortOrder' => 10
                            ]
                        );

                            $container1->addChildren(
                                'button2',
                                'text',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button2',
                                    'templateOptions' => [
                                        'label' => __('Text')
                                    ]
                                ]
                            );

                            $container1->addChildren(
                                'button2_animation',
                                'select',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button2_animation',
                                    'templateOptions' => [
                                        'label'         => __('Animation'),
                                        'builderConfig' => 'animationIn'
                                    ]
                                ]
                            );

                            $container1->addChildren(
                                'button2_animation_delay',
                                'number',
                                [
                                    'sortOrder'       => 30,
                                    'key'             => 'button2_animation_delay',
                                    'templateOptions' => [
                                        'label' => __('Animation Delay(s)')
                                    ]
                                ]
                            );

                        $button2->addChildren(
                            'button2_link',
                            'link',
                            [
                                'sortOrder'       => 15,
                                'key'             => 'button2_link',
                                'templateOptions' => [
                                    'label' => __('Link')
                                ],
                                'hideExpression' => '!model.button2'
                            ]
                        );

                        $container2 = $button2->addContainerGroup(
                            'container2',
                            [
                                'sortOrder'      => 20,
                                'hideExpression' => '!model.button2'
                            ]
                        );

                            $container2->addChildren(
                                'button2_style',
                                'select',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button2_style',
                                    'defaultValue'    => 'flat',
                                    'templateOptions' => [
                                        'label'   => __('Style'),
                                        'options' => $this->getButtonStyle()
                                    ]
                                ]
                            );

                            $container2->addChildren(
                                'button2_size',
                                'select',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button2_size',
                                    'defaultValue'    => 'lg',
                                    'templateOptions' => [
                                        'label'   => __('Size'),
                                        'options' => $this->getSizeList()
                                    ]
                                ]
                            );

                        $container3 = $button2->addContainerGroup(
                            'container3',
                            [
                                'sortOrder'      => 30,
                                'hideExpression' => '!model.button2'
                            ]
                        );

                            $container3->addChildren(
                                'button2_font_size',
                                'number',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button2_font_size',
                                    'templateOptions' => [
                                        'label' => __('Font Size')
                                    ]
                                ]
                            );

                            $container3->addChildren(
                                'button2_line_height',
                                'number',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button2_line_height',
                                    'templateOptions' => [
                                        'label' => __('Line Height')
                                    ]
                                ]
                            );

                            $container3->addChildren(
                                'button2_font_weight',
                                'text',
                                [
                                    'sortOrder'       => 30,
                                    'key'             => 'button2_font_weight',
                                    'templateOptions' => [
                                        'label' => __('Font Weight')
                                    ]
                                ]
                            );

                        $container4 = $button2->addContainerGroup(
                            'container4',
                            [
                                'sortOrder'      => 40,
                                'hideExpression' => '!model.button2'
                            ]
                        );

                            $container4->addChildren(
                                'button2_border_width',
                                'text',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button2_border_width',
                                    'templateOptions' => [
                                        'label' => __('Border Width')
                                    ]
                                ]
                            );

                            $container4->addChildren(
                                'button2_border_radius',
                                'text',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button2_border_radius',
                                    'templateOptions' => [
                                        'label' => __('Border Radius')
                                    ]
                                ]
                            );

                            $container4->addChildren(
                                'button2_border_style',
                                'select',
                                [
                                    'key'             => 'button2_border_style',
                                    'sortOrder'       => 30,
                                    'defaultValue'    => 'solid',
                                    'templateOptions' => [
                                        'label'   => __('Border Style'),
                                        'options' => $this->getBorderStyle()
                                    ]
                                ]
                            );

                        $container5 = $button2->addContainerGroup(
                            'container5',
                            [
                                'sortOrder'      => 50,
                                'hideExpression' => '!model.button2'
                            ]
                        );

                            $container5->addChildren(
                                'button2_color',
                                'color',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button2_color',
                                    'templateOptions' => [
                                        'label' => __('Text Color')
                                    ]
                                ]
                            );

                            $container5->addChildren(
                                'button2_bg_color',
                                'color',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button2_bg_color',
                                    'templateOptions' => [
                                        'label' => __('Background Color')
                                    ]
                                ]
                            );

                            $container5->addChildren(
                                'button2_border_color',
                                'color',
                                [
                                    'sortOrder'       => 30,
                                    'key'             => 'button2_border_color',
                                    'templateOptions' => [
                                        'label' => __('Border Color')
                                    ]
                                ]
                            );

                        $container6 = $button2->addContainerGroup(
                            'container6',
                            [
                                'sortOrder'      => 60,
                                'hideExpression' => '!model.button2'
                            ]
                        );

                            $container6->addChildren(
                                'button2_hover_color',
                                'color',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'button2_hover_color',
                                    'templateOptions' => [
                                        'label' => __('Hover Text Color')
                                    ]
                                ]
                            );

                            $container6->addChildren(
                                'button2_hover_bg_color',
                                'color',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'button2_hover_bg_color',
                                    'templateOptions' => [
                                        'label' => __('Hover Background Color')
                                    ]
                                ]
                            );

                            $container6->addChildren(
                                'button2_hover_border_color',
                                'color',
                                [
                                    'sortOrder'       => 30,
                                    'key'             => 'button2_hover_border_color',
                                    'templateOptions' => [
                                        'label' => __('Hover Border Color')
                                    ]
                                ]
                            );

                $video = $items->addContainerGroup(
                    'video_options',
                    [
                        'sortOrder'       => 90,
                        'templateOptions' => [
                            'label'       => __('Video Options'),
                            'collapsible' => true
                        ]
                    ]
                );

                    $video->addChildren(
                        'autoplay',
                        'toggle',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'autoplay',
                            'templateOptions' => [
                                'label' => __('Autoplay')
                            ]
                        ]
                    );

                    $video->addChildren(
                        'mute',
                        'toggle',
                        [
                            'sortOrder'       => 20,
                            'key'             => 'mute',
                            'templateOptions' => [
                                'label' => __('Mute')
                            ]
                        ]
                    );

                    $video->addChildren(
                        'loop',
                        'toggle',
                        [
                            'sortOrder'       => 30,
                            'key'             => 'loop',
                            'templateOptions' => [
                                'label' => __('Loop')
                            ]
                        ]
                    );

                    $video->addChildren(
                        'player_controls',
                        'toggle',
                        [
                            'sortOrder'       => 40,
                            'key'             => 'controls',
                            'defaultValue'    => true,
                            'templateOptions' => [
                                'label'          => __('Player Controls'),
                                'hideExpression' => 'model.video_type!="local"'
                            ]
                        ]
                    );

                $container4 = $items->addContainerGroup(
                    'container4',
                    [
                        'sortOrder' => 100
                    ]
                );

                    $container4->addChildren(
                        'delete',
                        'actionDelete',
                        [
                            'sortOrder' => 10,
                            'className' => 'mgz-width10'
                        ]
                    );

                    $container4->addChildren(
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

        return $tab;
    }
    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareCarouselTab($sortOrder = 80)
    {
        $carousel = $this->addTab(
            'tab_carousel',
            [
                'sortOrder'       => $sortOrder,
                'templateOptions' => [
                    'label' => __('Carousel Options')
                ]
            ]
        );

            $colors = $carousel->addTab(
                'colors',
                [
                    'sortOrder'       => 10,
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
                            'color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'owl_color',
                                'templateOptions' => [
                                    'label' => __('Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'owl_background_color',
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

                    $color1 = $hover->addContainerGroup(
                        'color1',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $color1->addChildren(
                            'hover_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'owl_hover_color',
                                'templateOptions' => [
                                    'label' => __('Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'hover_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'owl_hover_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
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

                    $color1 = $active->addContainerGroup(
                        'color1',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $color1->addChildren(
                            'active_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'owl_active_color',
                                'templateOptions' => [
                                    'label' => __('Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'active_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'owl_active_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

            $container3 = $carousel->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 40
                ]
            );

                $container3->addChildren(
                    'nav',
                    'toggle',
                    [
                        'key'             => 'owl_nav',
                        'sortOrder'       => 10,
                        'defaultValue'    => false,
                        'templateOptions' => [
                            'label' => __('Navigation Buttons')
                        ]
                    ]
                );

                $container3->addChildren(
                    'nav_position',
                    'select',
                    [
                        'key'             => 'owl_nav_position',
                        'sortOrder'       => 20,
                        'defaultValue'    => 'center_split',
                        'templateOptions' => [
                            'label'   => __('Navigation Position'),
                            'options' => $this->getNavigationPosition()
                        ]
                    ]
                );

                $container3->addChildren(
                    'nav_size',
                    'select',
                    [
                        'key'             => 'owl_nav_size',
                        'sortOrder'       => 30,
                        'defaultValue'    => 'normal',
                        'templateOptions' => [
                            'label'   => __('Navigation Size'),
                            'options' => $this->getNavigationSize()
                        ]
                    ]
                );

            $container4 = $carousel->addContainerGroup(
                'container4',
                [
                    'sortOrder' => 50
                ]
            );

                $container4->addChildren(
                    'dots',
                    'toggle',
                    [
                        'key'             => 'owl_dots',
                        'sortOrder'       => 10,
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Dots Navigation')
                        ]
                    ]
                );

                $container4->addChildren(
                    'dots_insie',
                    'toggle',
                    [
                        'key'             => 'owl_dots_insie',
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label' => __('Dots Inside')
                        ],
                        'expressionProperties' => [
                            'templateOptions.disabled' => '!model.owl_dots'
                        ]
                    ]
                );

                $container4->addChildren(
                    'dots_speed',
                    'number',
                    [
                        'key'             => 'owl_dots_speed',
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label' => __('Dots Speed')
                        ]
                    ]
                );

            $container5 = $carousel->addContainerGroup(
                'container5',
                [
                    'sortOrder' => 60
                ]
            );

                $container5->addChildren(
                    'lazyload',
                    'toggle',
                    [
                        'key'             => 'owl_lazyload',
                        'sortOrder'       => 10,
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Lazyload')
                        ]
                    ]
                );

                $container5->addChildren(
                    'loop',
                    'toggle',
                    [
                        'key'             => 'owl_loop',
                        'sortOrder'       => 20,
                        'defaultValue'    => false,
                        'templateOptions' => [
                            'label' => __('Loop')
                        ]
                    ]
                );

                $container5->addChildren(
                    'margin',
                    'number',
                    [
                        'key'             => 'owl_margin',
                        'sortOrder'       => 30,
                        'defaultValue'    => '0',
                        'templateOptions' => [
                            'label' => __('Margin'),
                            'note'  => __('margin-right(px) on item.')
                        ]
                    ]
                );

            $container6 = $carousel->addContainerGroup(
                'container6',
                [
                    'sortOrder' => 70
                ]
            );

                $container6->addChildren(
                    'autoplay',
                    'toggle',
                    [
                        'key'             => 'owl_autoplay',
                        'sortOrder'       => 10,
                        'templateOptions' => [
                            'label' => __('Auto Play')
                        ]
                    ]
                );

                $container6->addChildren(
                    'autoplay_hover_pause',
                    'toggle',
                    [
                        'key'             => 'owl_autoplay_hover_pause',
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label' => __('Pause on Mouse Hover')
                        ]
                    ]
                );

                $container6->addChildren(
                    'autoplay_timeout',
                    'text',
                    [
                        'key'             => 'owl_autoplay_timeout',
                        'defaultValue'    => '5000',
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label' => __('Auto Play Timeout')
                        ]
                    ]
                );

            $container7 = $carousel->addContainerGroup(
                'container7',
                [
                    'sortOrder' => 80
                ]
            );

                $container7->addChildren(
                    'owl_autoplay_speed',
                    'text',
                    [
                        'key'             => 'owl_autoplay_speed',
                        'sortOrder'       => 10,
                        'templateOptions' => [
                            'label' => __('Auto Play Speed')
                        ]
                    ]
                );

                $container7->addChildren(
                    'stage_padding',
                    'number',
                    [
                        'key'             => 'owl_stage_padding',
                        'sortOrder'       => 20,
                        'defaultValue'    => 0,
                        'templateOptions' => [
                            'label' => __('Stage Padding')
                        ]
                    ]
                );

                $container7->addChildren(
                    'margin',
                    'number',
                    [
                        'key'             => 'owl_margin',
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label' => __('Margin'),
                            'note'  => __('margin-right(px) on item.')
                        ]
                    ]
                );

            $carousel->addChildren(
                'rtl',
                'toggle',
                [
                    'key'             => 'owl_rtl',
                    'sortOrder'       => 90,
                    'templateOptions' => [
                        'label' => __('Right To Left')
                    ]
                ]
            );

            $carousel->addChildren(
                'owl_animate_in',
                'select',
                [
                    'sortOrder'       => 100,
                    'key'             => 'owl_animate_in',
                    'className'       => 'mgz-inner-widthauto',
                    'templateOptions' => [
                        'templateUrl' => 'Magezon_Builder/js/templates/form/element/animation-style.html',
                        'element'     => 'Magezon_Builder/js/form/element/animation-in',
                        'label'       => __('Animation In')
                    ]
                ]
            );

            $carousel->addChildren(
                'owl_animate_out',
                'select',
                [
                    'sortOrder'       => 110,
                    'key'             => 'owl_animate_out',
                    'className'       => 'mgz-inner-widthauto',
                    'templateOptions' => [
                        'templateUrl' => 'Magezon_Builder/js/templates/form/element/animation-style.html',
                        'element'     => 'Magezon_Builder/js/form/element/animation-out',
                        'label'       => __('Animation Out')
                    ]
                ]
            );

        return $carousel;
    }

    /**
     * @return array
     */
    public function getCaptionType()
    {
        $headingType = parent::getHeadingType();
        $headingType[] = [
            'label' => 'Div',
            'value' => 'div'
        ];
        return $headingType;
    }

    /**
     * @return array
     */
    public function getBackgroundType()
    {
        return [
            [
                'label' => __('Image'),
                'value' => 'image'
            ],
            [
                'label' => __('Youtube'),
                'value' => 'youtube'
            ],
            [
                'label' => __('Vimeo'),
                'value' => 'vimeo'
            ],
            [
                'label' => __('Local'),
                'value' => 'local'
            ]
        ];
    }

    /**
     * @return array
     */
    public function getSlideLinkType()
    {
        return [
            [
                'label' => __('Button'),
                'value' => 'button'
            ],
            [
                'label' => __('Full Slide'),
                'value' => 'full'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getVideoAspectRatio()
    {
        return [
            [
                'label' => '3:2',
                'value' => '32'
            ],
            [
                'label' => '4:3',
                'value' => '43'
            ],
            [
                'label' => '16:9',
                'value' => '169'
            ],
            [
                'label' => '21:9',
                'value' => '219'
            ]
        ];
    }

    /**
     * @return array
     */
    public function getDefaultValues()
    {
        return [
            'items' => [
                [
                    'background_type' => 'image',
                    'image'           => 'mgzbuilder/no_image2.png',
                    'heading'         => 'Slide1',
                    'heading_type'    => 'h2',
                    'position'        => 1
                ],
                [
                    'background_type' => 'image',
                    'image'           => 'mgzbuilder/no_image2.png',
                    'heading'         => 'Slide2',
                    'heading_type'    => 'h2',
                    'position'        => 2
                ],
                [
                    'background_type' => 'image',
                    'image'           => 'mgzbuilder/no_image2.png',
                    'heading'         => 'Slide3',
                    'heading_type'    => 'h2',
                    'position'        => 3
                ],
                [
                    'background_type' => 'image',
                    'image'           => 'mgzbuilder/no_image2.png',
                    'heading'         => 'Slide4',
                    'heading_type'    => 'h2',
                    'position'        => 4
                ],
                [
                    'background_type' => 'image',
                    'image'           => 'mgzbuilder/no_image2.png',
                    'heading'         => 'Slide5',
                    'heading_type'    => 'h2',
                    'position'        => 5
                ]
            ]
        ];
    }
}
