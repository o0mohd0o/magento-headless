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

class Icon extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareIconTab();
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
                    'icon',
                    'icon',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'icon',
                        'defaultValue'    => 'fas mgz-fa-adjust',
                        'templateOptions' => [
                            'label' => __('Icon')
                        ]
                    ]
                );

                $container1->addChildren(
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

            $general->addChildren(
                'link_url',
                'link',
                [
                    'sortOrder'       => 20,
                    'key'             => 'link_url',
                    'templateOptions' => [
                        'label' => __('URL')
                    ]
                ]
            );

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareIconTab()
    {
        $icon = $this->addTab(
            'icon_design',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Icon Design')
                ]
            ]
        );

               $colors = $icon->addTab(
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
                            'icon_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'icon_color',
                                'templateOptions' => [
                                    'label' => __('Icon Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'icon_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'icon_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'icon_border_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'icon_border_color',
                                'templateOptions' => [
                                    'label' => __('Border Color')
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
                            'icon_hover_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'icon_hover_color',
                                'templateOptions' => [
                                    'label' => __('Icon Color')
                                ]
                            ]
                        );

                        $color2->addChildren(
                            'icon_hover_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'icon_hover_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                        $color2->addChildren(
                            'icon_hover_border_color',
                            'color',
                            [
                                'sortOrder'       => 30,
                                'key'             => 'icon_hover_border_color',
                                'templateOptions' => [
                                    'label' => __('Border Color')
                                ]
                            ]
                        );

            $container1 = $icon->addContainerGroup(
                'container1',
                [
                    'sortOrder' => 20
                ]
            );

                $container1->addChildren(
                    'icon_border_width',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'icon_border_width',
                        'templateOptions' => [
                            'label' => __('Border Width')
                        ]
                    ]
                );

                $container1->addChildren(
                    'icon_border_radius',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'icon_border_radius',
                        'defaultValue'    => '5px',
                        'templateOptions' => [
                            'label' => __('Border Radius')
                        ]
                    ]
                );

                $container1->addChildren(
                    'icon_border_style',
                    'select',
                    [
                        'key'             => 'icon_border_style',
                        'sortOrder'       => 30,
                        'defaultValue'    => 'solid',
                        'templateOptions' => [
                            'label'   => __('Border Style'),
                            'options' => $this->getBorderStyle()
                        ]
                    ]
                );

            $icon->addChildren(
                'icon_css',
                'code',
                [
                    'sortOrder'       => 30,
                    'key'             => 'icon_css',
                    'templateOptions' => [
                        'label' => __('Inline CSS')
                    ]
                ]
            );

        return $icon;
    }

    /**
     * @return array
     */
    public function getDefaultValues()
    {
        return [
            'align' => 'center'
        ];
    }
}
