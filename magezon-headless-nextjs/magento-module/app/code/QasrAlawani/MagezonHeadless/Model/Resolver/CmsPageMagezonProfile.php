<?php
/**
 * QasrAlawani_MagezonHeadless
 *
 * Resolver for: CmsPage.magezon_profile_json
 *
 * Lets a single native `cmsPage` query return both the standard fields and the
 * decoded Magezon tree, e.g.:
 *
 *   query { cmsPage(identifier: "offers-page") { title magezon_profile_json } }
 */
declare(strict_types=1);

namespace QasrAlawani\MagezonHeadless\Model\Resolver;

use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Framework\Serialize\Serializer\Json;
use QasrAlawani\MagezonHeadless\Model\MagezonProfileExtractor;

class CmsPageMagezonProfile implements ResolverInterface
{
    /** @var MagezonProfileExtractor */
    private $extractor;

    /** @var Json */
    private $json;

    public function __construct(MagezonProfileExtractor $extractor, Json $json)
    {
        $this->extractor = $extractor;
        $this->json = $json;
    }

    /**
     * @inheritDoc
     */
    public function resolve(Field $field, $context, ResolveInfo $info, ?array $value = null, ?array $args = null)
    {
        // The native CmsPage resolver puts the page content on $value['content'].
        // Fall back gracefully if it isn't present.
        $content = is_array($value) && isset($value['content']) ? (string) $value['content'] : '';
        if ($content === '') {
            return null;
        }

        $extracted = $this->extractor->extract($content);
        if (!$extracted['has_pagebuilder']) {
            return null;
        }

        return $this->json->serialize([
            'elements' => $extracted['elements'],
            'custom_css' => $extracted['custom_css'],
            'custom_classes' => $extracted['custom_classes'],
        ]);
    }
}
