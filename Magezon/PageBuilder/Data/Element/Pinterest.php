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

class Pinterest extends \Magezon\Builder\Data\Element\AbstractElement
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
                    'show_pin_counts',
                    'select',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'show_pin_counts',
                        'defaultValue'    => 'above',
                        'templateOptions' => [
                            'label'   => __('Show Pin counts'),
                            'options' => $this->getShowPinCounts()
                        ]
                    ]
                );

                $container1->addChildren(
                    'button_round',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'button_round',
                        'templateOptions' => [
                            'label' => __('Button Round')
                        ]
                    ]
                );

                $container1->addChildren(
                    'button_large',
                    'toggle',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'button_large',
                        'templateOptions' => [
                            'label' => __('Button Large')
                        ]
                    ]
                );

        return $general;
    }

    /**
     * @return array
     */
    public function getShowPinCounts()
    {
        return [
            [
                'label' => 'above',
                'value' => 'above'
            ],
            [
                'label' => 'beside',
                'value' => 'beside'
            ],
            [
                'label' => 'not shown',
                'value' => 'not shown'
            ]
        ];
    }
}
