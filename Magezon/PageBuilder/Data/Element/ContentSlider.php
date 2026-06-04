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

class ContentSlider extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareSlidersTab();
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
    public function prepareSlidersTab()
    {
        $testimonials = $this->addTab(
            'tab_sliders',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Sliders')
                ]
            ]
        );

            $items = $testimonials->addChildren(
                'items',
                'dynamicRows',
                [
                    'key'       => 'items',
                    'sortOrder' => 10
                ]
            );

                $container1 = $items->addContainerGroup(
                    'container1',
                    [
                        'sortOrder' => 10
                    ]
                );

                    $container1->addChildren(
                        'content',
                        'editor',
                        [
                            'key'             => 'content',
                            'sortOrder'       => 10,
                            'templateOptions' => [
                                'label'   => __('Content'),
                                'wysiwyg' => [
                                    'height' => '50px'
                                ]
                            ]
                        ]
                    );

                    $container4 = $container1->addContainer(
                        'container4',
                        [
                            'sortOrder' => 20,
                            'className' => 'mgz-dynamicrows-actions'
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

        return $testimonials;
    }

    /**
     * @return array
     */
    public function getDefaultValues()
    {
        return [
            'align'         => 'center',
            'owl_item_xl'   => 1,
            'owl_item_lg'   => 1,
            'owl_item_md'   => 1,
            'owl_item_sm'   => 1,
            'owl_item_xs'   => 1,
            'items'         => [
                [
                    'content' => 'Magento is the leading platform for open commerce innovation. Every year, Magento handles over $100 billion in gross merchandise volume. See what makes Magento number one'
                ],
                [
                    'content' => 'Magento successfully integrates digital and physical shopping experiences, delighting customers. In addition to it\'s flagship open source commerce platform, Magento boasts a strong portfolio of cloud-based omnichannel solutions including in-store, retail associate, and order management technologies.'
                ],
                [
                    'content' => 'Integrate multiple shopping experiences including Amazon and eBay. You can even manage all inventory and sales through a single product control and distribution system for your web stores.'
                ],
                [
                    'content' => 'Magento is so agile and user-friendly, you can launch your site quickly, adapt to market needs in real time, and achieve ROI faster than ever. And our experienced solution partners offer special design and implementation bundles for small business.'
                ],
                [
                    'content' => 'Reduce costs, track inventory sales metrics, and automate repetitive order management tasks through the Magento dashboard. Save hours of manual effort and put that time back into your business and eCommerce websites.'
                ]
            ]
        ];
    }
}
