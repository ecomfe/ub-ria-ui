/**
 * 输入控件自动提示扩展
 * @file: AutoComplete.js
 * @author: liwei
 *
 */

define(
    function (require) {

        var esui = require('esui');
        var lib = require('esui/lib');
        var u = require('underscore');
        var Layer = require('esui/Layer');
        var Extension = require('esui/Extension');
        var eoo = require('eoo');
        var cursorHelper = require('./helper/CursorPositionHelper');
        var keyboard = require('esui/behavior/keyboard');

        var TEXT_LINE = 'TextLine';
        var TEXT_BOX = 'TextBox';
        var INPUT = 'input';
        var TEXT = 'text';

        var AutoCompleteLayer = eoo.create(
            Layer,
            {

                /**
                 * 自动提示层构造器
                 * @param {Object} [control] TextBox控件
                 */
                constructor: function (control) {
                    this.$super(arguments);
                    var helper = control.helper;
                    var controlType = control.type === TEXT_LINE ? TEXT : INPUT;
                    var ele = helper.getPart(controlType);
                    if (ele.tagName.toLowerCase() === INPUT) {
                        this.dock = {
                            strictWidth: true
                        };
                    }
                    this.initStructure();
                    this.initEvents();
                },

                type: 'AutoCompleteLayer',

                initStructure: function () {
                    var element = this.getElement();
                    lib.addClass(element, this.control.helper.getPrefixClass('dropdown'));

                    this.addCustomClasses([this.control.helper.getPrefixClass('autocomplete')]);
                    this.control.main.appendChild(element);
                },

                initEvents: function () {
                    var me = this;
                    var layerElement = me.getElement(false);
                    var target = me.control;
                    var helper = target.helper;
                    var inputElement;

                    this.inputElement = helper.getPart(target.type === TEXT_LINE ? TEXT : INPUT);
                    inputElement = this.inputElement;

                    helper.addDOMEvent(layerElement, 'click', function (e) {
                        var clickedTarget = e.target;
                        if (clickedTarget.nodeName === 'I') {
                            clickedTarget = clickedTarget.parentNode;
                        }
                        clickedTarget = clickedTarget.parentNode.firstChild;
                        me.hide();
                        var text = lib.getText(clickedTarget);
                        if (target.select && target.select(text, target) === false) {
                            return;
                        }
                        setTargetValue.call(me, text);
                    });

                    helper.addDOMEvent(inputElement, 'keydown', function (e) {
                        if (me.isHidden()) {
                            return;
                        }

                        switch (e.keyCode) {
                            // up
                            case keyboard.UP:
                                e.preventDefault();
                                moveTo.call(me, 'up');
                                break;
                            // down
                            case keyboard.DOWN:
                                e.preventDefault();
                                moveTo.call(me, 'down');
                                break;
                            // esc
                            case keyboard.ESC:
                                me.hide();
                                break;
                            // enter
                            case keyboard.RETURN:
                                e.preventDefault();
                                var selectedItem = me.getSelectedItem();
                                if (!selectedItem) {
                                    return;
                                }
                                me.hide();
                                var text = lib.getText(selectedItem.firstChild);
                                if (target.select
                                    && target.select(text, target) === false) {
                                    return;
                                }
                                setTargetValue.call(me, text);
                                break;
                        }
                    });

                    var inputEventName = ('oninput' in inputElement)
                        ? 'input'
                        : 'propertychange';
                    helper.addDOMEvent(inputElement, inputEventName, function (e) {
                        var elementValue = inputElement.value;

                        // 空格或逗号结尾都忽略
                        if (!elementValue || /(?:\s|\,)$/.test(elementValue)) {
                            repaintSuggest.call(me, '');
                            me.hide();
                            return;
                        }

                        if (u.isFunction(target.extractWord)) {
                            elementValue = target.extractWord(elementValue);
                        }
                        else {
                            elementValue = extractMatchingWord(elementValue);
                        }

                        if (!elementValue) {
                            return;
                        }

                        if (target.search && target.search(elementValue) === false) {
                            return;
                        }

                        repaintSuggest.call(me, elementValue);
                    });
                },

                repaint: function (value) {
                    var element = this.getElement(false);
                    if (element) {
                        this.render(element, value);
                    }
                },

                render: function (element, value) {
                    if (value != null) {
                        element.innerHTML = value;
                    }
                },

                getSelectedItemIndex: function () {
                    var element = this.getElement(false);
                    var items = element.children;
                    var selectedItemIndex = -1;
                    for (var i = 0, len = items.length; i < len; i++) {
                        if (lib.hasClass(items[i], this.control.helper.getPrefixClass('autocomplete-item-hover'))) {
                            selectedItemIndex = i;
                            break;
                        }
                    }
                    return selectedItemIndex;
                },

                getSelectedItem: function () {
                    var element = this.getElement(false);
                    var selectedItem;
                    var selectedItemIndex = this.getSelectedItemIndex();
                    if (selectedItemIndex !== -1) {
                        selectedItem = element.children[selectedItemIndex];
                    }
                    return selectedItem;
                },

                show: function () {
                    this.$super(arguments);
                    var input = this.inputElement;
                    var style = this.getElement(false).style;
                    var offset = lib.getOffset(this.control.main);
                    if (input.nodeName.toLowerCase() === 'textarea') {
                        // TODO: 这里计算光标的像素坐标还是没有非常精确
                        var pos = cursorHelper.getInputPositon(input);
                        var scrollTop = input.scrollTop;
                        var scrollLeft = input.scrollLeft;
                        style.left = pos.left - offset.left - scrollLeft + 'px';
                        style.top = pos.top - offset.top - scrollTop
                            + parseInt(lib.getStyle(input, 'fontSize'), 10) + 'px';
                    }
                    else {
                        style.left = 0;
                        style.top = offset.height + 'px';
                    }
                },

                isHidden: function () {
                    var element = this.getElement();
                    var ret;
                    if (!element || this.control.helper.isPart(element, 'layer-hidden')) {
                        ret = true;
                    }
                    else {
                        ret = false;
                    }
                    return ret;
                },

                nodeName: 'ol'
            }
        );

        /**
         * 匹配已输入值的算法
         * @param {string} value 当前用户输入
         * @param {Array} datasource 数据源
         * @return {Array}
         */
        function filter(value, datasource) {
            return u.filter(
                datasource,
                function (data) {
                    var text = u.isObject(data) ? data.text : data;
                    return (new RegExp(escapeRegex(value), 'i')).test(text);
                }
            );
        }

        /**
         * 特殊字符处理，这些字符排除在匹配算法外
         * @param {string} value 用户输入
         * @return {string}
         */
        function escapeRegex(value) {
            return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        }

        /**
         * 根据用户输入绘制下拉选择列表
         * @param {sttring} value 用户输入
         */
        function repaintSuggest(value) {
            if (!value) {
                renderSuggest.call(this);
                return;
            }
            var me = this;
            var datasource = this.control.datasource;
            if (typeof datasource === 'function') {
                datasource.call(
                    this,
                    value,
                    function (data) {
                        renderSuggest.call(me, data, value);
                    }
                );
            }
            else if (datasource && datasource.length) {
                renderSuggest.call(me, filter(value, datasource), value);
            }
        }

        function renderSuggest(data, inputValue) {
            var me = this;
            var ret = [];
            if (data && data.length) {
                for (var i = 0, len = data.length; i < len; i++) {
                    var item = data[i];
                    var text = u.isObject(item) && item.text || item;
                    var desc = u.isObject(item) && item.desc || undefined;
                    var helper = this.control.helper;
                    var html = lib.format(
                        '<li tabindex="-1" ${dataId} class="${lineClasses}">'
                            + '<span class="${itemClasses}">${text}</span>${desc}</li>',
                        {
                            dataId: u.isObject(item) && item.id ? ' data-id="' + item.id + '"' : '',
                            lineClasses: helper.getPrefixClass('autocomplete-item')
                                + (i === 0 ? ' ' + helper.getPrefixClass('autocomplete-item-hover') : ''),
                            itemClasses: helper.getPrefixClass('autocomplete-item-text'),
                            text: text.replace(
                                new RegExp(escapeRegex(inputValue), 'i'),
                                function (m, n, o) {
                                    return '<i class="'
                                        + helper.getPrefixClass('autocomplete-item-char-selected') + '">'
                                        + m + '</i>';
                                }
                            ),
                            desc: desc ? '<span class="' + helper.getPrefixClass('autocomplete-item-desc')
                                + '">' + item.desc + '</span>' : ''
                        }
                    );
                    ret.push(html);
                }
            }
            ret = ret.join('');
            this.repaint(ret);
            ret ? this.show() : this.hide();
        }


        /**
         * 将用户选中值回填到input输入框
         * @param {string} value 用户选择值
         */
        function setTargetValue(value) {
            var controlType = this.control.type === TEXT_LINE ? TEXT : INPUT;
            // this.target.getValue() 做了去重的事，这里不需要去重后的结果
            var targetValue = this.control.helper.getPart(controlType).value;
            targetValue = lib.trim(targetValue);
            var arr = [];
            if (/\n/.test(targetValue)) {
                arr = targetValue.split(/\n/);
                targetValue = arr && arr.pop();
            }

            var words = targetValue.split(',');
            words.pop();
            words.push(value);

            if (arr) {
                arr.push(words.join(','));
                value = arr.join('\n');
            }
            this.control.setValue(value);
            this.hide();
        }

        function extractMatchingWord(value) {
            var lines = value.split(/\n/);
            var line = lines.pop();
            var words = line.split(',');
            var word = words && words.pop();
            return lib.trim(word);
        }

        /**
         * 下拉建议列表中上下选择
         * @param {string} updown up / down
         */
        function moveTo(updown) {
            var element = this.getElement(false);
            var items = element.children;
            var selectedItemIndex = this.getSelectedItemIndex();

            if (selectedItemIndex !== -1) {
                var selectedItem = items[selectedItemIndex];
                if (selectedItem) {
                    lib.removeClass(
                        selectedItem,
                        this.control.helper.getPrefixClass('autocomplete-item-hover')
                    );
                }
            }


            if (updown === 'up') {
                if (selectedItemIndex === -1 || selectedItemIndex === 0) {
                    selectedItemIndex = items.length - 1;
                }
                else {
                    selectedItemIndex--;
                }
            }
            else if (updown === 'down') {
                if (selectedItemIndex === -1 || selectedItemIndex === items.length - 1) {
                    selectedItemIndex = 0;
                }
                else {
                    selectedItemIndex++;
                }
            }
            selectedItem = items[selectedItemIndex];
            selectedItem && lib.addClass(selectedItem, this.control.helper.getPrefixClass('autocomplete-item-hover'));

            selectedItem && selectedItem.focus();
            this.inputElement.focus();
        }

        var AutoComplete = eoo.create(
            Extension,
            {

                /**
                 * 输入控件自动提示扩展
                 *
                 * 当输入控件加上此扩展后，其自动提示功能将由扩展自动提供
                 *
                 * @class extension.AutoComplete
                 * @extends Extension
                 * @constructor
                 */
                constructor: function () {
                    this.$super(arguments);
                },

                /**
                 * 指定扩展类型，始终为`"AutoComplete"`
                 *
                 * @type {string}
                 */
                type: 'AutoComplete',

                attachTo: function () {
                    this.$super(arguments);

                    var me = this;
                    setTimeout(function () {
                        me.layer = new AutoCompleteLayer(me.target);
                    }, 0);
                },

                /**
                 * 激活扩展
                 *
                 * @override
                 */
                activate: function () {
                    // 只对`TextBox` 和 `TextLine`控件生效
                    var type = this.target.type;

                    if (!(type === TEXT_LINE
                        || type  === TEXT_BOX)) {
                        return;
                    }
                    this.$super(arguments);
                },

                /**
                 * 取消扩展的激活状态
                 *
                 * @override
                 */
                inactivate: function () {
                    var helper = this.target.helper;
                    var inputEle = this.inputElement;

                    helper.removeDOMEvent(inputEle, INPUT);

                    var layerMain = this.layer.getElement(false);
                    helper.removeDOMEvent(inputEle, 'keydown');
                    helper.removeDOMEvent(layerMain, 'click');
                    this.target.main.removeChild(layerMain);

                    this.$super(arguments);
                }
            }
        );

        esui.registerExtension(AutoComplete);
        return AutoComplete;
    }
);
