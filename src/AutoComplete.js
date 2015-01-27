/**
 * 输入控件自动提示扩展
 * @file: AutoComplete.js
 * @author: liwei
 *
 */

define(function (require) {

    var TextBox = require('esui/TextBox');
    var TextLine = require('esui/TextLine');
    var lib = require('esui/lib');
    var Layer = require('esui/Layer');
    var helper = new (require('esui/Helper'));
    var Extension = require('esui/Extension');
    var eoo = require('eoo');
    var cursorHelper = require('helper/CursorPositionHelper');

    var MAIN_CLASS = helper.getPrefixClass('autocomplete');
    var ITEM_CLASS = helper.getPrefixClass('autocomplete-item');
    var ITEM_HOVER_CLASS = helper.getPrefixClass('autocomplete-item-hover');
    var CHAR_SELECTED_CLASS = helper.getPrefixClass('autocomplete-item-char-selected');

    function filter(value, datasource) {
        var ret = [];
        for (var i = 0, len = datasource.length; i < len; i++) {
            var data = datasource[i];
            if (data.indexOf(value) === 0) {
                ret.push(data);
            }
        }
        return ret;
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
                renderSuggest.call(me, filter(value, data), value);
            });
        }
        else if (this.target.datasource && this.target.datasource.length) {
            renderSuggest.call(me, filter(value, this.target.datasource), value);
        }
    }

    function renderSuggest(data, value) {
        var ret = '';
        if (data && data.length) {
            for (var i = 0, len = data.length; i < len; i++) {
                ret += '<li class="' + ITEM_CLASS + '"><span>'
                    + data[i].replace(new RegExp('^' + value), '<i class="'
                    + CHAR_SELECTED_CLASS + '">' + value + '</i>') + '</span></li>';
            }
        }
        this.layer.repaint(ret);
        ret ? lib.bind(showSuggest, this)() : lib.bind(hideSuggest, this)();
    }

    var obj = {};

    function initMain() {
        var element = this.getElement();
        lib.addClass(element, helper.getPrefixClass('dropdown'));

        this.addCustomClasses([MAIN_CLASS]);
        this.control.main.appendChild(element);
    }

    function initEvents() {
        var me = this;
        var layerElement = this.layer.getElement(false);
        if (this.targetType === 'TextBox') {
            this.inputElement = lib.g(this.target.inputId);
        }
        else if (this.targetType === 'TextLine') {
            this.inputElement = findTextLineTextArea(this.target.main);
        }
        else {
            return;
        }

        lib.on(layerElement, 'click', obj.selectItem = function (e) {
            lib.bind(setTargetValue, me)(e.target.textContent);
            lib.bind(hideSuggest, me)();
        });

        lib.on(this.inputElement, 'keydown', obj.keyboard = function (e) {
            if (me.layer.isHidden()) {
                return;
            }

            switch (e.keyCode) {
                // up
                case 38:
                    lib.event.preventDefault(e);
                    lib.bind(moveTo, me)(-1);
                    break;
                    // down
                case 40:
                    lib.event.preventDefault(e);
                    lib.bind(moveTo, me)(1);
                    break;
                    // esc
                case 27:
                    lib.bind(hideSuggest, me)();
                    break;
                    // enter
                case 13:
                    {
                        lib.event.preventDefault(e);
                        var selectedItem = lib.bind(getSelectedItem, me)();
                        if (!selectedItem) {
                            return;
                        }
                        lib.bind(setTargetValue, me)(selectedItem.textContent);
                        lib.bind(hideSuggest, me)();
                        break;
                    }
            }
        });

        lib.on(this.inputElement, 'input', obj.oninput = function oninput(e) {
            var value = me.target.getValue();
            if (me.splitchar !== ' ') {
                if (/\s$/.test(value)) {
                    return;
                }
            }

            if (!value) {
                lib.bind(repaintSuggest, me)('');
                lib.bind(hideSuggest, me)();
                return;
            }

            value = lib.bind(extractMatchingWord, me)(value);

            if (!value) {
                return;
            }

            repaintSuggest.call(me, value);
        });

        lib.on(this.inputElement, 'blur', obj.blurinput = function (e) {
            if (obj.blurInputTimer) {
                clearTimeout(obj.blurInputTimer);
                obj.blurInputTimer = null;
            }
            obj.blurInputTimer = setTimeout(function () {
                lib.bind(hideSuggest, me)();
            }, 250);
        });
    }

    function setTargetValue(value) {
        var targetValue = this.target.getValue();
        targetValue = lib.trim(targetValue);

        if (this.ismultiple) {
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

        this.target.setValue(value);
    }

    function extractMatchingWord(value) {
        if (this.ismultiple && this.splitCharRE.test(value)) {
            var arr = this.splitCharRE.exec(value);
            value = arr && arr[1];
        }

        if (value && this.fireCharRE.test(value)) {
            arr = this.fireCharRE.exec(value);
            value = arr && arr[1];
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

    // 1: down  -1: up
    function moveTo(updown) {
        var element = this.layer.getElement(false);
        var items = element.children;
        var selectedItemIndex = lib.bind(getSelectedItemIndex, this)();

        if (selectedItemIndex !== -1) {
            var selectedItem = items[selectedItemIndex];
            selectedItem && lib.removeClass(selectedItem, ITEM_HOVER_CLASS);
        }


        if (updown === -1) {
            if (selectedItemIndex === -1 || selectedItemIndex === 0) {
                selectedItemIndex = items.length - 1;
            }
            else {
                selectedItemIndex--;
            }
        }
        else if (updown === 1) {
            if (selectedItemIndex === -1 || selectedItemIndex === items.length - 1) {
                selectedItemIndex = 0;
            }
            else {
                selectedItemIndex++;
            }
        }
        selectedItem = items[selectedItemIndex];
        selectedItem && lib.addClass(selectedItem, ITEM_HOVER_CLASS);
    }

    function getSelectedItemIndex() {
        var element = this.layer.getElement(false);
        var items = element.children;
        var selectedItemIndex = -1;
        for (var i = 0, len = items.length; i < len; i++) {
            if (lib.hasClass(items[i], ITEM_HOVER_CLASS)) {
                selectedItemIndex = i;
                break;
            }
        }
        return selectedItemIndex;
    }

    function getSelectedItem() {
        var element = this.layer.getElement(false);
        var selectedItem;
        var selectedItemIndex = lib.bind(getSelectedItemIndex, this)();
        if (selectedItemIndex !== -1) {
            selectedItem = element.children[selectedItemIndex];
        }
        return selectedItem;
    }

    function findTextLineTextArea(target) {
        var children = lib.getChildren(target);
        if (!children || !children.length) {
            return;
        }
        var ret;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.nodeName.toLowerCase() === 'textarea') {
                ret = child;
                break;
            }
            else {
                ret = findTextLineTextArea(child);
                if (ret) {
                    break;
                }
            }
        }
        return ret;
    }

    var layerExports = {};
    /**
     * 自动提示层构造器
     * @param {Object} [control] TextBox控件
     */
    layerExports.constructor = function (control) {
        this.$super(arguments);

        this.initStructure();
    };

    layerExports.type = 'AutoCompleteLayer';

    layerExports.dock = {
        strictWidth: true
    };

    layerExports.initStructure = function () {
        lib.bind(initMain, this)();
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
        /**
         * @property 只作为分隔符, 不作为匹配word的成分参与匹配
         */
        this.splitchar = ',';
        /**
         * @property 触发新的匹配动作, 并作为匹配word的一部分参与匹配
         */
        this.firechar = '{';
        /**
         * @property 标识是否可触发多次提示; 启用firechar时, 不考虑ismultiple的影响, 遇到firechar一律触发
         */
        this.ismultiple = false;

        this.$super(arguments);

        if (this.ismultiple === 'false' || this.ismultiple === '0') {
            this.ismultiple = false;
        }
        else {
            this.ismultiple = !!this.ismultiple;
        }

        this.escapedSplitchar = escapeRegex(this.splitchar);
        this.escapedFirechar = escapeRegex(this.firechar);

        this.splitCharRE = new RegExp(this.escapedSplitchar + '([^' + this.escapedSplitchar + '\\s' + ']+)$');

        this.fireCharRE = new RegExp('('
            + this.escapedFirechar
            + '[^' + this.escapedSplitchar
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
            lib.bind(initEvents, me)();
        }, 0);
    };

    /**
     * 激活扩展
     *
     * @override
     */
    exports.activate = function () {
        // 只对`TextBox` 和 `TextLine`控件生效
        if (this.target instanceof TextLine) {
            this.targetType = 'TextLine';
        }
        else if (this.target instanceof TextBox) {
            this.targetType = 'TextBox';
        }
        else {
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
        lib.un(this.inputElement, 'input', obj.oninput);
        lib.un(this.inputElement, 'blur', obj.blurinput);

        var layerMain = this.layer.getElement(false);
        lib.un(this.inputElement, 'keydown', obj.keyboard);
        lib.un(layerMain, 'click', obj.selectItem);
        lib.un(layerMain, 'mouseover', obj.mouseOverItem);
        lib.bind(removemain, this)();

        this.$super(arguments);
    };

    var AutoComplete = eoo.create(Extension, exports);
    require('esui/main').registerExtension(AutoComplete);
    return AutoComplete;
});
