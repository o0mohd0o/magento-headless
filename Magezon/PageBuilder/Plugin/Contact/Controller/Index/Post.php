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

namespace Magezon\PageBuilder\Plugin\Contact\Controller\Index;

use Magento\Framework\Controller\Result\Redirect;

class Post
{
    /**
     * @var \Magento\Framework\App\Response\RedirectInterface
     */
    protected $redirect;

    /**
     * @param \Magento\Framework\App\Response\RedirectInterface $redirect
     */
    public function __construct(
        \Magento\Framework\App\Response\RedirectInterface $redirect
    ) {
        $this->redirect = $redirect;
    }

    public function afterExecute(
        $subject,
        $result
    ) {
        if ($subject->getRequest()->getParam('mgz') && $result instanceof Redirect) {
            $result->setUrl($this->redirect->getRefererUrl());
        }
        return $result;
    }
}
