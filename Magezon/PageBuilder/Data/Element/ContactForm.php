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

class ContactForm extends \Magezon\Builder\Data\Element\AbstractElement
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
                    'sortOrder' => 20
                ]
            );

                $container1->addChildren(
                    'form_width',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'form_width',
                        'templateOptions' => [
                            'label'   => __('Width')
                        ]
                    ]
                );

                $container1->addChildren(
                    'show_title',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'show_title',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label'   => __('Show Title')
                        ]
                    ]
                );

                $container1->addChildren(
                    'show_description',
                    'toggle',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'show_description',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label'   => __('Show Description')
                        ]
                    ]
                );

        return $general;
    }

    /**
     * @return string[]
     */
    public function getDefaultValues()
    {
        return [
            'align' => 'center'
        ];
    }
}
