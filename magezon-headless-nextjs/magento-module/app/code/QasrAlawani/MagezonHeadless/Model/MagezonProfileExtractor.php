<?php
/**
 * QasrAlawani_MagezonHeadless
 *
 * Pulls a Magezon Page Builder profile out of CMS content (or a bare preview
 * payload) and returns the DECODED, fully-resolved element tree + page-level
 * settings (custom_css, custom_classes) as a PHP array.
 *
 * Resolution reuses Magezon's own helpers + Magento's CMS filter so the headless
 * output matches the storefront:
 *   - [mgz_pagebuilder]...[/mgz_pagebuilder] shortcode found exactly as on the storefront,
 *   - {{mgzlink type=... id=...}} tokens -> real URLs (prepareProfileBlock),
 *   - {{...}} CMS/widget directives inside text fields expanded (FilterProvider),
 *   - static_block (block_id) and pagebuilder_template (template_id) elements are
 *     INLINED (referenced CMS block / saved template loaded, resolved, attached),
 *   - page-level custom_css + custom_classes (the profile's Settings tab) returned
 *     so the headless renderer can reproduce them.
 */
declare(strict_types=1);

namespace QasrAlawani\MagezonHeadless\Model;

use Magezon\Builder\Helper\Data as BuilderHelper;
use Magezon\PageBuilder\Helper\Data as PageBuilderHelper;
use Magezon\PageBuilder\Block\Profile as ProfileBlock;
use Magento\Cms\Model\Template\FilterProvider;
use Magento\Cms\Model\BlockFactory;
use Magento\Framework\App\ResourceConnection;
use Magento\Store\Model\StoreManagerInterface;
use Psr\Log\LoggerInterface;

class MagezonProfileExtractor
{
    private const MAX_DEPTH = 16;
    private const MAX_INLINE_DEPTH = 4;
    private const TEMPLATE_TABLE = 'mgz_pagebuilder_template';

    private const EMPTY = [
        'has_pagebuilder' => false,
        'elements' => [],
        'raw_html' => '',
        'custom_css' => '',
        'custom_classes' => '',
    ];

    /** @var BuilderHelper */
    private $builderHelper;
    /** @var PageBuilderHelper */
    private $pageBuilderHelper;
    /** @var FilterProvider */
    private $filterProvider;
    /** @var BlockFactory */
    private $blockFactory;
    /** @var ResourceConnection */
    private $resource;
    /** @var StoreManagerInterface */
    private $storeManager;
    /** @var LoggerInterface */
    private $logger;

    public function __construct(
        BuilderHelper $builderHelper,
        PageBuilderHelper $pageBuilderHelper,
        FilterProvider $filterProvider,
        BlockFactory $blockFactory,
        ResourceConnection $resource,
        StoreManagerInterface $storeManager,
        LoggerInterface $logger
    ) {
        $this->builderHelper = $builderHelper;
        $this->pageBuilderHelper = $pageBuilderHelper;
        $this->filterProvider = $filterProvider;
        $this->blockFactory = $blockFactory;
        $this->resource = $resource;
        $this->storeManager = $storeManager;
        $this->logger = $logger;
    }

    /**
     * Extract from a full CMS content string (cms_page.content etc.).
     *
     * @return array{has_pagebuilder: bool, elements: array, raw_html: string, custom_css: string, custom_classes: string}
     */
    public function extract(?string $content): array
    {
        $result = $this->resolveContent((string) $content);
        if ($result['has_pagebuilder']) {
            $result['elements'] = $this->inlineReferences($result['elements'], 0);
        }
        return $result;
    }

    /**
     * Extract from a BARE profile payload (no [mgz_pagebuilder] wrapper) — the live
     * preview content, or a profile posted from the admin builder.
     *
     * @return array{has_pagebuilder: bool, elements: array, raw_html: string, custom_css: string, custom_classes: string}
     */
    public function extractPayload(?string $payload): array
    {
        $payload = (string) $payload;
        if ($payload === '') {
            return self::EMPTY;
        }
        $profile = $this->resolvePayload($payload);
        if ($profile === null) {
            return self::EMPTY;
        }
        return [
            'has_pagebuilder' => true,
            'elements' => $this->inlineReferences($profile['elements'], 0),
            'raw_html' => '',
            'custom_css' => $profile['custom_css'],
            'custom_classes' => $profile['custom_classes'],
        ];
    }

    // --- base resolution (no inlining) ------------------------------------

