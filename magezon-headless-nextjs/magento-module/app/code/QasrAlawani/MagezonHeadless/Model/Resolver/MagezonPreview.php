<?php
/**
 * QasrAlawani_MagezonHeadless
 *
 * Resolver for: Query.magezonPreview(builder_id)
 *
 * Returns the LIVE, unsaved builder content that the Magezon admin persists to
 * mgz_pagebuilder_preview_profile on every edit (keyed by builder_id). The
 * headless preview page polls this so editors see their changes rendered by the
 * REAL Next.js components, exactly like Magezon's own storefront live preview.
 *
 * `builder_id` is treated as a capability token (same model as Magezon's public
 * mgzpagebuilder/preview controller). It is a hard-to-guess unique id; harden
 * with an admin token check if your threat model requires it.
 *
 * Read directly from the table via ResourceConnection so we don't hard-depend on
 * Magezon's preview model classes (the table is created by Magezon_PageBuilderPreview).
 */
declare(strict_types=1);

namespace QasrAlawani\MagezonHeadless\Model\Resolver;

use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Framework\App\ResourceConnection;
use Magento\Store\Api\Data\StoreInterface;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\UrlInterface;
use Magento\Framework\Serialize\Serializer\Json;
use QasrAlawani\MagezonHeadless\Model\MagezonProfileExtractor;

class MagezonPreview implements ResolverInterface
{
    private const TABLE = 'mgz_pagebuilder_preview_profile';

    /** @var ResourceConnection */
    private $resource;

    /** @var StoreManagerInterface */
    private $storeManager;

    /** @var MagezonProfileExtractor */
    private $extractor;

    /** @var Json */
    private $json;

    public function __construct(
        ResourceConnection $resource,
        StoreManagerInterface $storeManager,
        MagezonProfileExtractor $extractor,
        Json $json
    ) {
        $this->resource = $resource;
        $this->storeManager = $storeManager;
        $this->extractor = $extractor;
        $this->json = $json;
    }

    /**
     * @inheritDoc
     */
    public function resolve(Field $field, $context, ResolveInfo $info, ?array $value = null, ?array $args = null)
    {
        $builderId = isset($args['builder_id']) ? trim((string) $args['builder_id']) : '';
        if ($builderId === '') {
            throw new GraphQlInputException(__('"builder_id" is required.'));
        }

        /** @var StoreInterface $store */
        $store = $this->storeManager->getStore();

        $row = $this->loadRow($builderId);
        if (!$row) {
            return [
                'identifier' => $builderId,
                'title' => null,
                'has_pagebuilder' => false,
                'profile_json' => null,
                'media_base_url' => $store->getBaseUrl(UrlInterface::URL_TYPE_MEDIA),
                'raw_html' => '',
                'updated_at' => null,
            ];
        }

        $extracted = $this->extractor->extractPayload((string) $row['content']);

        return [
            'identifier' => $builderId,
            'title' => __('Live Preview')->render(),
            'has_pagebuilder' => $extracted['has_pagebuilder'],
            'profile_json' => $extracted['has_pagebuilder']
                ? $this->json->serialize([
                    'elements' => $extracted['elements'],
                    'custom_css' => $extracted['custom_css'],
                    'custom_classes' => $extracted['custom_classes'],
                ])
                : null,
            'media_base_url' => $store->getBaseUrl(UrlInterface::URL_TYPE_MEDIA),
            'raw_html' => '',
            // The poller compares this to detect edits.
            'updated_at' => $row['update_time'] ?? null,
        ];
    }

    private function loadRow(string $builderId): ?array
    {
        try {
            $connection = $this->resource->getConnection();
            $table = $this->resource->getTableName(self::TABLE);
            $select = $connection->select()
                ->from($table, ['content', 'update_time'])
                ->where('builder_id = ?', $builderId)
                ->order('profile_id DESC')
                ->limit(1);
            $row = $connection->fetchRow($select);
            return $row ?: null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
