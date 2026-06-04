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

namespace Magezon\PageBuilder\Model;

use Magento\Framework\App\ObjectManager;

class DefaultConfigProvider extends \Magezon\Builder\Model\DefaultConfigProvider
{
    /**
     * @return array
     */
    public function getConfig()
    {
        $config = parent::getConfig();
        $helper = ObjectManager::getInstance()->get(\Magezon\PageBuilder\Helper\Data::class);
        $config['profile'] = [
            'builder'     => \Magezon\PageBuilder\Block\Builder::class,
            'key'         => $helper->getKey(),
            'home'        => 'https://www.magezon.com/magezon-page-builder.html?utm_campaign=mgzbuilder&utm_source=mgz_user&utm_medium=backend',
            'templateUrl' => 'https://www.magezon.com/productfile/pagebuilder/templates.php'
        ];
        return $config;
    }
}
