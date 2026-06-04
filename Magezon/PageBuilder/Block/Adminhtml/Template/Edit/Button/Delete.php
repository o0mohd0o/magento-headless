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

namespace Magezon\PageBuilder\Block\Adminhtml\Template\Edit\Button;

class Delete extends Generic
{
    /**
     * @return array
     */
    public function getButtonData()
    {
        $data = [];
        if ($this->getCurrentTemplate()->getId() && $this->_isAllowedAction('Magezon_PageBuilder::template_delete')) {
            $data = [
                'label'    => __('Delete'),
                'class'    => 'delete',
                'on_click' => 'deleteConfirm(\'' . __(
                    'Are you sure you want to do this?'
                ) . '\', \'' . $this->getUrl('*/*/delete', ['template_id' => $this->getCurrentTemplate()->getId()]) . '\')',
                'sort_order' => 20
            ];
        }
        return $data;
    }
}
