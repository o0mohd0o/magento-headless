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

namespace Magezon\PageBuilder\Ui\DataProvider\Product\Form\Modifier;

use Magento\Catalog\Api\Data\ProductAttributeInterface;
use Magento\Framework\Stdlib\ArrayManager;

class General extends \Magento\Catalog\Ui\DataProvider\Product\Form\Modifier\AbstractModifier
{
    /**
     * @var ArrayManager
     * @since 101.0.0
     */
    protected $arrayManager;

    /**
     * @param ArrayManager $arrayManager
     */
    public function __construct(
        ArrayManager $arrayManager
    ) {
        $this->arrayManager = $arrayManager;
    }

    /**
     * @since 101.0.0
     * @param array $data
     * @return array
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    public function modifyData(array $data)
    {
        return $data;
    }

    /**
     * @since 101.0.0
     * @param array $meta
     * @return array
     */
    public function modifyMeta(array $meta)
    {
        $path = $this->arrayManager->findPath(
            ProductAttributeInterface::CODE_SEO_FIELD_META_DESCRIPTION,
            $meta,
            null,
            'children'
        );
        $meta = $this->arrayManager->merge($path . static::META_CONFIG_PATH, $meta, [
            'component' => 'Magezon_PageBuilder/js/components/import-handler'
        ]);

        return $meta;
    }
}
