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

class Toggle extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $general = parent::prepareGeneralTab();

            $general->addChildren(
                'toggle_title',
                'text',
                [
                    'sortOrder'       => 10,
                    'key'             => 'toggle_title',
                    'defaultValue'    => 'Toggle title',
                    'templateOptions' => [
                        'label'   => __('Toggle Title')
                    ]
                ]
            );

            $general->addChildren(
                'toggle_content',
                'editor',
                [
                    'sortOrder'       => 20,
                    'key'             => 'toggle_content',
                    'defaultValue'    => 'Toggle Content',
                    'templateOptions' => [
                        'label'   => __('Toggle content goes here, click edit button to change this text.')
                    ]
                ]
            );

            $general->addChildren(
                'icon',
                'icon',
                [
                    'sortOrder'       => 30,
                    'key'             => 'icon',
                    'className'       => 'mgz-width10',
                    'defaultValue'    => 'fas mgz-fa-plus',
                    'templateOptions' => [
                        'label' => __('Icon')
                    ]
                ]
            );

            $general->addChildren(
                'active_icon',
                'icon',
                [
                    'sortOrder'       => 40,
                    'key'             => 'active_icon',
                    'defaultValue'    => 'fas mgz-fa-minus',
                    'templateOptions' => [
                        'label' => __('Active Icon')
                    ]
                ]
            );

            $container1 = $general->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 50
                ]
            );

                $container1->addChildren(
                    'icon_style',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'icon_style',
                        'defaultValue'    => 'default',
                        'templateOptions' => [
                            'label'   => __('Icon Style'),
                            'options' => $this->getIconStyle()
                        ]
                    ]
                );

                $container1->addChildren(
                    'icon_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'icon_color',
                        'defaultValue'    => '#333',
                        'templateOptions' => [
                            'label' => __('Icon Color')
                        ]
                    ]
                );

                $container1->addChildren(
                    'icon_size',
                    'select',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'icon_size',
                        'defaultValue'    => 'md',
                        'templateOptions' => [
                            'label'   => __('Icon Size'),
                            'options' => $this->getSizeList()
                        ]
                    ]
                );

            $general->addChildren(
                'open',
                'select',
                [
                    'sortOrder'       => 60,
                    'key'             => 'open',
                    'defaultValue'    => false,
                    'templateOptions' => [
                        'label'   => __('Default state'),
                        'options' => $this->getDefaultState()
                    ]
                ]
            );

        return $general;
    }

    /**
     * @return array[]
     */
    public function getIconStyle()
    {
        return [
            [
                'label' => __('Default'),
                'value' => 'default'
            ],
            [
                'label' => __('Round'),
                'value' => 'round'
            ],
            [
                'label' => __('Round Outline'),
                'value' => 'round_outline'
            ],
            [
                'label' => __('Square'),
                'value' => 'square'
            ],
            [
                'label' => __('Square Outline'),
                'value' => 'square_outline'
            ],
            [
                'label' => __('Text Only'),
                'value' => 'text_only'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getDefaultState()
    {
        return [
            [
                'label' => __('Closed'),
                'value' => false
            ],
            [
                'label' => __('Open'),
                'value' => true
            ]
        ];
    }
}