    /** @return array{has_pagebuilder: bool, elements: array, raw_html: string, custom_css: string, custom_classes: string} */
    private function resolveContent(string $content): array
    {
        $result = array_merge(self::EMPTY, ['raw_html' => $content]);
        if ($content === '') {
            return $result;
        }
        $key = method_exists($this->pageBuilderHelper, 'getKey')
            ? $this->pageBuilderHelper->getKey()
            : 'mgz_pagebuilder';
        $pattern = '/\[' . preg_quote($key, '/') . '\](.*?)\[\/' . preg_quote($key, '/') . '\]/si';

        if (!preg_match($pattern, $content, $matches)) {
            $result['raw_html'] = $this->expandHtml($content);
            return $result;
        }

        $profile = $this->resolvePayload($matches[1]);
        if ($profile === null) {
            return $result;
        }
        $result['has_pagebuilder'] = true;
        $result['elements'] = $profile['elements'];
        $result['custom_css'] = $profile['custom_css'];
        $result['custom_classes'] = $profile['custom_classes'];
        $result['raw_html'] = trim((string) preg_replace($pattern, '', $content));
        return $result;
    }

    /**
     * Decode + resolve a bare payload into base elements + page settings (no inlining).
     *
     * @return array{elements: array, custom_css: string, custom_classes: string}|null
     */
    private function resolvePayload(string $payload): ?array
    {
        try {
            $block = $this->builderHelper->prepareProfileBlock(ProfileBlock::class, $payload);
            $elements = $block->getData('elements');
            if (!is_array($elements)) {
                $elements = [];
            }
            return [
                'elements' => $this->expandDirectives($elements),
                'custom_css' => (string) $block->getData('custom_css'),
                'custom_classes' => (string) $block->getData('custom_classes'),
            ];
        } catch (\Throwable $e) {
            $this->logger->error('QasrAlawani_MagezonHeadless: profile decode failed: ' . $e->getMessage());
            return null;
        }
    }

    // --- inlining of referenced content -----------------------------------

    private function inlineReferences(array $elements, int $depth): array
    {
        if ($depth >= self::MAX_INLINE_DEPTH) {
            return $elements;
        }
        foreach ($elements as &$el) {
            if (!is_array($el) || !isset($el['type'])) {
                continue;
            }
            if ($el['type'] === 'static_block' && !empty($el['block_id'])) {
                $inlined = $this->loadCmsBlock((string) $el['block_id']);
                if ($inlined !== null) {
                    if ($inlined['has_pagebuilder']) {
                        $el['elements'] = array_merge($el['elements'] ?? [], $inlined['elements']);
                    } else {
                        $el['_inline_html'] = $inlined['raw_html'];
                    }
                }
            } elseif ($el['type'] === 'pagebuilder_template' && !empty($el['template_id'])) {
                $tree = $this->loadTemplate((string) $el['template_id']);
                if ($tree !== null) {
                    $el['elements'] = array_merge($el['elements'] ?? [], $tree);
                }
            }
            if (isset($el['elements']) && is_array($el['elements'])) {
                $el['elements'] = $this->inlineReferences($el['elements'], $depth + 1);
            }
        }
        return $elements;
    }

    /** @return array{has_pagebuilder: bool, elements: array, raw_html: string, custom_css: string, custom_classes: string}|null */
    private function loadCmsBlock(string $blockId): ?array
    {
        try {
            $storeId = (int) $this->storeManager->getStore()->getId();
            $block = $this->blockFactory->create();
            $block->setStoreId($storeId)->load($blockId);
            if (!$block->getId()) {
                $block = $this->blockFactory->create();
                $block->setStoreId($storeId)->load($blockId, 'identifier');
            }
            if (!$block->getId() || !$block->isActive()) {
                return null;
            }
            return $this->resolveContent((string) $block->getContent());
        } catch (\Throwable $e) {
            return null;
        }
    }

    /** @return array|null base elements of the saved template */
    private function loadTemplate(string $templateId): ?array
    {
        try {
            $connection = $this->resource->getConnection();
            $table = $this->resource->getTableName(self::TEMPLATE_TABLE);
            $select = $connection->select()
                ->from($table, ['profile'])
                ->where('template_id = ?', (int) $templateId)
                ->limit(1);
            $profile = $connection->fetchOne($select);
            if (!$profile) {
                return null;
            }
            $resolved = $this->resolvePayload((string) $profile);
            return $resolved === null ? null : $resolved['elements'];
        } catch (\Throwable $e) {
            return null;
        }
    }

    // --- directive expansion ----------------------------------------------

    private function expandDirectives($value, int $depth = 0)
    {
        if ($depth > self::MAX_DEPTH) {
            return $value;
        }
        if (is_array($value)) {
            foreach ($value as $k => $v) {
                $value[$k] = $this->expandDirectives($v, $depth + 1);
            }
            return $value;
        }
        if (is_string($value)) {
            return $this->expandHtml($value);
        }
        return $value;
    }

    /** Run a string through the CMS page filter only if it carries {{...}} directives. */
    private function expandHtml(string $value): string
    {
        if (strpos($value, '{{') === false || strpos($value, '}}') === false) {
            return $value;
        }
        try {
            return $this->filterProvider->getPageFilter()->filter($value);
        } catch (\Throwable $e) {
            return $value;
        }
    }
}
