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

class RawJs extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $general = parent::prepareGeneralTab();

            $general->addChildren(
                'content',
                'textarea',
                [
                    'sortOrder'       => 10,
                    'key'             => 'content',
                    'defaultValue'    => '<script> alert("Hello world!" ); </script>',
                    'templateOptions' => [
                        'label' => __('JavaScript Code'),
                        'rows'  => 16,
                        'note'  => __('Enter your JavaScript code.')
                    ]
                ]
            );

        return $general;
    }
}
