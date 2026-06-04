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

namespace Magezon\PageBuilder\Block\Element;

class Video extends \Magezon\Builder\Block\Element
{
    protected $_link;

    /**
     * @var \Magezon\Core\Helper\Data
     */
    protected $coreHelper;

    /**
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magezon\Core\Helper\Data                        $coreHelper
     * @param array                                            $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magezon\Core\Helper\Data $coreHelper,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->coreHelper = $coreHelper;
    }

    /**
     * @return boolean
     */
    public function isEnabled()
    {
        if (!$this->getVideoLink()) {
            return;
        }
        return parent::isEnabled();
    }

    public function getVideoId()
    {
        $id = '';
        $element = $this->getElement();
        $link    = $element->getData('link');
        if (strpos($link, 'youtube')!==false || strpos($link, 'youtu.be')!==false || strpos($link, 'vimeo')!==false) {
            if ((strpos($link, 'youtube')!==false || strpos($link, 'youtu.be')!==false) && (!$element->getData('show_preview_image') || ($element->getData('show_preview_image') && !$element->getData('lightbox')))) {
                if ($element->getData('youtube_privacy')) {
                    $link = str_replace('youtube.com', 'youtube-nocookie.com', $link);
                }
                $id = $this->getYoutubeVideoId($link);
            }
        }
        return $id;
    }

    public function getYoutubeVideoId($link)
    {
        preg_match('/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/', $link, $matches);
        return ($matches && isset($matches[7])) ? $matches[7] : '';
    }

    /**
     * @return string
     */
    public function getVideoLink()
    {
        if ($this->_link === null) {
            $element = $this->getElement();
            $link    = $element->getData('link');
            if (strpos($link, 'youtube')!==false || strpos($link, 'youtu.be')!==false || strpos($link, 'vimeo')!==false) {
                if ((strpos($link, 'youtube')!==false || strpos($link, 'youtu.be')!==false) && (!$element->getData('show_preview_image') || ($element->getData('show_preview_image') && !$element->getData('lightbox')))) {
                    $link = 'https://www.youtube.com/embed/' . $this->getVideoId();
                    if ($element->getData('youtube_privacy')) {
                        $link = str_replace('youtube.com', 'youtube-nocookie.com', $link);
                    }
                }
                if ((strpos($link, 'vimeo')!==false)) {
                    $link = str_replace('vimeo.com', 'player.vimeo.com/video', $link);
                }
            } else {
                $link = '';
            }
            if ($link) {
                $params = http_build_query($this->getVideoLinkParams());
                if ($element->getData('video_type') == 'vimeo') {
                    if ((int)$element->getStartAt()) {
                        $params .= '#t=' . (int)$element->getStartAt() . 's';
                    }
                }
                $link .= '?' . $params;
            }
            if (strpos($element->getData('link'), '.mp4')!==false) {
                $link = $this->coreHelper->filter($element->getData('link'));
            }
            $this->_link = $link;
        }
        return $this->_link;
    }

    /**
     * @return array
     */
    public function getVideoLinkParams()
    {
        $element = $this->getElement();
        if ($element->getData('autoplay')) {
            $params['autoplay'] = 1;
        }
        $params['loop'] = $element->getData('loop') ? 1 : 0;

        if ($element->getData('video_type') == 'youtube') {
            $params['mute']           = $element->getData('mute') ? 1 : 0;
            $params['controls']       = $element->getData('controls') ? 1 : 0;
            $params['modestbranding'] = $element->getData('modest_branding') ? 1 : 0;
            $params['rel']            = $element->getData('related_videos') ? 1 : 0;
            if ($element->getData('start_at')) {
                $params['start'] = (int)$element->getData('start_at');
            }
            if ($element->getData('end_at')) {
                $params['end'] = (int)$element->getData('end_at');
            }
            if ($element->getData('autoplay')) {
                $params['mute'] = '1';
            }
            if ($element->getData('loop')) {
                $params['playlist'] = $this->getVideoId();
            }
        }
        if ($element->getData('video_type') == 'vimeo') {
            $params['muted']     = $element->getData('mute') ? 1 : 0;
            $params['controls']  = $element->getData('controls') ? 1 : 0;
            $params['title']     = $element->getData('vimeo_title') ? 1 : 0;
            $params['portrait']  = $element->getData('vimeo_portrait') ? 1 : 0;
            $params['byline']    = $element->getData('vimeo_byline') ? 1 : 0;
            $videoColor = $element->getData('video_color');
            $params['color']     = !empty($videoColor) ? str_replace('#', '', $element->getData('video_color')) : '';
            $params['api']       = 1;
            $params['player_id'] = 'player';
            $params['autopause'] = 'false';
        }
        return $params;
    }

    /**
     * @return string
     */
    public function getAdditionalStyleHtml()
    {
        $element   = $this->getElement();
        $styleHtml = $this->getLineStyles();

        if ($element->getShowPlayIcon()) {
            $styles              = [];
            $styles['font-size'] = $this->getStyleProperty($element->getData('play_icon_size'));
            $styles['color']     = $this->getStyleColor($element->getData('play_icon_color'));
            $styleHtml .= $this->getStyles('.mgz-video-embed-play i', $styles);
        }

        if ($element->getData('video_title')) {
            $styles                = [];
            $styles['font-weight'] = $element->getData('video_title_font_weight');
            $styles['color']       = $this->getStyleColor($element->getData('video_title_color'));
            $styles['font-size']   = $this->getStyleProperty($element->getData('video_title_font_size'));
            $styles['margin-top']  = $this->getStyleProperty($this->getStyleProperty($element->getData('video_title_spacing')));
            $styleHtml .= $this->getStyles('.mgz-video-title', $styles);
        }

        if ($element->getData('video_description')) {
            $styles                = [];
            $styles['font-weight'] = $element->getData('video_description_font_weight');
            $styles['color']       = $this->getStyleColor($element->getData('video_description_color'));
            $styles['font-size']   = $this->getStyleProperty($element->getData('video_description_font_size'));
            $styles['margin-top']  = $this->getStyleProperty($this->getStyleProperty($element->getData('video_description_spacing')));
            $styleHtml .= $this->getStyles('.mgz-video-description', $styles);
        }

        if ($element->getLightbox() && $element->getLightboxWidth()) {
            $target    = '.' . $element->getHtmlId();
            $styleHtml .= $target . '-popup .mfp-content{';
                $styleHtml .= 'width: ' . $this->getStyleProperty($element->getLightboxWidth()) . ';';
                $styleHtml .= 'max-width: 100%;';
            $styleHtml .= '}';
        }

        return $styleHtml;
    }
}
