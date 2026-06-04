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

class Video extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareVideoOptionsTab();
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
                        'templateOptions' => [
                            'label' => __('Widget Title')
                        ]
                    ]
                );

                $container1->addChildren(
                    'title_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'title_color',
                        'className'       => 'mgz-width40',
                        'templateOptions' => [
                            'label' => __('Title Color')
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

                $container2->addChildren(
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

                $container2->addChildren(
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

            $container3 = $general->addContainerGroup(
                'container3',
                [
                    'sortOrder'      => 30,
                    'hideExpression' => '!model.show_line'
                ]
            );

                $container3->addChildren(
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

                $container3->addChildren(
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

                $container3->addChildren(
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

            $general->addChildren(
                'video_type',
                'select',
                [
                    'sortOrder'       => 50,
                    'key'             => 'video_type',
                    'defaultValue'    => 'youtube',
                    'templateOptions' => [
                        'label'   => __('Source'),
                        'options' => $this->getVideoType()
                    ]
                ]
            );

            $general->addChildren(
                'link',
                'text',
                [
                    'sortOrder'       => 60,
                    'key'             => 'link',
                    'defaultValue'    => 'https://www.youtube.com/watch?v=HPan7HtIYOw',
                    'templateOptions' => [
                        'label' => __('Link')
                    ]
                ]
            );

            $title = $general->addContainer(
                'title_container',
                [
                    'sortOrder'       => 70,
                    'templateOptions' => [
                        'label'       => __('Video Title'),
                        'collapsible' => true
                    ],
                    'hideExpression' => '!model.link'
                ]
            );

                $title->addChildren(
                    'video_title',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'video_title',
                        'templateOptions' => [
                            'label' => __('Title')
                        ]
                    ]
                );

                $container1 = $title->addContainerGroup(
                    'container1',
                    [
                        'sortOrder' => 20
                    ]
                );

                    $container1->addChildren(
                        'video_title_color',
                        'color',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'video_title_color',
                            'templateOptions' => [
                                'label' => __('Color')
                            ]
                        ]
                    );

                    $container1->addChildren(
                        'video_title_spacing',
                        'text',
                        [
                            'sortOrder'       => 20,
                            'key'             => 'video_title_spacing',
                            'templateOptions' => [
                                'label' => __('Spacing')
                            ]
                        ]
                    );

                $container2 = $title->addContainerGroup(
                    'container2',
                    [
                        'sortOrder' => 30
                    ]
                );

                    $container2->addChildren(
                        'video_title_font_size',
                        'text',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'video_title_font_size',
                            'templateOptions' => [
                                'label' => __('Font Size')
                            ]
                        ]
                    );

                    $container2->addChildren(
                        'video_title_font_weight',
                        'text',
                        [
                            'sortOrder'       => 20,
                            'key'             => 'video_title_font_weight',
                            'templateOptions' => [
                                'label' => __('Font Weight')
                            ]
                        ]
                    );

            $description = $general->addContainer(
                'description_container',
                [
                    'sortOrder'       => 80,
                    'templateOptions' => [
                        'label'       => __('Video Description'),
                        'collapsible' => true
                    ],
                    'hideExpression' => '!model.link'
                ]
            );
                $description->addChildren(
                    'video_description',
                    'textarea',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'video_description',
                        'templateOptions' => [
                            'label' => __('Description')
                        ]
                    ]
                );

                $container1 = $description->addContainerGroup(
                    'container1',
                    [
                        'sortOrder' => 20
                    ]
                );

                    $container1->addChildren(
                        'video_description_color',
                        'color',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'video_description_color',
                            'templateOptions' => [
                                'label' => __('Color')
                            ]
                        ]
                    );

                    $container1->addChildren(
                        'video_description_spacing',
                        'text',
                        [
                            'sortOrder'       => 20,
                            'key'             => 'video_description_spacing',
                            'templateOptions' => [
                                'label' => __('Spacing')
                            ]
                        ]
                    );

                $container2 = $description->addContainerGroup(
                    'container2',
                    [
                        'sortOrder' => 30
                    ]
                );

                    $container2->addChildren(
                        'video_description_font_size',
                        'text',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'video_description_font_size',
                            'templateOptions' => [
                                'label' => __('Font Size')
                            ]
                        ]
                    );

                    $container2->addChildren(
                        'video_description_font_weight',
                        'text',
                        [
                            'sortOrder'       => 20,
                            'key'             => 'video_description_font_weight',
                            'templateOptions' => [
                                'label' => __('Font Weight')
                            ]
                        ]
                    );

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareVideoOptionsTab()
    {
        $video = $this->addTab(
            'video_options',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Video Options')
                ]
            ]
        );

            $container1 = $video->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 10
                ]
            );

                $container1->addChildren(
                    'aspect_ratio',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'aspect_ratio',
                        'defaultValue'    => '169',
                        'templateOptions' => [
                            'label'   => __('Video Aspect Ratio'),
                            'options' => $this->getVideoAspectRatio()
                        ]
                    ]
                );

                $container1->addChildren(
                    'start_at',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'start_at',
                        'templateOptions' => [
                            'label'        => __('Start Time'),
                            'tooltip'      => __('Specify a start time (in seconds)'),
                            'tooltipClass' => 'tooltip-bottom-left'
                        ]
                    ]
                );

                $container1->addChildren(
                    'end_at',
                    'number',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'end_at',
                        'templateOptions' => [
                            'label'        => __('End Time'),
                            'tooltip'      => __('Specify a end time (in seconds)'),
                            'tooltipClass' => 'tooltip-bottom-left'
                        ],
                        'hideExpression' => 'model.video_type!="youtube"'
                    ]
                );

            $container2 = $video->addContainerGroup(
                'container2',
                [
                    'sortOrder' => 20
                ]
            );

                $container2->addChildren(
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

                $container2->addChildren(
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

                $container2->addChildren(
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

                $container2->addChildren(
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

            $container3 = $video->addContainerGroup(
                'container3',
                [
                    'sortOrder'      => 30,
                    'hideExpression' => 'model.video_type!="vimeo"'
                ]
            );

                $container3->addChildren(
                    'vimeo_title',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'vimeo_title',
                        'templateOptions' => [
                            'label' => __('Intro Title')
                        ]
                    ]
                );

                $container3->addChildren(
                    'vimeo_portrait',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'vimeo_portrait',
                        'templateOptions' => [
                            'label' => __('Intro Portrait')
                        ]
                    ]
                );

                $container3->addChildren(
                    'vimeo_byline',
                    'toggle',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'vimeo_byline',
                        'templateOptions' => [
                            'label' => __('Intro Byline')
                        ]
                    ]
                );

            $container31 = $video->addContainerGroup(
                'container31',
                [
                    'sortOrder'      => 30,
                    'hideExpression' => 'model.video_type!="vimeo"'
                ]
            );

                $container31->addChildren(
                    'video_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'video_color',
                        'templateOptions' => [
                            'label' => __('Controls Color')
                        ]
                    ]
                );

            $container4 = $video->addContainerGroup(
                'container4',
                [
                    'sortOrder'      => 40,
                    'hideExpression' => 'model.video_type!="youtube"'
                ]
            );

                // $container4->addChildren(
                //     'player_controls',
                //     'toggle',
                //     [
                //         'sortOrder'       => 10,
                //         'key'             => 'controls',
                //         'defaultValue'    => true,
                //         'templateOptions' => [
                //             'label' => __('Player Controls')
                //         ]
                //     ]
                // );

                $container4->addChildren(
                    'modest_branding',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'modest_branding',
                        'templateOptions' => [
                            'label' => __('Modest Branding')
                        ]
                    ]
                );

                $container4->addChildren(
                    'related_videos',
                    'toggle',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'related_videos',
                        'templateOptions' => [
                            'label' => __('Show Related Videos')
                        ]
                    ]
                );

            $container5 = $video->addContainerGroup(
                'container5',
                [
                    'sortOrder'      => 50,
                    'hideExpression' => 'model.video_type!="youtube"'
                ]
            );

                $container5->addChildren(
                    'youtube_privacy',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'youtube_privacy',
                        'templateOptions' => [
                            'label'   => __('Privacy Mode'),
                            'tooltip' => __('When you turn on privacy mode, YouTube won\'t store information about visitors on your website unless they play the video.')
                        ]
                    ]
                );

            $container6 = $video->addContainerGroup(
                'container6',
                [
                    'sortOrder' => 60
                ]
            );

                $container6->addChildren(
                    'show_preview_image',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'show_preview_image',
                        'templateOptions' => [
                            'label' => __('Show Preview Image')
                        ]
                    ]
                );

                $container6->addChildren(
                    'preview_image',
                    'image',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'preview_image',
                        'templateOptions' => [
                            'label' => __('Preview Image')
                        ],
                        'hideExpression' => '!model.show_preview_image'
                    ]
                );

                $container6->addChildren(
                    'empty1',
                    'emptyElement',
                    [
                        'sortOrder' => 30
                    ]
                );

            $container7 = $video->addContainerGroup(
                'container7',
                [
                    'sortOrder'      => 70,
                    'hideExpression' => '!model.show_preview_image'
                ]
            );

                $container7->addChildren(
                    'lightbox',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'lightbox',
                        'templateOptions' => [
                            'label' => __('Lightbox')
                        ]
                    ]
                );

                $container7->addChildren(
                    'lightbox_width',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'lightbox_width',
                        'templateOptions' => [
                            'label' => __('Lightbox Width')
                        ],
                        'hideExpression' => '!model.lightbox'
                    ]
                );

                $container7->addChildren(
                    'empty1',
                    'emptyElement',
                    [
                        'sortOrder' => 30
                    ]
                );

            $container8 = $video->addContainerGroup(
                'container8',
                [
                    'sortOrder'      => 80,
                    'hideExpression' => '!model.show_preview_image'
                ]
            );

                $container8->addChildren(
                    'show_play_icon',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'show_play_icon',
                        'templateOptions' => [
                            'label' => __('Show Play Icon')
                        ]
                    ]
                );

                $container8->addChildren(
                    'play_icon_size',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'play_icon_size',
                        'templateOptions' => [
                            'label' => __('Play Icon Size(px)')
                        ],
                        'hideExpression' => '!model.show_play_icon'
                    ]
                );

                $container8->addChildren(
                    'play_icon_color',
                    'color',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'play_icon_color',
                        'templateOptions' => [
                            'label' => __('Play Icon Color')
                        ],
                        'hideExpression' => '!model.show_play_icon'
                    ]
                );

            $container9 = $video->addContainerGroup(
                'container9',
                [
                    'sortOrder'      => 90,
                    'hideExpression' => '!model.show_preview_image'
                ]
            );

                $container9->addChildren(
                    'play_icon',
                    'image',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'play_icon',
                        'templateOptions' => [
                            'label' => __('Custom Play Icon')
                        ]
                    ]
                );

        return $video;
    }

    /**
     * @return array[]
     */
    public function getVideoType()
    {
        return [
            [
                'label' => __('YouTube'),
                'value' => 'youtube'
            ],
            [
                'label' => __('Vimeo'),
                'value' => 'vimeo'
            ],
            [
                'label' => __('Local Video'),
                'value' => 'local'
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
}
