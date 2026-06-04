<?php
/**
 * Magezon
 *
 * This source file is subject to the Magezon Software License, which is available at https://www.magezon.com/license.
 * Do not edit or add to this file if you wish to upgrade the to newer versions in the future.
 * If you wish to customize this module for your needs.
 * Please refer to https://www.magezon.com for more information.
 *
 * @category  Magezon
 * @package   Magezon_PageBuilderPageableContainer
 * @author    quanth@magezon.com
 * @copyright Copyright (C) 2020 Magezon (https://www.magezon.com)
*/

namespace Magezon\PageBuilderPageableContainer\Data\Element;

class Item extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * @return Magezon\Builder\Data\Form\Element\Fieldset
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
						'label' => __('Title')
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
            'title'          => __('Item')
    	];
    }
}