<?php
/**
 * QasrAlawani_MagezonHeadless
 *
 * Resolver for: Query.magezonContent(identifier, type)
 */
declare(strict_types=1);

namespace QasrAlawani\MagezonHeadless\Model\Resolver;

use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Cms\Api\GetPageByIdentifierInterface;
use Magento\Cms\Api\GetBlockByIdentifierInterface;
use Magento\Store\Api\Data\StoreInterface;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\UrlInterface;
use Magento\Framework\Serialize\Serializer\Json;
use QasrAlawani\MagezonHeadless\Model\MagezonProfileExtractor;

class MagezonContent implements ResolverInterface
{
    /** @var GetPageByIdentifierInterface */
    private $getPageByIdentifier;

    /** @var GetBlockByIdentifierInterface */
    private $getBlockByIdentifier;

    /** @var StoreManagerInterface */
    private $storeManager;

    /** @var MagezonProfileExtractor */
    private $extractor;

    /** @var Json */
    private $json;

    public function __construct(
        GetPageByIdentifierInterface $getPageByIdentifier,
        GetBlockByIdentifierInterface $getBlockByIdentifier,
        StoreManagerInterface $storeManager,
        MagezonProfileExtractor $extractor,
        Json $json
    ) {
        $this->getPageByIdentifier = $getPageByIdentifier;
        $this->getBlockByIdentifier = $getBlockByIdentifier;
        $this->storeManager = $storeManager;
        $this->extractor = $extractor;
        $this->json = $json;
    }

    /**
     * @inheritDoc
     */
    public function resolve(Field $field, $context, ResolveInfo $info, ?array $value = null, ?array $args = null)
    {
        $identifier = isset($args['identifier']) ? trim((string) $args['identifier']) : '';
        if ($identifier === '') {
            throw new GraphQlInputException(__('"identifier" is required.'));
        }
        $type = $args['type'] ?? 'CMS_PAGE';

        /** @var StoreInterface $store */
        $store = $this->storeManager->getStore();
        $storeId = (int) $store->getId();

        $title = null;
        $content = '';

        try {
            if ($type === 'CMS_BLOCK') {
                $block = $this->getBlockByIdentifier->execute($identifier, $storeId);
                $title = $block->getTitle();
                $content = (string) $block->getContent();
            } else {
                $page = $this->getPageByIdentifier->execute($identifier, $storeId);
                $title = $page->getTitle();
                $content = (string) $page->getContent();
            }
        } catch (\Throwable $e) {
            // Unknown identifier -> return an empty, well-formed result rather than erroring.
            return $this->emptyResult($identifier, $store);
        }

        $extracted = $this->extractor->extract($content);

        return [
            'identifier' => $identifier,
            'title' => $title,
            'has_pagebuilder' => $extracted['has_pagebuilder'],
            'profile_json' => $extracted['has_pagebuilder']
                ? $this->json->serialize([
                    'elements' => $extracted['elements'],
                    'custom_css' => $extracted['custom_css'],
                    'custom_classes' => $extracted['custom_classes'],
                ])
                : null,
            'media_base_url' => $store->getBaseUrl(UrlInterface::URL_TYPE_MEDIA),
            'raw_html' => $extracted['raw_html'],
        ];
    }

    private function emptyResult(string $identifier, StoreInterface $store): array
    {
        return [
            'identifier' => $identifier,
            'title' => null,
            'has_pagebuilder' => false,
            'profile_json' => null,
            'media_base_url' => $store->getBaseUrl(UrlInterface::URL_TYPE_MEDIA),
            'raw_html' => '',
        ];
    }
}
