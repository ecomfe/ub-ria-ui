/**
 * 输入控件自动提示扩展
 * @file: AutoComplete.js
 * @author: liwei
 *
 */

define(function (require) {

    var lib = require('esui/lib');
    var u = require('underscore');
    var Layer = require('esui/Layer');
    var Extension = require('esui/Extension');
    var eoo = require('eoo');
    var cursorHelper = require('helper/CursorPositionHelper');

    var TEXT_LINE = 'TextLine';
    var TEXT_BOX = 'TextBox';
    var INPUT = 'input';
    var TEXT = 'text';

    function filter(value, datasource, caseSensitive) {
        return u.filter(datasource, function (data) {
            var text = u.isObject(data) ? data.text : data;
            return (new RegExp('^' + escapeRegex(value), caseSensitive ? '' : 'i')).test(text);
            // return caseSensitive ? text.indexOf(value) === 0;
        });
    }

    function escapeRegex(value) {
        return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    }

    function repaintSuggest(value) {
        if (!value) {
            renderSuggest.call(this);
            return;
        }
        var me = this;
        if (typeof this.target.datasource === 'function') {
            this.target.datasource.call(this, value, function (data) {
                // renderSuggest.call(me, filter(value, data, me.casesensitive), value);
                renderSuggest.call(me, data, value);
            });
        }
        else if (this.target.datasource && this.target.datasource.length) {
            renderSuggest.call(me, filter(value, this.target.datasource, this.casesensitive), value);
        }
    }

    function renderSuggest(data, inputValue) {
        var ret = '';
        if (data && data.length) {
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i];
                ret += '<li'
                    + (u.isObject(item) && item.id ? ' data-id="' + item.id + '"' : '')
                    + ' class="'
                    + this.target.helper.getPrefixClass('autocomplete-item')
                    + (i === 0 ? ' ' + this.target.helper.getPrefixClass('autocomplete-item-hover') : '')
                    + ' "><span class="'
                    + this.target.helper.getPrefixClass('autocomplete-item-text')
                    + '">'
                    + (u.isObject(item) ? item.text : item).replace(new RegExp('^' + inputValue), '<i class="'
                    + this.target.helper.getPrefixClass('autocomplete-item-char-selected') + '">'
                    + inputValue + '</i>') + '</span>'
                    + (u.isObject(item) ? '<span class="' + this.target.helper.getPrefixClass('autocomplete-item-desc')
                    + '">' + item.desc + '</span>' : '')
                    + '</li>';
            }
        }
        this.layer.repaint(ret);
        ret ? showSuggest.call(this) : hideSuggest.call(this);
    }

    var obj = {};

    function initMain() {
        var element = this.getElement();
        lib.addClass(element, this.control.helper.getPrefixClass('dropdown'));

        this.addCustomClasses([this.control.helper.getPrefixClass('autocomplete')]);
        this.control.main.appendChild(element);
    }

    function initEvents() {
        var me = this;
        var layerElement = me.layer.getElement(false);
        var target = me.target;
        var helper = target.helper;
        var inputElement;

        this.inputElement =
            helper.getPart(target.type === TEXT_LINE ? TEXT : INPUT);
        inputElement = this.inputElement;

        helper.addDOMEvent(layerElement, 'click', obj.selectItem = function (e) {
            setTargetValue.call(me, e.target.textContent);
            hideSuggest.call(me);
        });

        helper.addDOMEvent(inputElement, 'keydown', obj.keyboard = function (e) {
            if (me.layer.isHidden()) {
                return;
            }

            switch (e.keyCode) {
                // up
                case 38:
                    e.preventDefault();
                    moveTo.call(me, 'up');
                    break;
                    // down
                case 40:
                    e.preventDefault();
                    moveTo.call(me, 'down');
                    break;
                    // esc
                case 27:
                    hideSuggest.call(me);
                    break;
                    // enter
                case 13:
                    e.preventDefault();
                    var selectedItem = getSelectedItem.call(me);
                    if (!selectedItem) {
                        return;
                    }
                    setTargetValue.call(me, selectedItem.firstChild.textContent);
                    hideSuggest.call(me);
                    break;
            }
        });

        helper.addDOMEvent(inputElement, INPUT, obj.oninput = function oninput(e) {
            var elementValue = inputElement.value;

            if (!elementValue || me.endWithClosefireCharRE.test(elementValue)) {
                repaintSuggest.call(me, '');
                hideSuggest.call(me);
                return;
            }

            if (me.splitchar !== ' ') {
                if (/\s$/.test(elementValue)) {
                    return;
                }
            }

            if (me.endWithSplitCharRE.test(elementValue)) {
                return;
            }

            elementValue = extractMatchingWord.call(me, elementValue);

            if (!elementValue) {
                return;
            }

            repaintSuggest.call(me, elementValue);
        });
    }

    function setTargetValue(value) {
        var targetValue = this.target.getValue();
        targetValue = lib.trim(targetValue);

        if (/\n/.test(targetValue)) {
            var arr = targetValue.split(/\n/);
            targetValue = arr && arr.pop();
        }

        if (this.splitCharRE) {
            if (this.fireCharRE.test(targetValue)) {
                value = targetValue.replace(this.fireCharRE, value);
            }
            else if (this.splitCharRE.test(targetValue)) {
                value = targetValue.replace(this.splitCharRE, this.splitchar + value);
            }
        }
        else if (this.fireCharRE.test(targetValue)) {
            value = targetValue.replace(this.fireCharRE, value);
        }

        if (arr && arr.length) {
            arr.push(value);
            value = arr.join('\n');
        }
        this.target.setValue(value);
    }

    function extractMatchingWord(value) {
        if (this.splitCharRE && this.splitCharRE.test(value)) {
            var arr = this.splitCharRE.exec(value);
            value = arr && arr[1];
        }

        if (value) {
            if (this.fireCharRE.test(value)) {
                arr = this.fireCharRE.exec(value);
                value = arr && arr[1];
            }
            else if (/\n/.test(value)) {
                arr = value.split(/\n/);
                value = arr && arr[arr.length - 1];
            }
        }
        return value;
    }

    function removemain() {
        this.target.main.removeChild(this.layer.getElement(false));
    }

    function showSuggest() {
        this.layer.show();
        var input = this.inputElement;
        var style = this.layer.getElement(false).style;
        var offset = lib.getOffset(this.target.main);
        if (input.nodeName.toLowerCase() === 'textarea') {
            // TODO: 这里计算光标的像素坐标还是没有非常精确
            var pos = cursorHelper.getInputPositon(input);
            var scrollTop = input.scrollTop;
            var scrollLeft = input.scrollLeft;
            style.left = pos.left - offset.left - scrollLeft + 'px';
            style.top = pos.top - offset.top - scrollTop + parseInt(lib.getStyle(input, 'fontSize'), 10) + 'px';
        }
        else {
            style.left = 0;
            style.top = offset.height + 'px';
        }
    }

    function hideSuggest() {
        this.layer.hide();
    }

    // 'down': down  'up': up
    function moveTo(updown) {
        var element = this.layer.getElement(false);
        var items = element.children;
        var selectedItemIndex = getSelectedItemIndex.call(this);

        if (selectedItemIndex !== -1) {
            var selectedItem = items[selectedItemIndex];
            selectedItem && lib.removeClass(selectedItem, this.target.helper.getPrefixClass('autocomplete-item-hover'));
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
        selectedItem && lib.addClass(selectedItem, this.target.helper.getPrefixClass('autocomplete-item-hover'));
    }

    function getSelectedItemIndex() {
        var element = this.layer.getElement(false);
        var items = element.children;
        var selectedItemIndex = -1;
        for (var i = 0, len = items.length; i < len; i++) {
            if (lib.hasClass(items[i], this.target.helper.getPrefixClass('autocomplete-item-hover'))) {
                selectedItemIndex = i;
                break;
            }
        }
        return selectedItemIndex;
    }

    function getSelectedItem() {
        var element = this.layer.getElement(false);
        var selectedItem;
        var selectedItemIndex = getSelectedItemIndex.call(this);
        if (selectedItemIndex !== -1) {
            selectedItem = element.children[selectedItemIndex];
        }
        return selectedItem;
    }

    var layerExports = {};
    /**
     * 自动提示层构造器
     * @param {Object} [control] TextBox控件
     */
    layerExports.constructor = function (control) {
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
    };

    layerExports.type = 'AutoCompleteLayer';

    layerExports.initStructure = function () {
        initMain.call(this);
    };

    layerExports.repaint = function (value) {
        var element = this.getElement(false);
        if (element) {
            this.render(element, value);
        }
    };

    layerExports.render = function (element, value) {
        if (value != null) {
            element.innerHTML = value;
        }
    };

    layerExports.isHidden = function () {
        var element = this.getElement();
        var ret;
        if (!element || this.control.helper.isPart(element, 'layer-hidden')) {
            ret = true;
        }
        else {
            ret = false;
        }
        return ret;
    };

    layerExports.nodeName = 'ol';

    var AutoCompleteLayer = eoo.create(Layer, layerExports);

    var exports = {};

    /**
     * 输入控件自动提示扩展
     *
     * 当输入控件加上此扩展后，其自动提示功能将由扩展自动提供
     *
     * @class extension.AutoComplete
     * @extends Extension
     * @constructor
     */
    exports.constructor = function () {
        this.$super(arguments);
        this.initOptions();
    };

    exports.initOptions = function () {
        /**
         * @property 英文字母大小写敏感
         */
        this.casesensitive;
        /**
         * @property 只作为分隔符, 不作为匹配word的成分参与匹配, 建议使用逗号或空格作为分隔符
         */
        this.splitchar;
        /**
         * @property 触发新的匹配动作, 并作为匹配word的一部分参与匹配
         */
        this.firechar = '{';
        /**
         * @property 结束匹配动作
         */
        this.closefirechar = '}';

        if (this.casesensitive === 'false' || this.casesensitive === '0' || this.casesensitive === '') {
            this.casesensitive = false;
        }
        else {
            this.casesensitive = true;
        }

        if (this.splitchar) {
            this.escapedSplitchar = escapeRegex(this.splitchar);
            this.splitCharRE = new RegExp(this.escapedSplitchar + '([^' + this.escapedSplitchar + '\\s' + ']+)$');
        }
        this.escapedFirechar = escapeRegex(this.firechar);
        this.escapedClosefirechar = escapeRegex(this.closefirechar);
        this.endWithSplitCharRE = new RegExp(this.escapedSplitchar + '$');
        this.endWithClosefireCharRE = new RegExp(this.escapedClosefirechar + '$');

        this.fireCharRE = new RegExp('('
            + this.escapedFirechar
            + '[^' + this.escapedSplitchar
            + this.escapedClosefirechar
            + this.escapedFirechar + '\\s'
            + ']*)$');
    };

    /**
     * 指定扩展类型，始终为`"AutoComplete"`
     *
     * @type {string}
     */
    exports.type = 'AutoComplete';

    exports.attachTo = function () {
        this.$super(arguments);

        var me = this;
        setTimeout(function () {
            me.layer = new AutoCompleteLayer(me.target);
            initEvents.call(me);
        }, 0);
    };

    /**
     * 激活扩展
     *
     * @override
     */
    exports.activate = function () {
        // 只对`TextBox` 和 `TextLine`控件生效
        var type = this.target.type;

        if (!(type === TEXT_LINE
            || type  === TEXT_BOX)) {
            return;
        }
        this.$super(arguments);
    };

    /**
     * 取消扩展的激活状态
     *
     * @override
     */
    exports.inactivate = function () {
        var helper = this.target.helper;
        var inputEle = this.inputElement;

        helper.removeDOMEvent(inputEle, INPUT, obj.oninput);

        var layerMain = this.layer.getElement(false);
        helper.removeDOMEvent(inputEle, 'keydown', obj.keyboard);
        helper.removeDOMEvent(layerMain, 'click', obj.selectItem);
        removemain.call(this);

        this.$super(arguments);
    };

    var AutoComplete = eoo.create(Extension, exports);
    require('esui/main').registerExtension(AutoComplete);
    return AutoComplete;
});
