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

class Testimonials extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareStyleTab();
        $this->prepareTestimonialsTab();
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
                'testimonial_type',
                'select',
                [
                    'sortOrder'       => 10,
                    'key'             => 'testimonial_type',
                    'defaultValue'    => 'type1',
                    'templateOptions' => [
                        'label'   => __('Type'),
                        'options' => $this->getTestimonialType()
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

            $box = $tab->addContainerGroup(
                'box_content',
                [
                    'sortOrder'       => 10,
                    'templateOptions' => [
                        'label'       => __('Box'),
                        'collapsible' => true
                    ]
                ]
            );

                $box->addChildren(
                    'box_border_radius',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'box_border_radius',
                        'templateOptions' => [
                            'label' => __('Box Border Radius')
                        ]
                    ]
                );

                $box->addChildren(
                    'box_background_color',
                    'color',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'box_background_color',
                        'templateOptions' => [
                            'label' => __('Box Background Color')
                        ]
                    ]
                );

                $box->addChildren(
                    'box_color',
                    'color',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'box_color',
                        'templateOptions' => [
                            'label' => __('Box Color')
                        ]
                    ]
                );

            $image = $tab->addContainerGroup(
                'image_container',
                [
                    'sortOrder'       => 20,
                    'templateOptions' => [
                        'label'       => __('Image'),
                        'collapsible' => true
                    ]
                ]
            );

                $image->addChildren(
                    'image_width',
                    'number',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'image_width',
                        'defaultValue'    => 90,
                        'templateOptions' => [
                            'label' => __('Image Size')
                        ]
                    ]
                );

                $image->addChildren(
                    'image_border_radius',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'image_border_radius',
                        'templateOptions' => [
                            'label' => __('Image Border Radius')
                        ]
                    ]
                );

            $content = $tab->addContainer(
                'content_container',
                [
                    'sortOrder'       => 30,
                    'templateOptions' => [
                        'label'       => __('Content'),
                        'collapsible' => true
                    ]
                ]
            );

                $container1 = $content->addContainerGroup(
                    'container1',
                    [
                        'sortOrder' => 10
                    ]
                );

                    $container1->addChildren(
                        'content_color',
                        'color',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'content_color',
                            'templateOptions' => [
                                'label' => __('Content Color')
                            ]
                        ]
                    );

                    $container1->addChildren(
                        'content_font_size',
                        'number',
                        [
                            'sortOrder'       => 20,
                            'key'             => 'content_font_size',
                            'templateOptions' => [
                                'label' => __('Content Font Size')
                            ]
                        ]
                    );

                $container2 = $content->addContainerGroup(
                    'container2',
                    [
                        'sortOrder' => 20
                    ]
                );

                    $container2->addChildren(
                        'content_font_weight',
                        'number',
                        [
                            'sortOrder'       => 10,
                            'key'             => 'content_font_weight',
                            'templateOptions' => [
                                'label' => __('Content Font Weight')
                            ]
                        ]
                    );

                    $container2->addChildren(
                        'content_align',
                        'select',
                        [
                            'key'             => 'content_align',
                            'sortOrder'       => 20,
                            'templateOptions' => [
                                'label'   => __('Content Alignment'),
                                'options' => $this->getAlignOptions()
                            ]
                        ]
                    );

            $name = $tab->addContainerGroup(
                'name_container',
                [
                    'sortOrder'       => 40,
                    'templateOptions' => [
                        'label'       => __('Name'),
                        'collapsible' => true
                    ]
                ]
            );

                $name->addChildren(
                    'name_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'name_color',
                        'templateOptions' => [
                            'label' => __('Name Color')
                        ]
                    ]
                );

                $name->addChildren(
                    'name_font_size',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'name_font_size',
                        'templateOptions' => [
                            'label' => __('Name Font Size')
                        ]
                    ]
                );

                $name->addChildren(
                    'name_font_weight',
                    'number',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'name_font_weight',
                        'templateOptions' => [
                            'label' => __('Name Font Weight')
                        ]
                    ]
                );

            $job = $tab->addContainerGroup(
                'job_container',
                [
                    'sortOrder'       => 50,
                    'templateOptions' => [
                        'label'       => __('Job'),
                        'collapsible' => true
                    ]
                ]
            );

                $job->addChildren(
                    'job_color',
                    'color',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'job_color',
                        'templateOptions' => [
                            'label' => __('Job Color')
                        ]
                    ]
                );

                $job->addChildren(
                    'job_font_size',
                    'number',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'job_font_size',
                        'templateOptions' => [
                            'label' => __('Job Font Size')
                        ]
                    ]
                );

                $job->addChildren(
                    'job_font_weight',
                    'number',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'job_font_weight',
                        'templateOptions' => [
                            'label' => __('Job Font Weight')
                        ]
                    ]
                );

        return $tab;
    }

    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareTestimonialsTab()
    {
        $testimonials = $this->addTab(
            'tab_testimonials',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Testimonials')
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
                        'templateOptions' => [
                            'sortOrder' => 10
                        ]
                    ]
                );

                    $container1->addChildren(
                        'image',
                        'image',
                        [
                            'key'             => 'image',
                            'sortOrder'       => 10,
                            'className'       => 'mgz-width20',
                            'templateOptions' => [
                                'label' => __('Image')
                            ]
                        ]
                    );

                    $container2 = $container1->addContainer(
                        'container2',
                        [
                            'sortOrder' => 20,
                            'className' => 'mgz-width80'
                        ]
                    );

                        $container3 = $container2->addContainerGroup(
                            'container3',
                            [
                                'sortOrder' => 10
                            ]
                        );

                            $container3->addChildren(
                                'name',
                                'text',
                                [
                                    'key'             => 'name',
                                    'sortOrder'       => 10,
                                    'className'       => 'mgz-width40',
                                    'templateOptions' => [
                                        'label' => __('Name')
                                    ]
                                ]
                            );

                            $container3->addChildren(
                                'job',
                                'text',
                                [
                                    'key'             => 'job',
                                    'sortOrder'       => 20,
                                    'className'       => 'mgz-width30',
                                    'templateOptions' => [
                                        'label' => __('Job')
                                    ]
                                ]
                            );

                            $container3->addChildren(
                                'link',
                                'text',
                                [
                                    'key'             => 'link',
                                    'sortOrder'       => 30,
                                    'className'       => 'mgz-width30',
                                    'templateOptions' => [
                                        'label' => __('Link')
                                    ]
                                ]
                            );

                        $container2->addChildren(
                            'content',
                            'textarea',
                            [
                                'key'             => 'content',
                                'sortOrder'       => 20,
                                'templateOptions' => [
                                    'label' => __('Content'),
                                    'rows'  => 3
                                ]
                            ]
                        );

                        $container4 = $container2->addContainerGroup(
                            'container4',
                            [
                                'sortOrder' => 30
                            ]
                        );

                            $container4->addChildren(
                                'box_background_color',
                                'color',
                                [
                                    'sortOrder'       => 10,
                                    'key'             => 'box_background_color',
                                    'templateOptions' => [
                                        'label' => __('Box Background Color')
                                    ]
                                ]
                            );

                            $container4->addChildren(
                                'box_color',
                                'color',
                                [
                                    'sortOrder'       => 20,
                                    'key'             => 'box_color',
                                    'templateOptions' => [
                                        'label' => __('Box Color')
                                    ]
                                ]
                            );

                    $container3 = $container1->addContainer(
                        'container3',
                        [
                            'sortOrder' => 30,
                            'className' => 'mgz-dynamicrows-actions'
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

        return $testimonials;
    }

    /**
     * @return array[]
     */
    public function getTestimonialType()
    {
        return [
            [
                'label' => __('Type1'),
                'value' => 'type1'
            ],
            [
                'label' => __('Type2'),
                'value' => 'type2'
            ],
            [
                'label' => __('Type3'),
                'value' => 'type3'
            ]
        ];
    }

    /**
     * @return array
     */
    public function getDefaultValues()
    {
        return [
            'title'       => __('Testimonials'),
            'owl_item_xl' => 1,
            'owl_item_lg' => 1,
            'owl_item_md' => 1,
            'owl_item_sm' => 1,
            'owl_item_xs' => 1,
            'items'       => [
                [
                    'name'    => 'Michael',
                    'job'     => 'Developer',
                    'image'   => 'wysiwyg/pagebuilder/testimonials2.png',
                    'content' => 'For months i tried many demo\'s out their from different vendors, but at the end i found that magezon is the best. The pagebuilder extensions comes preloaded with every thing, you dont need to buy addons for it such as elements as other builders does. Just pay one time and you get everything :)'
                ],
                [
                    'name'    => 'David',
                    'job'     => 'Designer',
                    'image'   => 'wysiwyg/pagebuilder/testimonials1.jpg',
                    'content' => 'Very happy with this extension, it has allowed me full control of my Product Page!!! Also I want to say, thank you for the great support. This developer is fast at not only fixing any user issues, they also take the time to explain why and how to fix. So you get educated. AAA++'
                ],
                [
                    'name'    => 'Rose',
                    'job'     => 'CEO',
                    'image'   => 'wysiwyg/pagebuilder/testimonials3.jpg',
                    'content' => 'We love Magezon Page Builder, it makes Magento site development so easy. We don’t have the time to spend tweaking our site, we are just too busy. Magezon Page Builder lets any of our team members log in and make changes without having a lot of coding knowledge.'
                ]
            ]
        ];
    }
}
