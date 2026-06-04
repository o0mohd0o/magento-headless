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

class ProductSlider extends \Magezon\Builder\Data\Element\ProductList
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareConditionTab();
        $this->prepareCarouselTab();
        $this->prepareProductOptionsTab();
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
                    'sortOrder' => 20
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

        return $general;
    }

    /**
     * @return array
     */
    public function getDefaultValues()
    {
        return [
            'owl_item_xs' => 2
        ];
    }
}
