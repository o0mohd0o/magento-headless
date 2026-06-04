<?php
/**
 * Magezon
 *
 * This source file is subject to the Magezon Software License, which is available at https://www.magezon.com/license.
 * Do not edit or add to this file if you wish to upgrade the to newer versions in the future.
 * If you wish to customize this module for your needs.
 * Please refer to https://www.magezon.com for more information.
 *
 * @category  Magezon
 * @package   Magezon_PageBuilderPageableContainer
 * @author    quanth@magezon.com
 * @copyright Copyright (C) 2020 Magezon (https://www.magezon.com)
*/

namespace Magezon\PageBuilderPageableContainer\Data\Element;

class PageableContainer extends \Magezon\Builder\Data\Element\AbstractElement
{
    /**
     * Prepare modal components
     */
    public function prepareForm()
    {
    	parent::prepareForm();
        $this->prepareCarouselTab();
    	return $this;
    }

    /**
     * @return Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareGeneralTab()
    {
    	$general = parent::prepareGeneralTab();

    		$container1 = $general->addContainerGroup(
	            'container1',
	            [
					'sortOrder' => 10
	            ]
		    );

		    	$container1->addChildren(
		            'owl_active',
		            'number',
		            [
						'sortOrder'       => 20,
						'key'             => 'owl_active',
						'defaultValue'    => 1,
                        'min'             => 0,
						'templateOptions' => [
							'label'        => __('Active Slider'),
							'tooltip'      => __('Enter active item number. Leave empty or enter non-existing number to close all tabs on page load.'),
							'tooltipClass' => 'tooltip-bottom-right'
		                ]
		            ]
		        );

    	return $general;
    }

    /**
     * @return Magezon\Builder\Data\Form\Element\Fieldset
     */
    public function prepareCarouselTab($sortOrder = 80)
    {
        $carousel = $this->addTab(
            'tab_carousel',
            [
                'sortOrder'       => $sortOrder,
                'templateOptions' => [
                    'label' => __('Carousel Options')
                ]
            ]
        );

            $colors = $carousel->addTab(
                'colors',
                [
                    'sortOrder'       => 10,
                    'templateOptions' => [
                        'label' => __('Colors')
                    ]
                ]
            );

                $normal = $colors->addContainerGroup(
                    'normal',
                    [
                        'sortOrder'       => 10,
                        'templateOptions' => [
                            'label' => __('Normal')
                        ]
                    ]
                );

                    $color1 = $normal->addContainerGroup(
                        'color1',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $color1->addChildren(
                            'color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'owl_color',
                                'templateOptions' => [
                                    'label' => __('Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'owl_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                $hover = $colors->addContainerGroup(
                    'hover',
                    [
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label' => __('Hover')
                        ]
                    ]
                );

                    $color1 = $hover->addContainerGroup(
                        'color1',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $color1->addChildren(
                            'hover_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'owl_hover_color',
                                'templateOptions' => [
                                    'label' => __('Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'hover_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'owl_hover_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );

                $active = $colors->addContainerGroup(
                    'active',
                    [
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label' => __('Active')
                        ]
                    ]
                );

                    $color1 = $active->addContainerGroup(
                        'color1',
                        [
                            'sortOrder' => 10
                        ]
                    );

                        $color1->addChildren(
                            'active_color',
                            'color',
                            [
                                'sortOrder'       => 10,
                                'key'             => 'owl_active_color',
                                'templateOptions' => [
                                    'label' => __('Color')
                                ]
                            ]
                        );

                        $color1->addChildren(
                            'active_background_color',
                            'color',
                            [
                                'sortOrder'       => 20,
                                'key'             => 'owl_active_background_color',
                                'templateOptions' => [
                                    'label' => __('Background Color')
                                ]
                            ]
                        );


            $container3 = $carousel->addContainerGroup(
                'container3',
                [
                    'sortOrder' => 50
                ]
            );

                $container3->addChildren(
                    'nav',
                    'toggle',
                    [
                        'key'             => 'owl_nav',
                        'sortOrder'       => 10,
                        'defaultValue'    => false,
                        'templateOptions' => [
                            'label' => __('Navigation Buttons')
                        ]
                    ]
                );

                $container3->addChildren(
                    'nav_position',
                    'select',
                    [
                        'key'             => 'owl_nav_position',
                        'sortOrder'       => 20,
                        'defaultValue'    => 'center_split',
                        'templateOptions' => [
                            'label'   => __('Navigation Position'),
                            'options' => $this->getNavigationPosition()
                        ]
                    ]
                );

                $container3->addChildren(
                    'nav_size',
                    'select',
                    [
                        'key'             => 'owl_nav_size',
                        'sortOrder'       => 30,
                        'defaultValue'    => 'normal',
                        'templateOptions' => [
                            'label'   => __('Navigation Size'),
                            'options' => $this->getNavigationSize()
                        ]
                    ]
                );

            $container4 = $carousel->addContainerGroup(
                'container4',
                [
                    'sortOrder' => 60
                ]
            );

                $container4->addChildren(
                    'dots',
                    'toggle',
                    [
                        'key'             => 'owl_dots',
                        'sortOrder'       => 10,
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Dots Navigation')
                        ]
                    ]
                );

                $container4->addChildren(
                    'dots_insie',
                    'toggle',
                    [
                        'key'             => 'owl_dots_insie',
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label' => __('Dots Inside')
                        ],
                        'expressionProperties' => [
                            'templateOptions.disabled' => '!model.owl_dots'
                        ]
                    ]
                );

                $container4->addChildren(
                    'dots_speed',
                    'number',
                    [
                        'key'             => 'owl_dots_speed',
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label' => __('Dots Speed')
                        ]
                    ]
                );

            $container5 = $carousel->addContainerGroup(
                'container5',
                [
                    'sortOrder' => 70
                ]
            );

                $container5->addChildren(
                    'lazyload',
                    'toggle',
                    [
                        'key'             => 'owl_lazyload',
                        'sortOrder'       => 10,
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Lazyload')
                        ]
                    ]
                );

                $container5->addChildren(
                    'loop',
                    'toggle',
                    [
                        'key'             => 'owl_loop',
                        'sortOrder'       => 20,
                        'defaultValue'    => true,
                        'templateOptions' => [
                            'label' => __('Loop')
                        ]
                    ]
                );

                $container5->addChildren(
                    'margin',
                    'number',
                    [
                        'key'             => 'owl_margin',
                        'sortOrder'       => 30,
                        'defaultValue'    => '0',
                        'templateOptions' => [
                            'label' => __('Margin'),
                            'note'  => __('margin-right(px) on item.')
                        ]
                    ]
                );

            $container6 = $carousel->addContainerGroup(
                'container6',
                [
                    'sortOrder' => 80
                ]
            );

                $container6->addChildren(
                    'autoplay',
                    'toggle',
                    [
                        'key'             => 'owl_autoplay',
                        'sortOrder'       => 10,
                        'defaultValue'    => false,
                        'templateOptions' => [
                            'label' => __('Auto Play')
                        ]
                    ]
                );

                $container6->addChildren(
                    'autoplay_hover_pause',
                    'toggle',
                    [
                        'key'             => 'owl_autoplay_hover_pause',
                        'sortOrder'       => 20,
                        'templateOptions' => [
                            'label' => __('Pause on Mouse Hover')
                        ]
                    ]
                );

                $container6->addChildren(
                    'autoplay_timeout',
                    'text',
                    [
                        'key'             => 'owl_autoplay_timeout',
                        'defaultValue'    => '5000',
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label' => __('Auto Play Timeout')
                        ]
                    ]
                );

            $container7 = $carousel->addContainerGroup(
                'container7',
                [
                    'sortOrder' => 90
                ]
            );

                $container7->addChildren(
                    'owl_autoplay_speed',
                    'text',
                    [
                        'key'             => 'owl_autoplay_speed',
                        'sortOrder'       => 10,
                        'templateOptions' => [
                            'label' => __('Auto Play Speed')
                        ]
                    ]
                );

                $container7->addChildren(
                    'stage_padding',
                    'number',
                    [
                        'key'             => 'owl_stage_padding',
                        'sortOrder'       => 20,
                        'defaultValue'    => 0,
                        'templateOptions' => [
                            'label' => __('Stage Padding')
                        ]
                    ]
                );

                $container7->addChildren(
                    'margin',
                    'number',
                    [
                        'key'             => 'owl_margin',
                        'sortOrder'       => 30,
                        'templateOptions' => [
                            'label' => __('Margin'),
                            'note'  => __('margin-right(px) on item.')
                        ]
                    ]
                );

            $carousel->addChildren(
                'rtl',
                'toggle',
                [
                    'key'             => 'owl_rtl',
                    'sortOrder'       => 100,
                    'templateOptions' => [
                        'label' => __('Right To Left')
                    ]
                ]
            );


            $carousel->addChildren(
                'owl_animate_in',
                'select',
                [
                    'sortOrder'       => 110,
                    'key'             => 'owl_animate_in',
                    'className'       => 'mgz-inner-widthauto',
                    'templateOptions' => [
                        'templateUrl' => 'Magezon_Builder/js/templates/form/element/animation-style.html',
                        'element'     => 'Magezon_Builder/js/form/element/animation-in',
                        'label'       => __('Animation In')
                    ]
                ]
            );

            $carousel->addChildren(
                'owl_animate_out',
                'select',
                [
                    'sortOrder'       => 120,
                    'key'             => 'owl_animate_out',
                    'className'       => 'mgz-inner-widthauto',
                    'templateOptions' => [
                        'templateUrl' => 'Magezon_Builder/js/templates/form/element/animation-style.html',
                        'element'     => 'Magezon_Builder/js/form/element/animation-out',
                        'label'       => __('Animation Out')
                    ]
                ]
            );

        return $carousel;
    }
}