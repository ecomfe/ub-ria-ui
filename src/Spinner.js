/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 输入框微调输入扩展
 * @author jiangyuan(jiangyuan01@baidu.com)
 */
define(
    function (require) {
        require('esui/validator/MaxLengthRule');
        require('esui/validator/MaxRule');
        require('esui/validator/MinRule');
        require('esui/validator/RequiredRule');
        require('esui/validator/PatternRule');

        var Extension = require('esui/Extension');
        var lib = require('esui/lib');
        var m = require('moment');
        var u = require('underscore');
        var helper = require('esui/controlHelper');
        var main = require('esui/main');
        var TextBox = require('esui/TextBox');
        var ValidityState = require('esui/validator/ValidityState');
        var Validity = require('esui/validator/Validity');

        var spinnerTpl = [
            '<div id="${scrollUpId}" class="${scrollUpClass}">',
            '<span>${scrollUp}</span>',
            '</div>',
            '<div id="${scrollDownId}" class="${scrollDownClass}">',
            '<span>${scrollDown}</span>',
            '</div>'
        ];

        /**
         * 解析数字类型方法
         * @param value
         * @returns {string}
         */
        function parseToNum (value) {
            if (value) {
                value = parseFloat(value)
            }
            return isNaN(value) ? '' : value;
        }

        /**
         *根据值得到mask对应的名称
         * @param {Object} mask
         * @param {String} value
         * @returns {String} text
         */
        function getMask (mask, value) {
            var text = null;
            if (u.isEmpty(mask)) {
                return text;
            }
            for (var key in mask) {
                if (mask.hasOwnProperty(key)) {
                    if (u.isArray(mask[key]) && u.contains(mask[key], value)) {
                        text = key;
                        break;

                    } else if (value == mask[key]) {
                        text = key;
                        break;
                    }
                }
            }
            return text;
        }

        /**
         * 由于mask的存在，主控件在设置value的时候，不能使用setValue()方法，需要使用本方法
         * @param textBox
         * @param value
         * @returns {text}
         */
        function setSpinnerValue (textBox, value) {
            textBox.spinnerValue = value;
            var mask = textBox.mask ? textBox.mask : {};
            var text = getMask(mask, value);
            text = text ? text : value;
            textBox.setValue(text);
        }

        /**
         * 由于mask的存在，主控件在获取value的时候，不能使用getValue()方法，需要使用本方法
         * @param textBox
         * @returns {text}
         */
        function getSpinnerValue (textBox) {
            var text = textBox.getValue();
            var spinnerValue = textBox.spinnerValue;
            var mask = textBox.mask ? textBox.mask : {};
            //防止用户手动修改值，需要在这里从主控件上得到值，同步一遍
            if (text != spinnerValue && text != getMask(mask, spinnerValue)) {
                for (var key in mask) {
                    if (mask.hasOwnProperty(key) && text == key) {
                        //如果用户真的输入了一个对应多个值的字符，那就默认用户选中第一个对应的值
                        u.isArray(mask[key]) ? text = mask[key][0] : text = mask[key];
                        break;
                    }
                }
                textBox.spinnerValue = text;
            }
            spinnerValue = textBox.spinnerValue;
            return spinnerValue;
        }

        /**
         * 更新日期类型方法
         * @param spinner
         * @param textBox
         * @param direct
         */
        function updateDate (spinner, textBox, direct) {
            var scale = typeof textBox.scale == 'object' ? textBox.scale : parseToNum(textBox.scale);
            var timeFormat = spinner.format;
            var value = m(textBox.getSpinnerValue(textBox), timeFormat);
            var max = spinner.upperBound == 'indefinite' ? m().add(50, 'years') : m(spinner.upperBound, timeFormat);
            var min = spinner.lowerBound == 'indefinite' ? m().subtract(50, 'years'): m(spinner.lowerBound, timeFormat);

            //如果用户手动输入一个非法值，会默认显示最小值
            value = value.isValid() ? value : min;
            if (direct == 'up') {
                value = value.add(scale.value, scale.key);
                if (m.max(value, max) == max) {
                    textBox.setSpinnerValue(textBox, m(value, timeFormat).format(timeFormat));
                } else {
                    if (!!spinner.turn && spinner.turn !== 'false') {
                        textBox.setSpinnerValue(textBox, m(min, timeFormat).format(timeFormat));
                    } else {
                        textBox.setSpinnerValue(textBox, m(max, timeFormat).format(timeFormat));
                    }
                }
            } else {
                value = value.subtract(scale.value, scale.key);
                if (m.min(value, min) == min) {
                    textBox.setSpinnerValue(textBox, m(value, timeFormat).format(timeFormat));
                } else {
                    if (!!spinner.turn && spinner.turn !== 'false') {
                        textBox.setSpinnerValue(textBox, m(max, timeFormat).format(timeFormat));
                    } else {
                        textBox.setSpinnerValue(textBox, m(min, timeFormat).format(timeFormat));
                    }
                }
            }
        }

        /**
         * 更新数值类型的方法
         * @param spinner
         * @param textBox
         * @param type
         */
        function updateNumber (spinner, textBox, direct) {
            var scale = parseToNum(spinner.scale);
            var value = parseToNum(textBox.getSpinnerValue(textBox));
            var max = spinner.upperBound == 'indefinite' ? Number.MAX_VALUE : parseToNum(spinner.upperBound);
            var min = spinner.lowerBound == 'indefinite' ? -(Number.MAX_VALUE) : parseToNum(spinner.lowerBound);
            if (direct == 'up') {
                value += scale;
                if (value <= max) {
                    textBox.setSpinnerValue(textBox, value);
                } else {
                    if (!!spinner.turn && spinner.turn !== 'false') {
                        textBox.setSpinnerValue(textBox, min);
                    } else {
                        textBox.setSpinnerValue(textBox, max);
                    }
                }
            } else {
                value -= scale;
                if (value >= min) {
                    textBox.setSpinnerValue(textBox, value);
                } else {
                    if (!!spinner.turn && spinner.turn !== 'false') {
                        textBox.setSpinnerValue(textBox, max);
                    } else {
                        textBox.setSpinnerValue(textBox, min);
                    }
                }
            }
        }

        /**
         * 更新值方法，用来判断值类型是数字类型还是时间类型
         * @param spinner
         * @param type
         * @param e
         */
        function updateValue (spinner, direct, e) {
            var textBox = spinner.target;
            if (spinner.format != 'number') {
                updateDate (spinner, textBox, direct);
            } else {
                updateNumber (spinner, textBox, direct);
            }
        }

        /**
         * 改变value方法，该方法会触发 scrollValue 事件
         * 如果用户想自定义方法，可以通过preventDefault()阻止默认行为
         * @param spinner
         * @param e
         */
        function scrollValue (spinner, e) {
            var textBox = spinner.target;
            //由于扩展类型没有repaint机制（也可能是我没找到？）所以如果主控件状态改变，
            //不会进行重新进行事件绑定，所以把检测主控件的状态的代码放到这里，如果主控件变成禁用了，就不进一步响应事件了。
            if (!textBox.disabled && !textBox.readOnly) {
                var direct = (e.target.id == textBox.helper.getId('scrollUp')) ? 'up' : 'down';
                var args = {
                    'spinner': spinner,
                    'direct': direct
                };
                var eventArgs = textBox.fire('scrollValue', args);
                if (!eventArgs.isDefaultPrevented()) {
                    updateValue(spinner, direct, e);
                }
            }
        }

        /**
         * 长按按钮自动更新方法
         * 长按3秒时，速度加倍
         * @param spinner
         * @param e
         */
        function autoUpdate (spinner, e) {
            spinner.tn = setInterval(function () {
                return scrollValue(spinner, e);
            }, +parseToNum(spinner.timeInterval));
            spinner.tn1 = setTimeout(function () {
                clearInterval(spinner.tn);
                spinner.tn = setInterval(function () {
                    return scrollValue(spinner, e);
                }, parseToNum(spinner.timeInterval)/2);
            }, 3000)
        }

        /**
         * 鼠标点击方法
         * @param spinner
         * @param e
         */
        function mouseDownHandler (spinner, e) {
            var delayTime = 1200 - spinner.timeInterval;
            scrollValue(spinner, e);
            spinner.tn = setTimeout(function () {
                return autoUpdate(spinner, e);
            }, delayTime)
        }

        /**
         * 取消事件方法
         * @param spinner
         * @param e
         */
        function mouseUpHandler (spinner, e) {
            clearInterval(spinner.tn);
            clearTimeout(spinner.tn);
            clearTimeout(spinner.tn1);
            spinner.tn = null;
            spinner.tn1 = null;
        }

        /**
         * 初始化spinner事件
         */
        Spinner.prototype.initEvents = function () {
            var textBox = this.target;
            var helper = this.target.helper;
            var scrollUp = helper.getPart('scrollUp');
            var scrollDown = helper.getPart('scrollDown');

            helper.addDOMEvent(scrollUp, 'mousedown', u.bind(mouseDownHandler, textBox, this));
            helper.addDOMEvent(scrollDown, 'mousedown', u.bind(mouseDownHandler, textBox, this));
            helper.addDOMEvent(scrollUp, 'mouseup',  u.bind(mouseUpHandler, textBox, this));
            helper.addDOMEvent(scrollDown, 'mouseup',  u.bind(mouseUpHandler, textBox, this));
            helper.addDOMEvent(scrollUp, 'mouseout',  u.bind(mouseUpHandler, textBox, this));
            helper.addDOMEvent(scrollDown, 'mouseout',  u.bind(mouseUpHandler, textBox, this));
        };

        /**
         * 构建spinner
         */
        Spinner.prototype.initMain = function () {
            var textBox = this.target;
            var helper = this.target.helper;
            var textWidth = textBox.width;
            var hint = textBox.hint;
            var hintType = textBox.hintType;
            var placeholder = textBox.helper.getPart('placeholder');
            var inputDOM = lib.g(textBox.inputId);

            var spinnerHTML = lib.format(spinnerTpl.join(' '), {
                scrollUpId: helper.getId('scrollUp'),
                scrollUpClass: helper.getPartClasses('scroll-up'),
                scrollDownId: helper.getId('scrollDown'),
                scrollDownClass: helper.getPartClasses('scroll-down')
            });
            var spinnerWrapper = helper.createPart('spinner-wrapper', 'div');
            spinnerWrapper.innerHTML = spinnerHTML;
            lib.insertAfter(spinnerWrapper, inputDOM);

            var width = this.width ? this.width : lib.getOffset(spinnerWrapper).width;
            if (width) {
                textWidth -= width;
            }

            if (hint && hintType) {
                var hintLabel = helper.getPart('hint');
                if (hintLabel && hintType == 'suffix') {
                    spinnerWrapper.style.marginRight = lib.getOffset(hintLabel).width + 'px';
                }
            }

            var padding = lib.getComputedStyle(inputDOM, 'paddingRight');
            padding = padding ? parseInt(padding, 10) : 0;
            inputDOM.style.paddingRight = padding + width + 'px';

            if (placeholder) {
                placeholder.style.maxWidth = textWidth + 'px';
            }

            this.initEvents();

        };

        /**
         * 销毁spinner方法
         *
         * @param textBox 主控件
         */
        function disposeSpinner(textBox) {
            var helper = textBox.helper;
            var scrollUp = helper.getPart('scrollUp');
            var scrollDown = helper.getPart('scrollDown');
            var spinnerDom = helper.getPart('spinner-wrapper');
            var inputDOM = lib.g(textBox.inputId);
            var padding = lib.getComputedStyle(inputDOM, 'paddingRight');
            var width = lib.getOffset(spinnerDom).width;
            padding = padding ? parseInt(padding, 10) : 0;

            helper.removeDOMEvent(scrollUp, 'mousedown', u.bind(mouseDownHandler, textBox, this));
            helper.removeDOMEvent(scrollDown, 'mousedown', u.bind(mouseDownHandler, textBox, this));
            helper.removeDOMEvent(scrollUp, 'mouseup',  u.bind(mouseUpHandler, textBox, this));
            helper.removeDOMEvent(scrollDown, 'mouseup',  u.bind(mouseUpHandler, textBox, this));
            helper.removeDOMEvent(scrollUp, 'mouseout',  u.bind(mouseUpHandler, textBox, this));
            helper.removeDOMEvent(scrollDown, 'mouseout',  u.bind(mouseUpHandler, textBox, this));
            //恢复input标签的padding属性
            inputDOM.style.paddingRight = padding - width + 'px';
            lib.removeNode(spinnerDom);

            scrollUp = null;
            scrollDown = null;
            spinnerDom = null;
        }

        /**
         * Spinner默认属性
         * turn: 当值到边界时是否反转
         * scale: 刻度单位, 如果format为 number 类型，则为数字类型， 如果format为 日期类型，则为Object类型，格式为：
         *          {
         *           key:   ***,    //时间单位，如 'days', 'years'等，具体请参考 {@link moment}
         *           value: ***     //单位时间， 数字类型
         *          }
         * upperBound: 上界
         * lowerBound: 下界
         * format: 值的格式，包括 number 和 日期 两种，如果使用日期格式，format按照{@link moment}的格式进行设置
         * timeInterval: 长按按钮时，数值滚动的时间间隔
         * {Object} mask: 设置显示的文本，如果显示文本要对应多个值 (一般情况并不推荐这样用，如果有特殊需要，如把几个值显示为某种状态)，
         *                需要设置为 数组，但是需要解析一个文本时，会默认选择数组 第一个元素，如:
         *          {
         *           '最小值': 0,
         *           'π': 3.14，
         *           '无效值': [1, 3, 5, 7]
         *          };
         * @type {{spaceHolder: string, turn: boolean, scale: number, range: Array}}
         */
        Spinner.defaultProperties = {
            turn: true,
            scale: 1,
            upperBound: 'indefinite',
            lowerBound: 'indefinite',
            format: 'number',
            timeInterval: 100,
            mask: {}
        };

        /**
         * 微调输入控件
         *
         * @extends Extension
         * @constructor
         */

        function Spinner (options) {
            var defaults = Spinner.defaultProperties;
            var args = {};
            u.extend(args, defaults, options);
            arguments[0] = args;
            Extension.apply(this, arguments);
        }


        /**
         * 控件扩展类型为`"Spinner"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        Spinner.prototype.type = 'Spinner';

        /**
         * 激活扩展
         *
         * @override
         */
        Spinner.prototype.activate = function () {
            var target = this.target;
            // 只对`TextBox`控件生效,且控件mode必须为text
            if (!(target instanceof TextBox && target.mode == 'text')) {
                return;
            }

            //需要暴露给主控件的属性和方法：
            //如果有mask的存在，主控件取值不能直接用getValue方法了，真实的值需要用getSpinnerValue方法去获得；
            target.spinnerValue = '';
            target.mask = this.mask;
            target.scale = this.scale;
            target.getSpinnerValue = getSpinnerValue;
            target.setSpinnerValue = setSpinnerValue;
            //target.helper.addDOMEvent(target, 'afterrender', u.bind(this.initMain, this));
            target.on('afterrender', u.bind(this.initMain, this));
            //如果是在主控件加载完之后才手动绑定，需要手动调用一次初始化方法
            if (target.helper.isInStage('RENDERED')) {
                this.initMain();
            }
            Extension.prototype.activate.apply(this, arguments);
        };

        /**
         * 取消扩展的激活状态
         *
         * @override
         */
        Spinner.prototype.inactivate = function () {
            var target = this.target;
            // 只对`TextBox`控件生效
            if (!(target instanceof TextBox && target.mode == 'text')) {
                return;
            }
            delete target.spinnerValue;
            delete target.mask;
            delete target.scale;
            delete target.getSpinnerValue;
            delete target.setSpinnerValue;
            target.un('afterrender', u.bind(this.initMain, this));
            disposeSpinner(target);

            Extension.prototype.inactivate.apply(this, arguments);
        };

        lib.inherits(Spinner, Extension);
        main.registerExtension(Spinner);

        return Spinner;
    }
);
