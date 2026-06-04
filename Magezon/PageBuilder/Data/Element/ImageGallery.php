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

class ImageGallery extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareImagesTab();
        $this->prepareGalleryTab();
        return $this;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $general = parent::prepareGeneralTab();

            $general->addChildren(
                'gallery_type',
                'select',
                [
                    'sortOrder'       => 10,
                    'key'             => 'gallery_type',
                    'defaultValue'    => 'fotorama',
                    'templateOptions' => [
                        'label'   => __('Gallery Type'),
                        'options' => $this->getGalleryType()
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

            $items = $images->addChildren(
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
                        'sortOrder' => 10
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
                            'type',
                            'select',
                            [
                                'key'             => 'type',
                                'sortOrder'       => 10,
                                'templateOptions' => [
                                    'label'        => __('Type'),
                                    'options'      => $this->getTypeOptions()
                                ]
                            ]
                        );

                        $container21 = $container2->addContainerGroup(
                            'container21',
                            [
                                'sortOrder' => 20
                            ]
                        );

                            $container21->addChildren(
                                'image',
                                'image',
                                [
                                    'key'             => 'image',
                                    'sortOrder'       => 10,
                                    'templateOptions' => [
                                        'label' => __('Image')
                                    ],
                                    'hideExpression' => 'model.type!="media"&&model.type!="video"'
                                ]
                            );

                            $container21->addChildren(
                                'full_image',
                                'image',
                                [
                                    'key'             => 'full_image',
                                    'sortOrder'       => 20,
                                    'templateOptions' => [
                                        'label' => __('Full Image')
                                    ],
                                    'hideExpression' => 'model.type!="media"'
                                ]
                            );

                        $container2->addChildren(
                            'link',
                            'text',
                            [
                                'key'             => 'link',
                                'sortOrder'       => 30,
                                'templateOptions' => [
                                    'label' => __('Image Link')
                                ],
                                'hideExpression' => 'model.type!="link"'
                            ]
                        );

                        $container2->addChildren(
                            'video_url',
                            'text',
                            [
                                'key'             => 'video_url',
                                'sortOrder'       => 40,
                                'templateOptions' => [
                                    'label' => __('Video Url')
                                ],
                                'hideExpression' => 'model.type!="video"'
                            ]
                        );

                    $container1->addChildren(
                        'caption',
                        'editor',
                        [
                            'key'             => 'caption',
                            'sortOrder'       => 20,
                            'className'       => 'mgz-width100',
                            'templateOptions' => [
                                'label'   => __('Caption'),
                                'wysiwyg' => [
                                    'height' => '50px'
                                ]
                            ]
                        ]
                    );

                    $container3 = $container1->addContainer(
                        'container3',
                        [
                            'className' => 'mgz-dynamicrows-actions',
                            'sortOrder' => 30
                        ]
                    );

                        $container3->addChildren(
                            'delete',
                            'actionDelete',
                            [
                                'sortOrder' => 10
                            ]
                        );

                        $container3->addChildren(
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
    public function prepareGalleryTab()
    {
        $fotorama = $this->addTab(
            'tab_fotorama',
            [
                'sortOrder'       => 80,
                'templateOptions' => [
                    'label' => __('Fotorama Options')
                ],
                'hideExpression' => 'model.gallery_type!="fotorama"'
            ]
        );

            $container1 = $fotorama->addChildren(
                'html1',
                'html',
                [
                    'templateOptions' => [
                        'content' => __('Check more details at <a href="%1" target="_blank">here</a>', 'http://fotorama.io/customize/options')
                    ]
                ]
            );

            $container1 = $fotorama->addContainerGroup(
                'container1',
                [
                    'templateOptions' => [
                        'sortOrder' => 10
                    ]
                ]
            );

                $container1->addChildren(
                    'nav',
                    'select',
                    [
                        'key'             => 'nav',
                        'sortOrder'       => 10,
                        'defaultValue'    => 'thumbs',
                        'templateOptions' => [
                            'label'   => __('Navigation Style'),
                            'options' => $this->getNavigationStyle()
                        ]
                    ]
                );

                $container1->addChildren(
                    'navposition',
                    'select',
                    [
                        'key'             => 'navposition',
                        'sortOrder'       => 20,
                        'defaultValue'    => 'bottom',
                        'templateOptions' => [
                            'label'   => __('Navigation Position'),
                            'options' => $this->getNavigationPosition()
                        ]
                    ]
                );

                $container1->addChildren(
                    'margin',
                    'number',
                    [
                        'key'             => 'margin',
                        'sortOrder'       => 30,
                        'defaultValue'    => 0,
                        'templateOptions' => [
                            'label' => __('Margin'),
                            'note'  => __('Horizontal margins for frames in pixels.')
                        ]
                    ]
                );

            $container2 = $fotorama->addContainerGroup(
                'container2',
                [
                    'templateOptions' => [
                        'sortOrder' => 20
                    ]
                ]
            );

                $container2->addChildren(
                    'thumbwidth',
                    'number',
                    [
                        'key'             => 'thumbwidth',
                        'sortOrder'       => 10,
                        'defaultValue'    => 64,
                        'templateOptions' => [
                            'label'   => __('Thumbnail Width'),
                        ]
                    ]
                );

                $container2->addChildren(
                    'thumbheight',
                    'number',
                    [
                        'key'             => 'thumbheight',
                        'sortOrder'       => 20,
                        'defaultValue'    => 64,
                        'templateOptions' => [
                            'label' => __('Thumbnail Height')
                        ]
                    ]
                );

                $container2->addChildren(
                    'thumbmargin',
                    'number',
                    [
                        'key'             => 'thumbmargin',
                        'sortOrder'       => 30,
                        'defaultValue'    => 2,
                        'templateOptions' => [
                            'label' => __('Thumbnail Margin')
                        ]
                    ]
                );

            $container3 = $fotorama->addContainerGroup(
                'container3',
                [
                    'templateOptions' => [
                        'sortOrder' => 30
                    ]
                ]
            );

                $container3->addChildren(
                    'allowfullscreen',
                    'toggle',
                    [
                        'key'             => 'allowfullscreen',
                        'sortOrder'       => 10,
                        'defaultValue'    => false,
                        'templateOptions' => [
                            'label' => __('Allows Fullscreen')
                        ]
                    ]
                );

                $container3->addChildren(
                    'captions',
                    'toggle',
                    [
                        'key'             => 'captions',
                        'sortOrder'       => 20,
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Captions'),
                            'note'  => __('Captions visibility')
                        ]
                    ]
                );

                $container3->addChildren(
                    'loop',
                    'toggle',
                    [
                        'key'             => 'loop',
                        'sortOrder'       => 30,
                        'defaultValue'    => false,
                        'templateOptions' => [
                            'label' => __('Loop')
                        ]
                    ]
                );

            $container4 = $fotorama->addContainerGroup(
                'container4',
                [
                    'templateOptions' => [
                        'sortOrder' => 40
                    ]
                ]
            );

                $container4->addChildren(
                    'arrows',
                    'toggle',
                    [
                        'key'             => 'arrows',
                        'sortOrder'       => 10,
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Arrows'),
                            'note'  => __('Turns on navigation arrows over the frames.')
                        ]
                    ]
                );

                $container4->addChildren(
                    'autoplay',
                    'text',
                    [
                        'key'             => 'autoplay',
                        'sortOrder'       => 20,
                        'defaultValue'    => 'false',
                        'templateOptions' => [
                            'label' => __('Auto Play'),
                            'note'  => __('Enables slideshow. Turn it on with true or any interval in milliseconds')
                        ]
                    ]
                );

                $container4->addChildren(
                    'stopautoplayontouch',
                    'toggle',
                    [
                        'key'             => 'stopautoplayontouch',
                        'sortOrder'       => 30,
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Stop autoplay on touch'),
                            'note' => __('Stops slideshow at any user action with the fotorama.'),
                        ]
                    ]
                );

            $container5 = $fotorama->addContainerGroup(
                'container5',
                [
                    'templateOptions' => [
                        'sortOrder' => 30
                    ]
                ]
            );

                $container5->addChildren(
                    'click',
                    'toggle',
                    [
                        'key'             => 'click',
                        'sortOrder'       => 10,
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Click'),
                            'note'  => __('Moving between frames by clicking.')
                        ]
                    ]
                );

                $container5->addChildren(
                    'swipe',
                    'toggle',
                    [
                        'key'             => 'swipe',
                        'sortOrder'       => 20,
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Swipe'),
                            'note'  => __('Moving between frames by swiping.')
                        ]
                    ]
                );

                $container5->addChildren(
                    'keyboard',
                    'toggle',
                    [
                        'key'             => 'keyboard',
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label' => __('Keyboard'),
                            'note'  => __('Enables keyboard navigation.')
                        ]
                    ]
                );

            $container6 = $fotorama->addContainerGroup(
                'container6',
                [
                    'templateOptions' => [
                        'sortOrder' => 40
                    ]
                ]
            );

                $container6->addChildren(
                    'trackpad',
                    'toggle',
                    [
                        'key'             => 'trackpad',
                        'sortOrder'       => 10,
                        'defaultValue'    => false,
                        'templateOptions' => [
                            'label' => __('Trackpad'),
                            'note'  => __('Enables trackpad support and horizontal mouse wheel as well.')
                        ]
                    ]
                );

                $container6->addChildren(
                    'shuffle',
                    'toggle',
                    [
                        'key'             => 'shuffle',
                        'sortOrder'       => 20,
                        'defaultValue'    => false,
                        'templateOptions' => [
                            'label' => __('Shuffle'),
                            'note'  => __('Shuffles frames at launch.')
                        ]
                    ]
                );

                $container6->addChildren(
                    'shadows',
                    'toggle',
                    [
                        'key'             => 'shadows',
                        'sortOrder'       => 30,
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Shadows')
                        ]
                    ]
                );

            $container7 = $fotorama->addContainerGroup(
                'container7',
                [
                    'templateOptions' => [
                        'sortOrder' => 50
                    ]
                ]
            );

                $container7->addChildren(
                    'rtl',
                    'toggle',
                    [
                        'key'             => 'rtl',
                        'sortOrder'       => 10,
                        'templateOptions' => [
                            'label' => __('RTL')
                        ]
                    ]
                );

                $container7->addChildren(
                    'hash',
                    'toggle',
                    [
                        'key'             => 'hash',
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label' => __('Hash')
                        ]
                    ]
                );

                $container7->addChildren(
                    'fit',
                    'select',
                    [
                        'key'             => 'fit',
                        'sortOrder'       => 30,
                        'defaultValue'    => 'contain',
                        'templateOptions' => [
                            'label'   => __('Fit'),
                            'options' => $this->getFitOptions(),
                            'note'    => __('How to fit an image into a fotorama')
                        ]
                    ]
                );

            $container8 = $fotorama->addContainerGroup(
                'container8',
                [
                    'templateOptions' => [
                        'sortOrder' => 60
                    ]
                ]
            );

                $container8->addChildren(
                    'transition',
                    'select',
                    [
                        'key'             => 'transition',
                        'sortOrder'       => 10,
                        'defaultValue'    => 'slide',
                        'templateOptions' => [
                            'label'   => __('Transition'),
                            'options' => $this->getTransitionOptions()
                        ]
                    ]
                );

                $container8->addChildren(
                    'startindex',
                    'number',
                    [
                        'key'             => 'startindex',
                        'sortOrder'       => 20,
                        'defaultValue'    => 0,
                        'templateOptions' => [
                            'label'   => __('Start Index'),
                            'note'    => __('Index or id of the frame that will be shown upon initialization of the fotorama.')
                        ]
                    ]
                );

                $container8->addChildren(
                    'ratio',
                    'text',
                    [
                        'key'             => 'ratio',
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label'   => __('Ratio'),
                            'note'    => __('Width divided by height. Recommended if you’re using percentage width.')
                        ]
                    ]
                );

            $container9 = $fotorama->addContainerGroup(
                'container9',
                [
                    'templateOptions' => [
                        'sortOrder' => 10
                    ]
                ]
            );

                $container9->addChildren(
                    'width',
                    'text',
                    [
                        'key'             => 'width',
                        'sortOrder'       => 10,
                        'defaultValue'    => '100%',
                        'templateOptions' => [
                            'label'   => __('Width'),
                            'note'    => __('Stage container width in pixels or percents.')
                        ]
                    ]
                );

                $container9->addChildren(
                    'minwidth',
                    'text',
                    [
                        'key'             => 'minwidth',
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label'   => __('Min Width'),
                            'note'    => __('Stage container minimum width in pixels or percents.')
                        ]
                    ]
                );

                $container9->addChildren(
                    'maxwidth',
                    'text',
                    [
                        'key'             => 'maxwidth',
                        'sortOrder'       => 30,
                        'defaultValue'    => '100%',
                        'templateOptions' => [
                            'label'   => __('Max Width'),
                            'note'    => __('Stage container maximum width in pixels or percents.')
                        ]
                    ]
                );

            $container10 = $fotorama->addContainerGroup(
                'container10',
                [
                    'templateOptions' => [
                        'sortOrder' => 10
                    ]
                ]
            );

                $container10->addChildren(
                    'height',
                    'text',
                    [
                        'key'             => 'height',
                        'sortOrder'       => 10,
                        'templateOptions' => [
                            'label'   => __('Height'),
                            'note'    => __('Stage container height in pixels or percents.')
                        ]
                    ]
                );

                $container10->addChildren(
                    'minheight',
                    'text',
                    [
                        'key'             => 'minheight',
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label'   => __('Min Height'),
                            'note'    => __('Stage container minimum height in pixels or percents.')
                        ]
                    ]
                );

                $container10->addChildren(
                    'maxheight',
                    'text',
                    [
                        'key'             => 'maxheight',
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label'   => __('Max Height'),
                            'note'    => __('Stage container maximum height in pixels or percents.')
                        ]
                    ]
                );

        return $fotorama;
    }

    /**
     * @return array[]
     */
    public function getGalleryType()
    {
        return [
            [
                'label' => __('Fotorama'),
                'value' => 'fotorama'
            ],
            [
                'label' => __('OwlCarousel'),
                'value' => 'owl'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getTypeOptions()
    {
        return [
            [
                'label' => __('Media Library'),
                'value' => 'media'
            ],
            [
                'label' => __('External Link'),
                'value' => 'link'
            ],
            [
                'label' => __('Video'),
                'value' => 'video'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getFitOptions()
    {
        return [
            [
                'label' => __('contain'),
                'value' => 'contain'
            ],
            [
                'label' => __('cover'),
                'value' => 'cover'
            ],
            [
                'label' => __('scaledown'),
                'value' => 'scaledown'
            ],
            [
                'label' => __('none'),
                'value' => 'none'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getTransitionOptions()
    {
        return [
            [
                'label' => __('slide'),
                'value' => 'slide'
            ],
            [
                'label' => __('crossfade'),
                'value' => 'crossfade'
            ],
            [
                'label' => __('dissolve'),
                'value' => 'dissolve'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getNavigationStyle()
    {
        return [
            [
                'label' => __('dots'),
                'value' => 'dots'
            ],
            [
                'label' => __('thumbs'),
                'value' => 'thumbs'
            ],
            [
                'label' => __('false'),
                'value' => 'false'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getNavigationPosition()
    {
        return [
            [
                'label' => __('top'),
                'value' => 'top'
            ],
            [
                'label' => __('bottom'),
                'value' => 'bottom'
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
                    'type' => 'link',
                    'link' => 'https://www.magezon.com/pub/media/no_image.png'
                ],
                [
                    'type' => 'link',
                    'link' => 'https://www.magezon.com/pub/media/no_image.png'
                ],
                [
                    'type' => 'link',
                    'link' => 'https://www.magezon.com/pub/media/no_image.png'
                ],
                [
                    'type' => 'link',
                    'link' => 'https://www.magezon.com/pub/media/no_image.png'
                ],
                [
                    'type' => 'link',
                    'link' => 'https://www.magezon.com/pub/media/no_image.png'
                ]
            ]
        ];
    }
}
