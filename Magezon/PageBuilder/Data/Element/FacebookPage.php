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

class FacebookPage extends \Magezon\Builder\Data\Element\AbstractElement
{
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
                    'page_url',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'page_url',
                        'defaultValue'    => 'https://www.facebook.com/facebook',
                        'templateOptions' => [
                            'label'       => __('Facebook Page URL'),
                            'placeholder' => __('The URL of the Facebook Page')
                        ]
                    ]
                );

                $container1->addChildren(
                    'page_tabs',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'page_tabs',
                        'defaultValue'    => 'timeline',
                        'templateOptions' => [
                            'label'       => __('Tabs'),
                            'placeholder' => 'e.g., timeline, messages, events'
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
                    'page_width',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'page_width',
                        'templateOptions' => [
                            'label' => __('Width'),
                            'note'  => __('The pixel width of the embed (Min. 180 to Max. 500)')
                        ]
                    ]
                );

                $container2->addChildren(
                    'page_height',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'page_height',
                        'templateOptions' => [
                            'label' => __('Height'),
                            'note'  => __('The pixel width of the embed (Min. 180 to Max. 500)')
                        ]
                    ]
                );

            $container3 = $general->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 30
                ]
            );

                $container3->addChildren(
                    'small_header',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'small_header',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label'   => __('Use Small Header'),
                            'tooltip' => __('Uses a smaller version of the page header')
                        ]
                    ]
                );

                $container3->addChildren(
                    'hide_cover',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'hide_cover',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label'   => __('Hide Cover Photo'),
                            'tooltip' => __('Hide the cover photo in the header')
                        ]
                    ]
                );

            $container4 = $general->addContainerGroup(
                'container4',
                [
                    'sortOrder' => 40
                ]
            );

                $container4->addChildren(
                    'adapt_container_width',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'adapt_container_width',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label'   => __('Adapt to plugin container width'),
                            'tooltip' => __('Plugin will try to fit inside the container')
                        ]
                    ]
                );

                $container4->addChildren(
                    'show_facepile',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'show_facepile',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label'   => __('Show Friend\'s Faces'),
                            'tooltip' => __('Show profile photos when friends like this')
                        ]
                    ]
                );

        return $general;
    }
}
