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

namespace Magezon\PageBuilder\Data\Element;

class TwitterButton extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * @return \Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
        $general = parent::prepareGeneralTab();

            $general->addChildren(
                'button_type',
                'select',
                [
                    'sortOrder'       => 10,
                    'key'             => 'button_type',
                    'defaultValue'    => 'share',
                    'templateOptions' => [
                        'label'   => __('Button Type'),
                        'options' => $this->getButtonType()
                    ]
                ]
            );

            $share = $general->addContainer(
                'share',
                [
                    'sortOrder'      => 10,
                    'hideExpression' => 'model.button_type!="share"'
                ]
            );

                $share->addChildren(
                    'page_url',
                    'toggle',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'page_url',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Share url: page URL'),
                            'note'  => __('Use the current page url to share?')
                        ]
                    ]
                );

                $share->addChildren(
                    'share_use_custom_url',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'share_use_custom_url',
                        'templateOptions' => [
                            'label' => __('Share url: custom URL'),
                            'note'  => __('Enter custom page url which you like to share on twitter?')
                        ],
                        'hideExpression' => 'model.page_url'
                    ]
                );

                $share->addChildren(
                    'share_text_page_title',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'share_text_page_title',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Tweet text: page title'),
                            'note'  => __('Use the current page title as tweet text?')
                        ]
                    ]
                );

                $share->addChildren(
                    'share_text_custom_text',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'share_text_custom_text',
                        'templateOptions' => [
                            'label' => __('Tweet text: custom text'),
                            'note'  => __('Enter the text to be used as a tweet?')
                        ],
                        'hideExpression' => 'model.share_text_page_title'
                    ]
                );

                $share->addChildren(
                    'share_via',
                    'text',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'share_via',
                        'templateOptions' => [
                            'label' => __('Via @'),
                            'note'  => __('Enter your Twitter username.')
                        ]
                    ]
                );

                $share->addChildren(
                    'share_recommend',
                    'text',
                    [
                        'sortOrder'       => 40,
                        'key'             => 'share_recommend',
                        'templateOptions' => [
                            'label' => __('Recommend @'),
                            'note'  => __('Enter the Twitter username to be recommended.')
                        ]
                    ]
                );

                $share->addChildren(
                    'share_hashtag',
                    'text',
                    [
                        'sortOrder'       => 50,
                        'key'             => 'share_hashtag',
                        'templateOptions' => [
                            'label' => __('Hashtag #'),
                            'note'  => __('Add a comma-separated list of hashtags to a Tweet using the hashtags parameter.')
                        ]
                    ]
                );

            $follow = $general->addContainer(
                'follow',
                [
                    'sortOrder'      => 10,
                    'hideExpression' => 'model.button_type!="follow"'
                ]
            );

                $follow->addChildren(
                    'follow_user',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'follow_user',
                        'templateOptions' => [
                            'label' => __('User @'),
                            'note'  => __('Enter username to follow.')
                        ]
                    ]
                );

                $follow->addChildren(
                    'follow_show_username',
                    'toggle',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'follow_show_username',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show username')
                        ]
                    ]
                );

                $follow->addChildren(
                    'show_followers_count',
                    'toggle',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'show_followers_count',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Show followers count'),
                            'note'  => __('Do you want to display the follower count in button?')
                        ]
                    ]
                );

            $hashtag = $general->addContainer(
                'hashtag',
                [
                    'sortOrder'      => 10,
                    'hideExpression' => 'model.button_type!="hashtag"'
                ]
            );

                $hashtag->addChildren(
                    'hashtag_hash',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'hashtag_hash',
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Hashtag #'),
                            'note'  => __('Add hashtag to a Tweet using the hashtags parameter')
                        ]
                    ]
                );

                $hashtag->addChildren(
                    'hashtag_tweet_text',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'hashtag_tweet_text',
                        'templateOptions' => [
                            'label' => __('Tweet Text'),
                            'note'  => __('Set custom text for tweet.')
                        ]
                    ]
                );

                $hashtag->addChildren(
                    'hashtag_recommend_1',
                    'text',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'hashtag_recommend_1',
                        'templateOptions' => [
                            'label' => __('Recommend @'),
                            'note'  => __('Enter username to be recommended.')
                        ]
                    ]
                );

                $hashtag->addChildren(
                    'hashtag_recommend_2',
                    'text',
                    [
                        'sortOrder'       => 40,
                        'key'             => 'hashtag_recommend_2',
                        'templateOptions' => [
                            'label' => __('Recommend @'),
                            'note'  => __('Enter username to be recommended.')
                        ]
                    ]
                );

                $hashtag->addChildren(
                    'hashtag_tweet_url',
                    'text',
                    [
                        'sortOrder'       => 50,
                        'key'             => 'hashtag_tweet_url',
                        'templateOptions' => [
                            'label' => __('Tweet Url')
                        ]
                    ]
                );

            $mention = $general->addContainer(
                'mention',
                [
                    'sortOrder'      => 10,
                    'hideExpression' => 'model.button_type!="mention"'
                ]
            );

                $mention->addChildren(
                    'mention_tweet_to',
                    'text',
                    [
                        'sortOrder'       => 10,
                        'key'             => 'mention_tweet_to',
                        'templateOptions' => [
                            'label' => __('Tweet to @'),
                            'note'  => __('Enter username where you want to send your tweet.')
                        ]
                    ]
                );

                $mention->addChildren(
                    'mention_tweet_text',
                    'text',
                    [
                        'sortOrder'       => 20,
                        'key'             => 'mention_tweet_text',
                        'templateOptions' => [
                            'label' => __('Tweet Text'),
                            'note'  => __('Enter custom text for the tweet.')
                        ]
                    ]
                );

                $mention->addChildren(
                    'mention_recommend_1',
                    'text',
                    [
                        'sortOrder'       => 30,
                        'key'             => 'mention_recommend_1',
                        'templateOptions' => [
                            'label' => __('Recommend @'),
                            'note'  => __('Enter username to recommend.')
                        ]
                    ]
                );

                $mention->addChildren(
                    'mention_recommend_2',
                    'text',
                    [
                        'sortOrder'       => 40,
                        'key'             => 'mention_recommend_2',
                        'templateOptions' => [
                            'label' => __('Recommend @'),
                            'note'  => __('Enter username to recommend.')
                        ]
                    ]
                );

            $general->addChildren(
                'large_button',
                'toggle',
                [
                    'sortOrder'       => 20,
                    'key'             => 'large_button',
                    'defaultValue'    => true,
                    'templateOptions' => [
                        'label' => __('Use large button'),
                        'note'  => __('Do you like to display a larger Tweet button?')
                    ]
                ]
            );

            $general->addChildren(
                'lang',
                'select',
                [
                    'sortOrder'       => 30,
                    'key'             => 'lang',
                    'defaultValue'    => 'en',
                    'templateOptions' => [
                        'label'   => __('Language'),
                        'options' => $this->getLanguages(),
                        'note'    => __('Select button display language or allow it to be automatically defined by user preferences.')
                    ]
                ]
            );

        return $general;
    }

    /**
     * @return array[]
     */
    public function getButtonType()
    {
        return [
            [
                'label' => __('Share a link'),
                'value' => 'share'
            ],
            [
                'label' => __('Follow'),
                'value' => 'follow'
            ],
            [
                'label' => __('Hashtag'),
                'value' => 'hashtag'
            ],
            [
                'label' => __('Mention'),
                'value' => 'mention'
            ]
        ];
    }

    /**
     * @return array[]
     */
    public function getLanguages()
    {
        return [
            [
                'label' => __('English'),
                'value' => 'en'
            ],
            [
                'label' => __('Arabic'),
                'value' => 'ar'
            ],
            [
                'label' => __('Bengali'),
                'value' => 'bn'
            ],
            [
                'label' => __('Czech'),
                'value' => 'cs'
            ],
            [
                'label' => __('Danish'),
                'value' => 'da'
            ],
            [
                'label' => __('German'),
                'value' => 'de'
            ],
            [
                'label' => __('Greek'),
                'value' => 'el'
            ],
            [
                'label' => __('Spanish'),
                'value' => 'es'
            ],
            [
                'label' => __('Persian'),
                'value' => 'fa'
            ],
            [
                'label' => __('Finnish'),
                'value' => 'fi'
            ],
            [
                'label' => __('Filipino'),
                'value' => 'fil'
            ],
            [
                'label' => __('French'),
                'value' => 'fr'
            ],
            [
                'label' => __('Hebrew'),
                'value' => 'he'
            ],
            [
                'label' => __('Hindi'),
                'value' => 'hi'
            ],
            [
                'label' => __('Hungarian'),
                'value' => 'hu'
            ],
            [
                'label' => __('Indonesian'),
                'value' => 'id'
            ],
            [
                'label' => __('Italian'),
                'value' => 'it'
            ],
            [
                'label' => __('Japanese'),
                'value' => 'ja'
            ],
            [
                'label' => __('Korean'),
                'value' => 'ko'
            ],
            [
                'label' => __('Malay'),
                'value' => 'msa'
            ],
            [
                'label' => __('Dutch'),
                'value' => 'nl'
            ],
            [
                'label' => __('Norwegian'),
                'value' => 'no'
            ],
            [
                'label' => __('Polish'),
                'value' => 'pl'
            ],
            [
                'label' => __('Portuguese'),
                'value' => 'pt'
            ],
            [
                'label' => __('Romanian'),
                'value' => 'ro'
            ],
            [
                'label' => __('Russian'),
                'value' => 'ru'
            ],
            [
                'label' => __('Swedish'),
                'value' => 'sv'
            ],
            [
                'label' => __('Thai'),
                'value' => 'th'
            ],
            [
                'label' => __('Turkish'),
                'value' => 'tr'
            ],
            [
                'label' => __('Ukrainian'),
                'value' => 'uk'
            ],
            [
                'label' => __('Urdu'),
                'value' => 'ur'
            ],
            [
                'label' => __('Vietnamese'),
                'value' => 'vi'
            ],
            [
                'label' => __('Chinese (Simplified)'),
                'value' => 'zh-cn'
            ],
            [
                'label' => __('Chinese (Traditional)'),
                'value' => 'zh-tw'
            ]
        ];
    }
}
