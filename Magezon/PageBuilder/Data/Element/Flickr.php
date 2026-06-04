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

class Flickr extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareGridTab();
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
                'flickr_api_key',
                'text',
                [
                    'sortOrder'       => 50,
                    'key'             => 'flickr_api_key',
                    'defaultValue'    => '59ac8916e80833e67ab731f8c95dfdde',
                    'templateOptions' => [
                        'label' => __('Flickr API Key'),
                        'note'  => __('Your API application key. See <a href="%1" target="_blank">here</a> for more details.', 'https://www.flickr.com/services/api/misc.api_keys.html')
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
                    'flickr_album_id',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'flickr_album_id',
                        'defaultValue'    => '72157630137235910',
                        'templateOptions' => [
                            'label' => __('Flickr Album ID')
                        ]
                    ]
                );

                $container4->addChildren(
                    'show_photo_title',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'show_photo_title',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show Photo Title')
                        ]
                    ]
                );

            $general->addChildren(
                'gap',
                'number',
                [
                    'sortOrder'       => 70,
                    'key'             => 'gap',
                    'defaultValue'    => 15,
                    'templateOptions' => [
                        'label' => __('Gap'),
                        'note'  => __('Gap pixel between grid elements.')
                    ]
                ]
            );

        return $general;
    }

    /**
     * Get photo size options
     *
     * @return array[]
     */
    public function getPhotoSizeOptions()
    {
        return [
            [
                'label' => __('Thumbnail'),
                'value' => 'thumbnail'
            ],
            [
                'label' => __('Small'),
                'value' => 'small'
            ],
            [
                'label' => __('Large'),
                'value' => 'large'
            ],
            [
                'label' => __('Original'),
                'value' => 'original'
            ]
        ];
    }

    /**
     * @return array[]
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
                'label' => __('Open Photo Link'),
                'value' => 'photo'
            ]
        ];
    }

    /**
     * @return array
     */
    public function getFetchType()
    {
        return [
            [
                'label' => __('Username'),
                'value' => 'username'
            ],
            [
                'label' => __('Hashtag'),
                'value' => 'hashtag'
            ]
        ];
    }

    /**
     * @return array
     */
    public function getThumbnailSize()
    {
        return [
            [
                'label' => __('Large Square(150x150)'),
                'value' => 'q'
            ],
            [
                'label' => __('Thumbnail(100x75)'),
                'value' => 't'
            ],
            [
                'label' => __('Small(240x180)'),
                'value' => 's'
            ],
            [
                'label' => __('Small(320x240)'),
                'value' => 'n'
            ],
            [
                'label' => __('Medium(500x375)'),
                'value' => 'm'
            ],
            [
                'label' => __('Medium(640x480)'),
                'value' => 'z'
            ],
            [
                'label' => __('Medium(800x600)'),
                'value' => 'c'
            ],
            [
                'label' => __('Large(1024x768)'),
                'value' => 'l'
            ],
            [
                'label' => __('Original'),
                'value' => '0'
            ]
        ];
    }

    /**
     * @return array
     */
    public function getResponsiveColumn()
    {
        return [
            [
                'label' => 'Auto',
                'value' => 'auto'
            ],
            [
                'label' => 12,
                'value' => 12
            ],
            [
                'label' => 6,
                'value' => 6
            ],
            [
                'label' => 5,
                'value' => 5
            ],
            [
                'label' => 4,
                'value' => 4
            ],
            [
                'label' => 3,
                'value' => 3
            ],
            [
                'label' => 2,
                'value' => 2
            ],
            [
                'label' => 1,
                'value' => 1
            ]
        ];
    }

    /**
     * @return array
     */
    public function getDefaultValues()
    {
        return [
            'title'   => __('Flickr'),
            'item_xl' => 12,
            'item_lg' => 12,
            'item_md' => 6,
            'item_sm' => 5,
            'item_xs' => 4
        ];
    }
}
