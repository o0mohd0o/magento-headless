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

class Instagram extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
        parent::prepareForm();
        $this->prepareInstagramTab();
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

        return $general;
    }

    /**
     * Add Instagram option tab to element
     *
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareInstagramTab()
    {
        $tab = $this->addTab(
            'tab_instagram',
            [
                'sortOrder'       => 50,
                'templateOptions' => [
                    'label' => __('Instagram Options')
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
            'max_items',
            'number',
            [
                'sortOrder'       => 30,
                'key'             => 'max_items',
                'defaultValue'    => 10,
                'templateOptions' => [
                    'label' => __('Number of photos')
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
            'onclick',
            'select',
            [
                'sortOrder'       => 10,
                'key'             => 'onclick',
                'defaultValue'    => 'magnific',
                'templateOptions' => [
                    'label'   => __('On click action'),
                    'options' => $this->getOnclickOptions()
                ]
            ]
        );

        $container2->addChildren(
            'link_target',
            'select',
            [
                'sortOrder'       => 20,
                'key'             => 'link_target',
                'defaultValue'    => '_self',
                'templateOptions' => [
                    'label'   => __('Link Target'),
                    'options' => $this->getLinkTarget()
                ]
            ]
        );

        $container2->addChildren(
            'gap',
            'number',
            [
                'sortOrder'       => 30,
                'key'             => 'gap',
                'defaultValue'    => 15,
                'templateOptions' => [
                    'label' => __('Gap')
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
            'instagram_username',
            'text',
            [
                'sortOrder'       => 10,
                'key'             => 'instagram_username',
                'defaultValue'    => 'baoctmgz',
                'templateOptions' => [
                    'label' => __('Instagram Username')
                ]
            ]
        );

        $container3->addChildren(
            'link_text',
            'text',
            [
                'sortOrder'       => 10,
                'key'             => 'link_text',
                'defaultValue'    => 'Follow Us!',
                'templateOptions' => [
                    'label' => __('Link Text')
                ]
            ]
        );

        $container3->addChildren(
            'overlay_color',
            'color',
            [
                'sortOrder'       => 20,
                'key'             => 'overlay_color',
                'templateOptions' => [
                    'label' => __('Overlay Color')
                ]
            ]
        );

        $container3->addChildren(
            'hover_effect',
            'select',
            [
                'sortOrder'       => 30,
                'key'             => 'hover_effect',
                'defaultValue'    => 'zoomin',
                'templateOptions' => [
                    'label'   => __('Hover Effect'),
                    'options' => $this->getHoverEffect()
                ]
            ]
        );
        return $tab;
    }

    /**
     * @return array
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
     * @return array
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
                'label' => __('PhotoSwipe'),
                'value' => 'photoswipe'
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
    public function getLinkTarget()
    {
        return [
            [
                'label' => __('Same window'),
                'value' => '_self'
            ],
            [
                'label' => __('New window'),
                'value' => '_blank'
            ]
        ];
    }

    /**
     * @return array
     */
    public function getDefaultValues()
    {
        return [
            'title' => __('Instagram'),
            'item_xl' => 12,
            'item_lg' => 12,
            'item_md' => 6,
            'item_sm' => 5,
            'item_xs' => 4
        ];
    }
}
