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
 * @package   Magezon_PageBuilderPreview
 * @copyright Copyright (C) 2020 Magezon (https://www.magezon.com)
 */

namespace Magezon\PageBuilderPreview\Cron;

class ClearProfile
{
    const LIFETIME = 86400;

    /**
     * @var \Magento\Framework\App\ResourceConnection
     */
    protected $_resource;

    /**
     * @param \Magento\Framework\App\ResourceConnection $resource
     */
    public function __construct(
        \Magento\Framework\App\ResourceConnection $resource
    ) {
        $this->_resource = $resource;
    }

    /**
     * Clean expired quotes (cron process)
     *
     * @return void
     */
    public function execute()
    {
        // 3 days
        $lifetime   = 3 * self::LIFETIME;
        $connection = $this->_resource->getConnection();
        $table      = $this->_resource->getTableName('mgz_pagebuilder_preview_profile');
        $where      = ['update_time <= ?' => date("Y-m-d", time() - $lifetime)];
        $connection->delete($table, $where);
    }
}
