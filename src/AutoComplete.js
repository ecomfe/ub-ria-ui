/**
 * 输入控件自动提示扩展
 *
 * @author: liwei
 *
 */

 define(function (require) {

    var TextBox = require('esui/TextBox');
    var lib = require('esui/lib');
    var Extension = require('esui/Extension');

    var cursorHelper = require('./cursorPositionHelper');

    /**
     * 输入控件自动提示扩展
     *
     * 当输入控件加上此扩展后，其自动提示功能将由扩展自动提供
     *
     * @class extension.AutoComplete
     * @extends Extension
     * @constructor
     */
    function AutoComplete() {
        this.main = null;
        this.mainClass = 'ui-autocomplete';
        this.itemClass = 'ui-autocomplete-item';
        this.itemHoverClass = 'ui-autocomplete-item-hover';

        // 只作为分隔符, 不作为匹配word的成分参与匹配
        this.splitchar = ',';
        // 触发新的匹配动作, 并作为匹配word的一部分参与匹配
        this.firechar = '{';

        //this.endfirechar = '}';
        // 启用firechar时, 不考虑ismultiple的影响, 遇到firechar一律触发
        this.ismultiple = false;

        Extension.apply(this, arguments);

        if (this.ismultiple === 'false' || this.ismultiple === '0') {
            this.ismultiple = false;
        } else {
            this.ismultiple = !!this.ismultiple;
        }

        this.escapedSplitchar = escapeRegex(this.splitchar);
        this.escapedFirechar = escapeRegex(this.firechar);

        this.splitCharRE = new RegExp(this.escapedSplitchar + '([^' 
                            + this.escapedSplitchar 
                            + '\\s'
                            + ']+)$');

        this.fireCharRE = new RegExp('(' + this.escapedFirechar + '[^' 
                           + this.escapedSplitchar 
                           + this.escapedFirechar
                           + '\\s'
                           + ']*)$');
    }

    /**
     * 指定扩展类型，始终为`"AutoComplete"`
     *
     * @type {string}
     */
    AutoComplete.prototype.type = 'AutoComplete';

    

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
        return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
    }


    /**
     * 显示自动提示下拉列表
     *
     */
    function showSuggest(data) {
        var ret = '';
        if (data.length) {
            for (var i = 0, len = data.length; i < len; i++) {
                ret += '<div class="' + this.itemClass + '">' + data[i] + '</div>';
            }
        }
        this._updateSuggest(ret);
        ret ? this._showSuggest() : this._hideSuggest();
    }

    

    /**
     * 初始化自动提示dom容器
     *
     */
    AutoComplete.prototype._initMain = function () {
        this.input = lib.g(this.target.inputId);
        var me = this;
        this.main = document.createElement('div');
        this.main.className = this.mainClass;
        this.main.style.position = this.input.nodeName.toLowerCase() === 'textarea' ? 'absolute' : 'relative';
        this.main.style.width = this.target.main.width + 'px';
        this.main.style.display = 'none';
        this.target.main.appendChild(this.main);
        lib.on(this.main, 'click', this._selectItem = function (e) {
            me._setTargetValue(e.target.textContent);
            me._hideSuggest();
        });

        lib.on(this.main, 'mouseover', this._mouseOverItem = function (e) {
            if (e.target === this) {
                return;
            }

            var items = me.main.children;
            for (var i = 0, len = items.length; i < len; i++) {
                lib.removeClass(items[i], me.itemHoverClass);
            }

            lib.addClass(e.target, me.itemHoverClass);
        });

        lib.on(document, 'keydown', this._keyboard = function(e) {
            if (me.main.style.display === 'none') {
                return;
            }

            switch(e.keyCode) {
                // up
                case 38: lib.event.preventDefault(e);me._moveToPrevItem();break;
                // down
                case 40: lib.event.preventDefault(e);me._moveToNextItem();break;
                // esc
                case 27: me._hideSuggest();break;
                // enter
                case 13: {
                    lib.event.preventDefault(e);
                    var selectedItem = me._getSelectedItem();
                    if (!selectedItem) {
                        return;
                    }
                    me._setTargetValue(selectedItem.textContent);
                    me._hideSuggest();
                    break;
                }
            }
        });
    };

    /**
     * 为TextBox赋值
     *
     */
    AutoComplete.prototype._setTargetValue = function (value) {
        var targetValue = this.target.getValue();
        targetValue = lib.trim(targetValue);

        if (this.ismultiple) {
            if (this.fireCharRE.test(targetValue)) {
                value = targetValue.replace(this.fireCharRE, value);
            } else if(this.splitCharRE.test(targetValue)) {
                value = targetValue.replace(this.splitCharRE, this.splitchar + value);
            }
        } else if (this.fireCharRE.test(targetValue)) {
            value = targetValue.replace(this.fireCharRE, value);
        }

        this.target.setValue(value);
    };

    /**
     * 抽取需要匹配的单词
     *
     */
    AutoComplete.prototype._extractMatchingWord = function (value) {
        if (this.ismultiple && this.splitCharRE.test(value)) {
            var arr = this.splitCharRE.exec(value);
            value = arr && arr[1];
        }

        if (value && this.fireCharRE.test(value)) {
            arr = this.fireCharRE.exec(value);
            value = arr && arr[1];
        }
        return value;
    };

    /**
     * 移除自动提示dom容器
     *
     */
    AutoComplete.prototype._removemain = function () {
        this.target.main.removeChild(this.main);
    };

    /**
     * 更新自动提示下拉列表
     *
     */
    AutoComplete.prototype._updateSuggest = function (htmlText) {
        this.main.innerHTML = htmlText;
    };

    /**
     * 显示自动提示下拉列表
     *
     */
    AutoComplete.prototype._showSuggest = function () {
        if (this.main.style.display === 'none') {
            this.main.style.display = '';
        }

        if (this.input.nodeName.toLowerCase() === 'textarea') {
            // TODO: 这里计算光标的像素坐标还是没有非常精确
            var pos = cursorHelper.getInputPositon(this.input);
            var offset = lib.getOffset(this.input);
            var scrollTop = this.input.scrollTop;
            var scrollLeft = this.input.scrollLeft;
            this.main.style.left = pos.left - offset.left - scrollLeft + 5 + 'px';
            this.main.style.top = pos.top - scrollTop - 42  + 'px';
        }
    };

    /**
     * 隐藏自动提示下拉列表
     *
     */
    AutoComplete.prototype._hideSuggest = function () {
        if (this.main.style.display !== 'none') {
            this.main.style.display = 'none';
        }
    };

    /**
     * 键盘向下移动
     *
     */
    AutoComplete.prototype._moveToNextItem = function() {
        var items = this.main.children;
        var selectedItemIndex = this._getSelectedItemIndex();

        if (selectedItemIndex !== -1) {
            var selectedItem = items[selectedItemIndex];
            selectedItem && lib.removeClass(selectedItem, this.itemHoverClass);
        }

        if (selectedItemIndex === -1 || selectedItemIndex === items.length - 1) {
            selectedItemIndex = 0;
        } else {
            selectedItemIndex++;
        }
        selectedItem = items[selectedItemIndex];
        selectedItem && lib.addClass(selectedItem, this.itemHoverClass);
    };

    /**
     * 键盘向上移动
     *
     */
    AutoComplete.prototype._moveToPrevItem = function() {
        var items = this.main.children;
        var selectedItemIndex = this._getSelectedItemIndex();

        if (selectedItemIndex !== -1) {
            var selectedItem = items[selectedItemIndex];
            selectedItem && lib.removeClass(selectedItem, this.itemHoverClass);
        }

        if (selectedItemIndex === -1 || selectedItemIndex === 0) {
            selectedItemIndex = items.length - 1;
        } else {
            selectedItemIndex--;
        }
        selectedItem = items[selectedItemIndex];
        selectedItem && lib.addClass(selectedItem, this.itemHoverClass);
    };

    /**
     * 查找选中项的索引值
     *
     */
    AutoComplete.prototype._getSelectedItemIndex = function() {
        var items = this.main.children;
        var selectedItemIndex = -1;
        for (var i = 0, len = items.length; i < len; i++) {
            if (lib.hasClass(items[i], this.itemHoverClass)) {
                selectedItemIndex = i;
                break;
            }
        }
        return selectedItemIndex;
    };

    /**
     * 查找选中项
     *
     */
    AutoComplete.prototype._getSelectedItem = function() {
        var selectedItem;
        var selectedItemIndex = this._getSelectedItemIndex();
        if (selectedItemIndex !== -1) {
            selectedItem = this.main.children[selectedItemIndex];
        }
        return selectedItem;
    };

    AutoComplete.prototype.attachTo = function () {
        Extension.prototype.attachTo.apply(this, arguments);

        var me = this;
        setTimeout(function() {
            me._initMain();
        }, 0);
    };

    /**
     * 激活扩展
     *
     * @override
     */
    AutoComplete.prototype.activate = function () {
        // 只对`TextBox`控件生效
        if (!(this.target instanceof TextBox)) {
            return;
        }

        var me = this;
        this.target.on('input', this._oninput = function oninput(e) {
            var value = this.getValue();
            value = lib.trim(value);

            if (!value) {
                me._updateSuggest('');
                me._hideSuggest();
                return;
            }

            value = me._extractMatchingWord(value);

            if (!value) {
                return;
            }

            if (typeof this.datasource === 'function') {
                this.datasource.call(this, value, function(data) {
                    showSuggest.call(me ,filter(value, data));
                });
            } else if (this.datasource && this.datasource.length) {
                showSuggest.call(me, filter(value, this.datasource));
            }
        });

        this.target.on('blur', this._blurinput = function(e) {
            if (me.blurInputTimer) {
                clearTimeout(me.blurInputTimer);
                me.blurInputTimer = null;
            }
            me.blurInputTimer = setTimeout(function() {
                me._hideSuggest();
            },250);
        });
        Extension.prototype.activate.apply(this, arguments);
    };

    /**
     * 取消扩展的激活状态
     *
     * @override
     */
    AutoComplete.prototype.inactivate = function () {
        // 只对`TextBox`控件生效
        if (!(this.target instanceof TextBox)) {
            return;
        }

        this.target.un('input', this._oninput);
        this.target.un('blur', this._blurinput);

        lib.un(document, 'keydown', this._keyboard);
        lib.un(this.main, 'click', this._selectItem);
        lib.un(this.main, 'mouseover', this._mouseOverItem);
        this._removemain();

        Extension.prototype.inactivate.apply(this, arguments);
    };

    require('esui/lib').inherits(AutoComplete, Extension);
    require('esui/main').registerExtension(AutoComplete);
    return AutoComplete;
 });