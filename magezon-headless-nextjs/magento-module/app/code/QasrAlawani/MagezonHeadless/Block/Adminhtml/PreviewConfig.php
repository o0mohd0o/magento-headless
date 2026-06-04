<?php
/**
 * QasrAlawani_MagezonHeadless
 *
 * Exposes the configured Next.js preview URL to the admin builder JS as
 * window.QASR_HEADLESS_PREVIEW, so the navbar directive knows where to open the
 * headless preview. Rendered on admin pages via adminhtml default.xml.
 */
declare(strict_types=1);

namespace QasrAlawani\MagezonHeadless\Block\Adminhtml;

use Magento\Backend\Block\Template;
use Magento\Backend\Block\Template\Context;
use Magento\Framework\App\Config\ScopeConfigInterface;

class PreviewConfig extends Template
{
    private const XML_BASE_URL = 'qasralawani_magezonheadless/preview/frontend_base_url';
    private const XML_PATH = 'qasralawani_magezonheadless/preview/preview_path';

    /** @var ScopeConfigInterface */
    private $scopeConfig;

    public function __construct(Context $context, ScopeConfigInterface $scopeConfig, array $data = [])
    {
        parent::__construct($context, $data);
        $this->scopeConfig = $scopeConfig;
    }

    public function getFrontendBaseUrl(): string
    {
        return rtrim((string) $this->scopeConfig->getValue(self::XML_BASE_URL), '/');
    }

    public function getPreviewPath(): string
    {
        $path = (string) $this->scopeConfig->getValue(self::XML_PATH);
        return $path !== '' ? $path : '/magezon-preview';
    }

    /** Don't emit the <script> at all when no base URL is configured. */
    public function isEnabled(): bool
    {
        return $this->getFrontendBaseUrl() !== '';
    }

    public function getJsonConfig(): string
    {
        return json_encode([
            'baseUrl' => $this->getFrontendBaseUrl(),
            'path' => $this->getPreviewPath(),
        ], JSON_UNESCAPED_SLASHES);
    }
}
