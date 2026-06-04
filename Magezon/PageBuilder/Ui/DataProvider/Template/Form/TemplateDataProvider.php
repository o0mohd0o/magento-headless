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

namespace Magezon\PageBuilder\Ui\DataProvider\Template\Form;

use Magezon\PageBuilder\Model\ResourceModel\Template\CollectionFactory;
use Magento\Framework\App\Request\DataPersistorInterface;

class TemplateDataProvider extends \Magento\Ui\DataProvider\AbstractDataProvider
{
    /**
     * @var \Magezon\PageBuilder\Model\ResourceModel\Template\Collection
     */
    protected $collection;

    /**
     * @var array
     */
    protected $loadedData;

    /**
     * @var DataPersistorInterface
     */
    protected $dataPersistor;

    /**
     * @var \Magento\Framework\Registry
     */
    protected $registry;

    /**
     * @param string                      $name
     * @param string                      $primaryFieldName
     * @param string                      $requestFieldName
     * @param \Magento\Framework\Registry $registry
     * @param CollectionFactory           $templateCollectionFactory
     * @param DataPersistorInterface      $dataPersistor
     * @param array                       $meta
     * @param array                       $data
     */
    public function __construct(
        $name,
        $primaryFieldName,
        $requestFieldName,
        \Magento\Framework\Registry $registry,
        CollectionFactory $templateCollectionFactory,
        DataPersistorInterface $dataPersistor,
        array $meta = [],
        array $data = []
    ) {
        $this->collection    = $templateCollectionFactory->create();
        $this->registry      = $registry;
        $this->dataPersistor = $dataPersistor;
        parent::__construct($name, $primaryFieldName, $requestFieldName, $meta, $data);
        $this->meta = $this->prepareMeta($this->meta);
    }

    /**
     * Prepares Meta
     *
     * @param array $meta
     * @return array
     */
    public function prepareMeta(array $meta)
    {
        return $meta;
    }

    /**
     * Get data
     *
     * @return array
     */
    public function getData()
    {
        if (isset($this->loadedData)) {
            return $this->loadedData;
        }

        $template = $this->getCurrentTemplate();
        if ($template && $template->getId()) {
            $this->loadedData[$template->getId()] = $template->getData();
        }

        $data = $this->dataPersistor->get('current_template');
        if (!empty($data)) {
            $template = $this->collection->getNewEmptyItem();
            $template->setData($data);
            $this->loadedData[$template->getId()] = $template->getData();
            $this->dataPersistor->clear('current_template');
        }

        return $this->loadedData;
    }

    /**
     * Get current template
     *
     * @return \Magezon\PageBuilder\Model\Template
     */
    public function getCurrentTemplate()
    {
        return $this->registry->registry('current_template');
    }
}
