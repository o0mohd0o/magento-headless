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

namespace Magezon\PageBuilder\Plugin\Filter;

class Template
{
    /**
     * @var \Magezon\PageBuilder\Helper\Data
     */
    protected $dataHelper;

    /**
     * @param \Magezon\PageBuilder\Helper\Data $dataHelper
     */
    public function __construct(
        \Magezon\PageBuilder\Helper\Data $dataHelper
    ) {
        $this->dataHelper = $dataHelper;
    }

    /**
     * @param $subject
     * @param \Closure $proceed
     * @param $value
     * @return mixed
     */
    public function aroundFilter(
        $subject,
        \Closure $proceed,
        $value
    ) {
        $value = $this->dataHelper->filter($value);
        $result = $proceed($value);
        return $result;
    }
}
