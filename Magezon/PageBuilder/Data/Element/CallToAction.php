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

class CallToAction extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareStyleTab();
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
                    'title',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'title',
                        'defaultValue'    => 'This is the title',
                        'templateOptions' => [
                            'label' => __('Title')
                        ]
                    ]
                );

                $container1->addChildren(
                    'title_type',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'title_type',
                        'className'       => 'mgz-width30',
                        'defaultValue'    => 'h2',
                        'templateOptions' => [
                            'label'   => __('Title HTML Tag'),
                            'options' => $this->getHeadingType()
                        ]
                    ]
                );

            $general->addChildren(
                'description',
                'editor',
                [
                    'sortOrder'       => 20,
                    'key'             => 'description',
                    'defaultValue'    => 'Click edit button to change this text. Lorem ipsum dolor sit amet consectetur adipiscing elit dolor',
                    'templateOptions' => [
                        'label'   => __('Description'),
                        'wysiwyg' => [
                            'height' => '300px'
                        ]
                    ]
                ]
            );

            $container2 = $general->addContainerGroup(
                'container2',
                [
                    'sortOrder' => 30
                ]
            );

                $container2->addChildren(
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

                $container2->addChildren(
                    'align',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'align',
                        'templateOptions' => [
                            'label'   => __('Content Alignment'),
                            'options' => $this->getAlignOptions()
                        ]
                    ]
                );

                $container2->addChildren(
                    'content_padding',
                    'text',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'content_padding',
                        'templateOptions' => [
                            'label' => __('Content Padding')
                        ]
                    ]
                );

            $container3 = $general->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 40
                ]
            );

                $container3->addChildren(
                    'content_hover_animation',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'content_hover_animation',
                        'defaultValue'    => 'grow',
                        'templateOptions' => [
                            'label'   => __('Content Hover Animation'),
                            'options' => $this->getContentAnimation()
                        ]
                    ]
                );

                $container3->addChildren(
                    'content_animation_duration',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'content_animation_duration',
                        'defaultValue'    => 1000,
                        'templateOptions' => [
                            'label' => __('Animation Duration (ms)')
                        ]
                    ]
                );

                $container3->addChildren(
                    'sequenced_animation',
                    'toggle',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'sequenced_animation',
                        'templateOptions' => [
                            'label' => __('Sequenced Animation')
                        ]
                    ]
                );

            $container4 = $general->addContainerGroup(
                'container4',
                [
                    'sortOrder' => 50
                ]
            );

                $container4->addChildren(
                    'image',
                    'image',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'image',
                        'defaultValue'    => 'mgzbuilder/no_image.png',
                        'templateOptions' => [
                            'label' => __('Image')
                        ]
                    ]
                );

                $container4->addChildren(
                    'image_position',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'image_position',
                        'defaultValue'    => 'top',
                        'templateOptions' => [
                            'label'   => __('Image Position'),
                            'options' => $this->getImagePosition()
                        ]
                    ]
                );

            $container5 = $general->addContainerGroup(
                'container5',
                [
                    'sortOrder' => 60,
                    'hideExpression' => 'model.image_position=="cover"'
                ]
            );

                $container5->addChildren(
                    'image_min_width',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'image_min_width',
                        'templateOptions' => [
                            'label' => __('Image Min Width')
                        ]
                    ]
                );

                $container5->addChildren(
                    'image_min_height',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'image_min_height',
                        'templateOptions' => [
                            'label' => __('Image Min Height')
                        ]
                    ]
                );

            $container6 = $general->addContainerGroup(
                'container6',
                [
                    'sortOrder' => 70
                ]
            );

                $container6->addChildren(
                    'image_hover_animation',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'image_hover_animation',
                        'defaultValue'    => 'zoom-in',
                        'templateOptions' => [
                            'label'   => __('Image Hover Animation'),
                            'options' => $this->getImageAnimation()
                        ]
                    ]
                );

                $container6->addChildren(
                    'image_animation_duration',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'image_animation_duration',
                        'defaultValue'    => 1500,
                        'templateOptions' => [
                            'label' => __('Animation Duration (ms)')
                        ]
                    ]
                );

            $container7 = $general->addContainerGroup(
                'container7',
                [
                    'sortOrder' => 80
                ]
            );

                $container7->addChildren(
                    'icon',
                    'icon',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'icon',
                        'defaultValue'    => '',
                        'templateOptions' => [
                            'label' => __('Icon')
                        ]
                    ]
                );

                $container7->addChildren(
                    'icon_size',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'icon_size',
                        'defaultValue'    => 'md',
                        'templateOptions' => [
                            'label'   => __('Icon Size'),
                            'options' => $this->getSizeList()
                        ]
                    ]
                );

            $container8 = $general->addContainerGroup(
                'container8',
                [
                    'sortOrder' => 90
                ]
            );

                $container8->addChildren(
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

                $container8->addChildren(
                    'label_position',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'label_position',
                        'defaultValue'    => 'right',
                        'templateOptions' => [
                            'label'   => __('Label Position'),
                            'options' => $this->getLabelPosition()
                        ]
                    ]
                );

                $container8->addChildren(
                    'label_distance',
                    'number',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'label_distance',
                        'templateOptions' => [
                            'label' => __('Label Distance')
                        ]
                    ]
                );

            $general->addChildren(
                'box_link',
                'link',
                [
                    'sortOrder'       => 100,
                    'key'             => 'box_link',
                    'templateOptions' => [
                        'label' => __('Box Link')
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
        $tab = $this->addTab(
            'tab_style',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Style')
                ]
            ]
        );

            $container1 = $tab->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 10
                ]
            );

                $container1->addChildren(
                    'content_wrapper_width',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'content_wrapper_width',
                        'templateOptions' => [
                            'label' => __('Content Wrapper Width')
                        ]
                    ]
                );

                $container1->addChildren(
                    'content_width',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'content_width',
                        'templateOptions' => [
                            'label' => __('Content Width')
                        ]
                    ]
                );

            $container2 = $tab->addContainerGroup(
                'container2',
                [
                    'sortOrder' => 20
                ]
            );

                $container2->addChildren(
                    'content_min_height',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'content_min_height',
                        'templateOptions' => [
                            'label' => __('Content Min Height')
                        ]
                    ]
                );

                $container2->addChildren(
                    'box_border_radius',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'box_border_radius',
                        'templateOptions' => [
                            'label' => __('Box Border Radius')
                        ]
                    ]
                );

            $container3 = $tab->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 30
                ]
            );

                $container3->addChildren(
                    'title_spacing',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'title_spacing',
                        'templateOptions' => [
                            'label' => __('Title Spacing')
                        ]
                    ]
                );

                $container3->addChildren(
                    'title_font_size',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'title_font_size',
                        'templateOptions' => [
                            'label' => __('Title Font Size')
                        ]
                    ]
                );

            $container4 = $tab->addContainerGroup(
                'container4',
                [
                    'sortOrder' => 40
                ]
            );

                $container4->addChildren(
                    'title_spacing',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'description_spacing',
                        'templateOptions' => [
                            'label' => __('Description Spacing')
                        ]
                    ]
                );

                $container4->addChildren(
                    'icon_spacing',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'icon_spacing',
                        'templateOptions' => [
                            'label' => __('Icon Spacing')
                        ]
                    ]
                );

            $colors = $tab->addTab(
                'colors',
                [
                    'sortOrder'       => 60,
                    'templateOptions' => [
                        'label' => __('Colors')
                    ]
                ]
            );

                $normal = $colors->addContainer(
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
                            'content_background_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'content_background_color',
                                'templateOptions' => [
                                    'label' => __('Content Background Color')
                                ]
                            ]
                        );

                        $container1->addChildren(
                            'title_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'title_color',
                                'templateOptions' => [
                                    'label' => __('Title Color')
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
                            'description_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'description_color',
                                'templateOptions' => [
                                    'label' => __('Description Color')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'overlay_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'overlay_color',
                                'templateOptions' => [
                                    'label' => __('Overlay Color')
                                ]
                            ]
                        );

                    $container3 = $normal->addContainerGroup(
                        'container3',
                        [
                            'sortOrder' => 30
                        ]
                    );

                        $container3->addChildren(
                            'label_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'label_color',
                                'templateOptions' => [
                                    'label' => __('Label Color')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'label_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'label_background_color',
                                'templateOptions' => [
                                    'label' => __('Label Background Color')
                                ]
                            ]
                        );

                    $container4 = $normal->addContainerGroup(
                        'container4',
                        [
                            'sortOrder' => 40
                        ]
                    );

                        $container4->addChildren(
                            'icon_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'icon_color',
                                'className'       => 'mgz-width50',
                                'templateOptions' => [
                                    'label' => __('Icon Color')
                                ]
                            ]
                        );

                $hover = $colors->addContainer(
                    'hover',
                    [
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label' => __('Hover')
                        ]
                    ]
                );

                    $container1 = $hover->addContainerGroup(
                        'container1',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $container1->addChildren(
                            'content_hover_background_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'content_hover_background_color',
                                'templateOptions' => [
                                    'label' => __('Content Background Color')
                                ]
                            ]
                        );

                        $container1->addChildren(
                            'title_hover_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'title_hover_color',
                                'templateOptions' => [
                                    'label' => __('Title Color')
                                ]
                            ]
                        );

                    $container2 = $hover->addContainerGroup(
                        'container2',
                        [
                            'sortOrder' => 20
                        ]
                    );

                        $container2->addChildren(
                            'description_hover_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'description_hover_color',
                                'templateOptions' => [
                                    'label' => __('Description Color')
                                ]
                            ]
                        );

                        $container2->addChildren(
                            'overlay_hover_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'overlay_hover_color',
                                'templateOptions' => [
                                    'label' => __('Overlay Color')
                                ]
                            ]
                        );

                    $container3 = $hover->addContainerGroup(
                        'container3',
                        [
                            'sortOrder' => 30
                        ]
                    );

                        $container3->addChildren(
                            'hover_label_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'hover_label_color',
                                'templateOptions' => [
                                    'label' => __('Label Color')
                                ]
                            ]
                        );

                        $container3->addChildren(
                            'label_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'hover_label_background_color',
                                'templateOptions' => [
                                    'label' => __('Label Background Color')
                                ]
                            ]
                        );

                    $container4 = $hover->addContainerGroup(
                        'container4',
                        [
                            'sortOrder' => 40
                        ]
                    );

                        $container4->addChildren(
                            'hover_icon_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'hover_icon_color',
                                'className'       => 'mgz-width50',
                                'templateOptions' => [
                                    'label' => __('Icon Color')
                                ]
                            ]
                        );

        return $tab;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareButtonTab()
    {
        $button = parent::prepareButtonTab();

            $button->addChildren(
                'button_position',
                'select',
                [
                    'sortOrder'       => 40,
                    'key'             => 'button_position',
                    'defaultValue'    => 'bottom',
                    'templateOptions' => [
                        'label'   => __('Button Position'),
                        'options' => $this->getPositionOptions()
                    ]
                ]
            );

        return $button;
    }

    /**
     * Get hover effect
     *
     * @return array[]
     */
    public function getHoverEffect()
    {
        return [
            [
                'label' => __('Zoom'),
                'value' => 'zoom'
            ],
            [
                'label' => __('Border'),
                'value' => 'border'
            ],
            [
                'label' => __('Border Zoom'),
                'value' => 'zoom border'
            ],
            [
                'label' => __('Flashed'),
                'value' => 'flashed'
            ],
            [
                'label' => __('Flashed Zoom'),
                'value' => 'zoom flashed'
            ],
            [
                'label' => __('Shadow'),
                'value' => 'shadow'
            ],
            [
                'label' => __('Shadow Zoom '),
                'value' => 'zoom shadow'
            ]
        ];
    }

    /**
     * Get image position
     *
     * @return array[]
     */
    public function getImagePosition()
    {
        return [
            [
                'label' => __('Cover'),
                'value' => 'cover'
            ],
            [
                'label' => __('Top'),
                'value' => 'top'
            ],
            [
                'label' => __('Right'),
                'value' => 'right'
            ],
            [
                'label' => __('Left'),
                'value' => 'left'
            ]
        ];
    }

    /**
     * Get label position
     *
     * @return array[]
     */
    public function getLabelPosition()
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
     * Get Image Animation
     *
     * @return array[]
     */
    public function getImageAnimation()
    {
        return [
            [
                'label' => 'None',
                'value' => ''
            ],
            [
                'label' => 'Zoom In',
                'value' => 'zoom-in'
            ],
            [
                'label' => 'Zoom Out',
                'value' => 'zoom-out'
            ],
            [
                'label' => 'Move Left',
                'value' => 'move-left'
            ],
            [
                'label' => 'Move Right',
                'value' => 'move-right'
            ],
            [
                'label' => 'Move Up',
                'value' => 'move-up'
            ],
            [
                'label' => 'Move Down',
                'value' => 'move-down'
            ]
        ];
    }

    /**
     * Get content animation
     *
     * @return array
     */
    public function getContentAnimation()
    {
        $groups[] = [
            'label'    => 'Entrance',
            'children' => [
                'enter-from-right'  => 'Slide In Right',
                'enter-from-left'   => 'Slide In Left',
                'enter-from-top'    => 'Slide In Up',
                'enter-from-bottom' => 'Slide In Down',
                'enter-zoom-in'     => 'Zoom In',
                'enter-zoom-out'    => 'Zoom Out',
                'fade-in'           => 'Fade In'
            ]
        ];

        $groups[] = [
            'label'    => 'Reaction',
            'children' => [
                'grow'       => 'Grow',
                'shrink'     => 'Shrink',
                'move-right' => 'Move Right',
                'move-left'  => 'Move Left',
                'move-up'    => 'Move Up',
                'move-down'  => 'Move Down'
            ]
        ];

        $groups[] = [
            'label'    => 'Exit',
            'children' => [
                'exit-to-right'  => 'Slide Out Right',
                'exit-to-left'   => 'Slide Out Left',
                'exit-to-top'    => 'Slide Out Up',
                'exit-to-bottom' => 'Slide Out Down',
                'exit-zoom-in'   => 'Zoom In',
                'exit-zoom-out'  => 'Zoom Out',
                'fade-out'       => 'Fade Out'
            ]
        ];
        $options[] = [
            'label' => 'None',
            'value' => ''
        ];
        foreach ($groups as $group) {
            foreach ($group['children'] as $k => $v) {
                $options[] = [
                    'label' => $v,
                    'value' => $k,
                    'group' => $group['label']
                ];
            }
        }
        return $options;
    }

    /**
     * @return string[]
     */
    public function getDefaultValues()
    {
        return ['align' => 'center'];
    }
}
