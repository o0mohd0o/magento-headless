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

class FacebookComments extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $general = parent::prepareGeneralTab();

            $general->addChildren(
                'page_url',
                'text',
                [
                    'sortOrder'       => 10,
                    'key'             => 'page_url',
                    'defaultValue'    => 'https://www.facebook.com/facebook',
                    'templateOptions' => [
                        'label' => __('Facebook Page URL'),
                        'note'  => __('The absolute URL that comments posted in the plugin will be permanently associated with. All stories shared on Facebook about comments posted using the comments plugin will link to this URL.')
                    ]
                ]
            );

            $general->addChildren(
                'num_posts',
                'number',
                [
                    'sortOrder'       => 20,
                    'key'             => 'num_posts',
                    'defaultValue'    => 5,
                    'templateOptions' => [
                       'label' => __('Number of Posts'),
                       'note'  => __('The number of comments to show by default.')
                    ]
                ]
            );

        return $general;
    }
}
