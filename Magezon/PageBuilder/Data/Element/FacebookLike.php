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

class FacebookLike extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $general = parent::prepareGeneralTab();

            $general->addChildren(
                'btn_url',
                'text',
                [
                    'sortOrder'       => 10,
                    'key'             => 'btn_url',
                    'templateOptions' => [
                        'label' => __('URL to Like'),
                        'note'  => __('Leave empty to like the current page url')
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
                    'btn_layout',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'btn_layout',
                        'defaultValue'    => 'standard',
                        'templateOptions' => [
                            'label'   => __('Layout'),
                            'options' => $this->getFacebookLayout()
                        ]
                    ]
                );

                $container1->addChildren(
                    'btn_action',
                    'select',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'btn_action',
                        'defaultValue'    => 'like',
                        'templateOptions' => [
                            'label'   => __('Action Type'),
                            'options' => $this->getFacebookAction()
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
                    'btn_size',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'btn_size',
                        'defaultValue'    => 'small',
                        'templateOptions' => [
                            'label'   => __('Button Size'),
                            'options' => $this->getFacebookButtonSize()
                        ]
                    ]
                );

                $container2->addChildren(
                    'btn_show_faces',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'btn_show_faces',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label'        => __('Show Friends\' Faces'),
                            'tooltip'      => __('Show profile photos when 2 or more friends like this'),
                            'tooltipClass' => 'tooltip-bottom-left',
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
                    'btn_share',
                    'toggle',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'btn_share',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label'   => __('Include Share Button'),
                            'tooltip' => __('Includes a Share button beside the Like button')
                        ]
                    ]
                );

        return $general;
    }

    /**
     * Get facebook layout
     *
     * @return array[]
     */
    public function getFacebookLayout()
    {
        return [
            [
                'label' => __('standard'),
                'value' => 'standard'
            ],
            [
                'label' => __('box_count'),
                'value' => 'box_count'
            ],
            [
                'label' => __('button_count'),
                'value' => 'button_count'
            ],
            [
                'label' => __('button'),
                'value' => 'button'
            ]
        ];
    }

    /**
     * Get facebook action
     *
     * @return array[]
     */
    public function getFacebookAction()
    {
        return [
            [
                'label' => __('like'),
                'value' => 'like'
            ],
            [
                'label' => __('recommend'),
                'value' => 'recommend'
            ]
        ];
    }

    /**
     * Get facebook button size
     *
     * @return array[]
     */
    public function getFacebookButtonSize()
    {
        return [
            [
                'label' => __('small'),
                'value' => 'small'
            ],
            [
                'label' => __('large'),
                'value' => 'large'
            ]
        ];
    }
}
