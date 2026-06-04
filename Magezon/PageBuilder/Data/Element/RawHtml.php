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

class RawHtml extends \Magezon\Builder\Data\Element\AbstractElement
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
                    'defaultValue'    => '<p>I am raw html block.<br/>Click edit button to change this html</p>',
                    'templateOptions' => [
                        'label' => __('Raw HTML'),
                        'rows'  => 16,
                        'note'  => __('Enter your HTML content.')
                    ]
                ]
            );

        return $general;
    }
}
