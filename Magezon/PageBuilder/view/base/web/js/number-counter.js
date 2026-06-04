define([
    'jquery',
    'jquery-ui-modules/widget'
], function ($) {
    'use strict';

    $.widget('magezon.numberCounter', {
        options: {
            layout: '',
            type: 'standard',
            number: 100,
            max: 100,
            speed: 1000,
            delay: 0.5,
            format: {
                decimal: '.',
                thousands_sep: ','
            }
        },

        _create: function () {
            this.layout      = this.options.layout;
            this.type        = this.options.type;
            this.number      = this.options.number;
            this.radius      = this.options.radius;
            this.max         = this.options.max;
            this.speed       = this.options.speed;
            this.delay       = this.options.delay;
            this.format      = this.options.format;
            if (this.element.data('number')) {
                this.number = parseFloat(this.element.data('number'));
            }
            this._initNumber();
        },

        _initNumber: function() {
            var self = this;
            if (!this.element.hasClass('mgz-waypoint')) {
                self._initCount();
            } else {
                this.element.on('mgz:animation:run', function() {
                    self._initCount();
                });
            }
        },

        _initCount: function() {
            var $number = this.element.find('.mgz-numbercounter-string');
            if (!isNaN(this.delay) && this.delay > 0) {
                setTimeout(function() {
                    if (this.layout == 'circle') {
                        this._triggerCircle();
                    } else if (this.layout == 'bars') {
                        this._triggerBar();
                    }
                    this._countNumber();
                }.bind(this), this.delay * 1000);
            } else {
                if (this.layout == 'circle') {
                    this._triggerCircle();
                } else if (this.layout == 'bars') {
                    this._triggerBar();
                }
                this._countNumber();
            }
        },

        _countNumber: function() {
            var $number = this.element.find('.mgz-numbercounter-string'),
                $string = $number.find('.mgz-numbercounter-int'),
                current = 0,
                self = this;
            if (!this.animated) {
                $string.prop('Counter', 0).animate({
                    Counter: this.number
                }, {
                    duration: this.speed,
                    easing: 'swing',
                    step: function(now, fx) {
                        $string.text(self._formatNumber(now, fx));
                    },
                    complete: function() {
                        self.animated = true;
                    }
                });
            }
        },

        _triggerCircle: function() {
            var $bar = this.element.find('.mgz-element-bar'),
                r = this.radius,
                circle = Math.PI * (r * 2),
                val = this.number,
                max = this.type == 'percent' ? 100 : this.max;
            if (val < 0) {
                val = 0;
            }
            if (val > max) {
                val = max;
            }
            if (this.type == 'percent') {
                var pct = ((100 - val) / 100) * circle;
            } else {
                var pct = (1 - (val / max)) * circle;
            }
            $bar.animate({
                strokeDashoffset: pct
            }, {
                duration: this.speed,
                easing: 'swing',
                complete: function() {
                    this.animated = true;
                }
            });
        },

        _triggerBar: function() {
            var $bar = this.element.find('.mgz-numbercounter-bar');
            if (this.type == 'percent') {
                var number = this.number > 100 ? 100 : this.number;
            } else {
                var number = Math.ceil((this.number / this.max) * 100);
            }
            if (!this.animated) {
                $bar.animate({
                    width: number + '%'
                }, {
                    duration: this.speed,
                    easing: 'swing',
                    complete: function() {
                        this.animated = true;
                    }
                });
            }
        },

        _formatNumber: function(n, fx) {
            var rgx = /(\d+)(\d{3})/,
                num = fx.end.toString().split('.'),
                decLimit = 0;
            if (1 == num.length) {
                n = parseInt(n);
            } else if (num.length > 1) {
                decLimit = num[1].length > 2 ? 2 : num[1].length;
            }
            n += '';
            var x = n.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? parseFloat(parseFloat('.' + x[1]).toFixed(decLimit)) : '';
            x2 = '' != x2 ? this.format.decimal + x2.toString().split('.').pop() : '';
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + this.format.thousands_sep + '$2');
            }
            return x1 + x2;
        },
    });

    return $.magezon.numberCounter;
});