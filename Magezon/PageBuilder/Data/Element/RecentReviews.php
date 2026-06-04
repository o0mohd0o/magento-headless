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

class RecentReviews extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareCarouselTab();
        $this->prepareReviewTab();
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

            $general->addChildren(
                'max_items',
                'number',
                [
                    'sortOrder'       => 50,
                    'key'             => 'max_items',
                    'defaultValue'    => 12,
                    'templateOptions' => [
                        'label'   => __('Total Items')
                    ]
                ]
            );

            $general->addChildren(
                'product_id',
                'uiSelect',
                [
                    'sortOrder'       => 60,
                    'key'             => 'product_id',
                    'templateOptions' => [
                        'label'       => __('Product'),
                        'source'      => 'product',
                        'showValue'   => true,
                        'placeholder' => __('Search product by name or ID')
                    ]
                ]
            );

        return $general;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareReviewTab()
    {
        $tab = $this->addTab(
            'tab_review',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Review Options')
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
                    'review_title',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'review_title',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show Title')
                        ]
                    ]
                );

                $container1->addChildren(
                    'review_date',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'review_date',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show Date')
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
                    'review_customer',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'review_customer',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show Customer')
                        ]
                    ]
                );

                $container2->addChildren(
                    'review_rating_star',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'review_rating_star',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show Rating Star')
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
                    'review_product_name',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'review_product_name',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show Product Name')
                        ]
                    ]
                );

                $container3->addChildren(
                    'review_product_image',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'review_product_image',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show Product Image')
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
                    'review_content',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'review_content',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show Content')
                        ]
                    ]
                );

                $container4->addChildren(
                    'review_content_length',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'review_content_length',
                        'defaultValue'    => 300,
                        'templateOptions' => [
                            'label' => __('Character Limit'),
                            'note'  => __('If review text exceeds the character limit, View more link will be added.')
                        ]
                    ]
                );

            $container5 = $tab->addContainerGroup(
                'container5',
                [
                    'sortOrder' => 50
                ]
            );

                $container5->addChildren(
                    'equal_height',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'equal_height',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Equal Height')
                        ]
                    ]
                );

            $container6 = $tab->addContainerGroup(
                'container6',
                [
                    'sortOrder' => 60
                ]
            );

                $container6->addChildren(
                    'review_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'review_color',
                        'templateOptions' => [
                            'label' => __('Text Color')
                        ]
                    ]
                );

                $container6->addChildren(
                    'review_star_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'review_star_color',
                        'templateOptions' => [
                            'label' => __('Star Color')
                        ]
                    ]
                );

            $container7 = $tab->addContainerGroup(
                'container7',
                [
                    'sortOrder' => 70
                ]
            );

                $container7->addChildren(
                    'review_link_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'review_link_color',
                        'templateOptions' => [
                            'label' => __('Link Color')
                        ]
                    ]
                );

                $container7->addChildren(
                    'review_background_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'review_background_color',
                        'templateOptions' => [
                            'label' => __('Background Color')
                        ]
                    ]
                );

        return $tab;
    }

    /**
     * @return array
     */
    public function getDefaultValues()
    {
        return [
            'title'       => __('Recent Reviews'),
            'owl_item_xl' => 3,
            'owl_item_lg' => 3,
            'owl_item_md' => 2,
            'owl_item_sm' => 2,
            'owl_item_xs' => 1,
            'owl_margin'  => 15
        ];
    }
}
