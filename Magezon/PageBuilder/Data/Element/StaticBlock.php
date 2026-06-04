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

class StaticBlock extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $general = parent::prepareGeneralTab();

            $general->addChildren(
                'block_id',
                'uiSelect',
                [
                    'sortOrder'       => 10,
                    'key'             => 'block_id',
                    'templateOptions' => [
                        'label'       => __('Block'),
                        'source'      => 'block',
                        'showValue'   => true,
                        'placeholder' => __('Search block by name or id')
                    ]
                ]
            );

        return $general;
    }
}
