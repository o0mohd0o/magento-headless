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

namespace Magezon\PageBuilder\Model\Source;

class TemplateList implements \Magezon\Builder\Model\Source\ListInterface
{
    /**
     * @var \Magezon\PageBuilder\Model\TemplateFactory
     */
    protected $templateFactory;

    /**
     * @var \Magento\PageBuilder\Model\ResourceModel\Template\CollectionFactory
     */
    protected $collectionFactory;

    /**
     * @param \Magezon\PageBuilder\Model\TemplateFactory                          $templateFactory
     * @param \Magezon\PageBuilder\Model\ResourceModel\Template\CollectionFactory $collectionFactory
     */
    public function __construct(
        \Magezon\PageBuilder\Model\TemplateFactory $templateFactory,
        \Magezon\PageBuilder\Model\ResourceModel\Template\CollectionFactory $collectionFactory
    ) {
        $this->templateFactory   = $templateFactory;
        $this->collectionFactory = $collectionFactory;
    }

    /**
     * Get Item
     *
     * @param string $id
     * @return array
     */
    public function getItem($id)
    {
        $data = [];
        $template = $this->templateFactory->create();
        $template->load($id);
        if ($template->getId()) {
            $data = [
                'label'   => $template->getName(),
                'value'   => $template->getId(),
                'profile' => $template->getProfile()
            ];
        }
        return $data;
    }

    /**
     * Get list
     *
     * @param string $q
     * @param string $field
     * @return array
     */
    public function getList($q = '', $field = '')
    {
        $list = [];
        $collection = $this->collectionFactory->create();
        $collection->setOrder('name', 'ASC');
        if ($q) {
            if (is_array($q)) {
                $collection->addFieldToFilter('template_id', ['in' => $q]);
            } elseif (is_numeric($q)) {
                $collection->addFieldToFilter('template_id', $q);
            } else {
                $collection->addFieldToFilter('name', ['like' => '%' . $q . '%']);
            }
        }
        foreach ($collection as $item) {
            $list[] = [
                'label'   => $item->getName(),
                'value'   => $item->getId(),
                'profile' => $item->getProfile()
            ];
        }
        return $list;
    }
}
