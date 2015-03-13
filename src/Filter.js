/**
 * 过滤器
 * @file: Filter.js
 * @author: liwei
 *
 */

define(function (require) {
    var lib = require('esui/lib');
    var u = require('underscore');
    var Panel = require('esui/Panel');
    var eoo = require('eoo');

    require('esui/Panel');
    require('esui/Label');

    var exports = {};


    /**
     * Filter
     *
     * @extends Panel
     * @constructor
     */
    exports.constructor = function () {
        this.$super(arguments);
        this.conditionMap = {};
    };

    exports.type = 'Filter';

    /**
     * 初始化配置
     *
     * @protected
     * @override
     */
    exports.initOptions = function (options) {
        var properties = {
            multiple: false,// 默认单选
            custom: false,// 是否支持自定义
            customBtnLabel: '自定义',// 自定义按钮Label
            // 默认自定义输入控件的确定按钮的回调
            onsave: function (itemTexts, res) {
                var item = {
                    text: itemTexts.join('-'),
                    value: itemTexts.join('-')
                };
                res(item);
            }
        };
        u.extend(properties, options);

        this.setProperties(properties);

        if (this.multiple === 'false' || this.multiple === '0' || this.multiple === '') {
            this.multiple = false;
        }

        if (this.custom === 'false' || this.custom === '0' || this.custom === '') {
            this.custom = false;
        }

        this.customElements = [];
    };

    /**
     * 初始化DOM结构
     *
     * @protected
     * @override
     */
    exports.initStructure = function () {
        if (this.custom) {
            var me = this;
            u.forEach(this.main.childNodes, function (node) {
                if (node.nodeType === 1) {
                    me.customElements.push(node);
                }
            });

            if (!this.customElements.length) {
                var customTpl = '<div style="display:inline-block"><input type="text" style="width:50px"/>'
                    + '<input type="button" data-role="ok" value="确定"/><input type="button" data-role="cancel" value="取消"/></div>';
                var div = document.createElement('div');
                div.innerHTML = customTpl;
                u.forEach(div.childNodes, function (node) {
                    if (node.nodeType === 1) {
                        me.customElements.push(node);
                    }
                });
            }
        }


        var html = '<div data-ui-type="Panel" data-ui-id="${filterPanelId}" class="${filterPanelStyle}">'
                + '<label data-ui-type="Label" data-ui-id="${labelId}"></label>'
                + '<div data-ui-type="Panel" data-ui-id="${contentPanelId}" class="${contentPanelStyle}"></div></div>';
        this.main.innerHTML = lib.format(
            html,
            {
                filterPanelStyle: this.helper.getPartClassName('panel'),
                filterPanelId: this.helper.getId('items-wrapper-panel'),
                labelId: this.helper.getId('items-label'),
                contentPanelId: this.helper.getId('items-panel'),
                contentPanelStyle: this.helper.getPartClassName('items-panel')
            }
        ) + lib.format(
            html,
            {
                filterPanelStyle: this.helper.getPartClassName('panel'),
                filterPanelId: this.helper.getId('items-selected-wrapper-panel'),
                labelId: this.helper.getId('items-selected-label'),
                contentPanelId: this.helper.getId('items-selected-panel'),
                contentPanelStyle: this.helper.getPartClassName('items-selected-panel')
            }
        );

        // 创建控件树
        this.initChildren(this.main);
    };

    /**
     * 根据datasource生成选择项
     * @param {Array} datasource 选项列表数据源
     * @private
     */
    exports.buildItems = function (datasource) {
        var html = '<a href="javascript:;" class="${style}" data-value="${value}">${text}</a>';
        var s = '';
        var helper = this.helper;

        u.forEach(datasource, function (item) {
            s += lib.format(
                html,
                {
                    value: item.value,
                    text: item.text,
                    style: helper.getPartClassName('item')
                }
            );
        });
        var itemsPanel = this.getItemsPanel();
        itemsPanel.setContent(s);

        this.custom && this.buildCustomItem();
    };

    /**
     * 根据选项数据生成选择项
     * @param {Object} item 选项数据
     * @return {HtmlElement} 生成的选择项元素
     * @private
     */
    exports.buildItem = function (item) {
        var html = '<a href="javascript:;" class="${style}" data-value="${value}">${text}</a>';
        var div = document.createElement('div');
        div.innerHTML = lib.format(
            html,
            {
                value: item.value,
                text: item.text,
                style: this.helper.getPartClassName('item')
            }
        );
        var itemElement = div.firstChild;
        lib.insertBefore(itemElement, this.customBtn);
        return itemElement;
    };

    /**
     * 生成自定义项
     * @private
     */
    exports.buildCustomItem = function () {
        var html = '<a href="javascript:;" class="${style}">${text}</a>';
        var itemsPanel = this.getItemsPanel();
        itemsPanel.appendContent(lib.format(html, {
            style: this.helper.getPartClassName('item-cmd'),
            text: this.customBtnLabel
        }));
        this.customBtn = itemsPanel.main.lastChild;
    };

    /**
     * 提示区域生成选中项
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @private
     */
    exports.buildSelectedItems = function (item) {
        var html = '<a href="javascript:;" class="${style}" data-value="${value}">'
                + '<span>${text}</span><i>&times;</i></a>';
        var selectedItemsPanel = this.getSelectedItemsPanel();
        var clonedItem = u.extend({}, item);
        clonedItem.style = this.helper.getPartClassName('item-selected');
        selectedItemsPanel[this.multiple ? 'appendContent' : 'setContent'](lib.format(html, clonedItem));
    };

    /**
     * 获取备选项Panel
     * @return {Panel} 备选项Panel
     * @private
     */
    exports.getItemsPanel = function () {
        var itemsPanelId = this.helper.getId('items-panel');
        return this.viewContext.get(itemsPanelId);
    };

    /**
     * 获取提示已选项Panel
     * @return {Panel} 提示已选项Panel
     * @private
     */
    exports.getSelectedItemsPanel = function () {
        var selectedPanelId = this.helper.getId('items-selected-panel');
        return this.viewContext.get(selectedPanelId);
    };

    /**
     * 获取备选项提示Label
     * @return {Panel} 备选项提示Label
     * @private
     */
    exports.getItemsLabel = function () {
        var itemsLabelId = this.helper.getId('items-label');
        return this.viewContext.get(itemsLabelId);
    };

    /**
     * 获取提示已选项提示Label
     * @return {Panel} 提示已选项提示Label
     * @private
     */
    exports.getSelectedItemsLabel = function () {
        var selectedLabelId = this.helper.getId('items-selected-label');
        return this.viewContext.get(selectedLabelId);
    };

    /**
     * 添加自定义输入控件
     * @param {HtmlElement} target 自定义输入控件插入位置参考元素
     * @private
     */
    exports.addCustomInput = function (target) {
        var me = this;
        this.customInputs = [];
        u.forEach(this.customElements, function (node) {
            walkDomTree(node, function (node) {
                var role = lib.getAttribute(node, 'data-role');
                if (!me.customOkBtn && role === 'ok') {
                    me.customOkBtn = node;
                }
                else if (!me.customCancelBtn && role === 'cancel') {
                    me.customCancelBtn = node;
                }
                else if (node.nodeName === 'INPUT' && node.type === 'text') {
                    me.customInputs.push(node);
                }
            });
            lib.insertBefore(node, target);
        });
        target.style.display = 'none';
    };

    /**
     * 移除自定义输入控件
     * @private
     */
    exports.removeCustemInput = function () {
        u.forEach(this.customElements, function (node) {
            lib.removeNode(node);
        });
        this.customBtn.style.display = '';
        // 置空输入控件
        u.each(this.customInputs, function (input) {
            input.value && (input.value = '');
        });
    };

    /**
     * 保存自定义条件选项
     * @private
     */
    exports.saveCustomItem = function () {
        var itemsText = [];
        var me = this;
        var hasBlank = false;
        u.each(this.customInputs, function (input) {
            if (!input.value) {
                hasBlank = true;
                return false;
            }
            itemsText.push(input.value);
        });
        if (hasBlank) {
            alert('不允许输入为空，请输入完整！');
            return;
        }

        this.onsave(itemsText, function (item) {
            if (me.hasRepeatItemInDatasource(item)) {
                alert('存在重复的选择项，请重新输入！');
                return;
            }
            me.datasource.push(item);
            var element = me.buildItem(item);
            me.removeCustemInput();
            me.selectItem(item, element);
        });
    };

    /**
     * 检查在datasource中是否存在重复的选项
     * @param {Object} repeatItem 待检测的选项数据
     * @return {bool} 是否存在重复项
     */
    exports.hasRepeatItemInDatasource = function (repeatItem) {
        var ret = false;
        u.each(this.datasource, function (item) {
            if (item.value === repeatItem.value || item.text === repeatItem.text) {
                ret = true;
                return false;
            }
        });
        return ret;
    };

    /**
     * 初始化事件交互
     *
     * @protected
     * @override
     */
    exports.initEvents = function () {
        var itemsPanel = this.getItemsPanel();
        var selectedItemsPanel = this.getSelectedItemsPanel();
        var me = this;
        this.helper.addDOMEvent(
            itemsPanel.main,
            'click',
            function (e) {
                var target = e.target;

                if (target === me.customOkBtn) {
                    me.saveCustomItem();
                    return;
                }

                if (target === me.customCancelBtn) {
                    me.removeCustemInput();
                    return;
                }

                if (target.nodeName !== 'A') {
                    return;
                }

                if (me.custom && target === me.customBtn) {
                    me.addCustomInput(target);
                    return;
                }
                var value = lib.getAttribute(target, 'data-value');
                var text = lib.getText(target);
                var item = {
                    value: value,
                    text: text
                };

                me.selectItem(item, target);
            }
        );

        this.helper.addDOMEvent(
            selectedItemsPanel.main,
            'click',
            function (e) {
                var target = e.target;
                if (!/^(?:A|I|SPAN)$/.test(target.nodeName)) {
                    return;
                }
                target = /^A$/.test(target.nodeName) ? target : target.parentNode;
                var value = lib.getAttribute(target, 'data-value');
                var text = lib.getText(lib.dom.first(target));
                var item = {
                    value: value,
                    text: text
                };

                me.removeSelectedItem(item, target);
            }
        );
    };

    /**
     * 取消选择`不限`项
     *
     * @private
     */
    exports.unselectAnyItem = function () {
        if (!this.anyItem) {
            return;
        }
        var me = this;
        this.removeCondition(this.anyItem);
        var itemsPanel = this.getItemsPanel();
        var itemLinks = itemsPanel.main.childNodes;
        u.each(itemLinks, function (itemLink) {
            if (lib.getAttribute(itemLink, 'data-value') === me.anyItem.value) {
                me.helper.removePartClasses('item-active', itemLink);
                return false;
            }
        });
    };

    /**
     * 选择`不限`项
     *
     * @private
     */
    exports.selectAnyItem = function () {
        if (!this.anyItem) {
            return;
        }

        var selectedItemsPanel = this.getSelectedItemsPanel();
        if (selectedItemsPanel.main.childNodes.length) {
            return;
        }

        var me = this;
        var itemsPanel = this.getItemsPanel();
        var itemLinks = itemsPanel.main.childNodes;
        u.each(itemLinks, function (itemLink) {
            if (lib.getAttribute(itemLink, 'data-value') === me.anyItem.value) {
                me.helper.addPartClasses('item-active', itemLink);
                return false;
            }
        });
        this.addCondition(this.anyItem);
    };

    /**
     * 选择项
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @param {HtmlElement} target 选中的元素
     * @private
     */
    exports.selectItem = function (item, target) {
        this.unselectAnyItem();
        if (this.hasCondition(item)) {
            return;
        }

        var helper = this.helper;
        if (!this.multiple) {
            this.conditionMap = {};
            var cls = helper.getPartClassName('item-active');
            var itemLinks = target.parentNode.childNodes;
            u.each(itemLinks, function (itemLink) {
                if (lib.hasClass(itemLink, cls)) {
                    helper.removePartClasses('item-active', itemLink);
                    return false;
                }
            });
        }

        this.addCondition(item);
        this.showSelectedItem(item);
        helper.addPartClasses('item-active', target);
        u.isFunction(this.onselect) && this.onselect(this.conditionMap, item, target);
    };

    /**
     * 更新提示区的选中项
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @private
     */
    exports.showSelectedItem = function (item) {
        if (this.anyItem && item.value === this.anyItem.value) {
            this.removeAllSelectedItems();
        }
        else {
            this.buildSelectedItems(item);
        }
    };

    /**
     * 移除选中项
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @param {HtmlElement} target 取消选中的元素
     * @private
     */
    exports.removeSelectedItem = function (item, target) {
        lib.removeNode(target);

        var helper = this.helper;
        var itemsPanel = this.getItemsPanel();
        var itemLinks = itemsPanel.main.childNodes;
        u.each(itemLinks, function (itemLink) {
            if (lib.getAttribute(itemLink, 'data-value') === item.value) {
                helper.removePartClasses('item-active', itemLink);
                return false;
            }
        });

        this.removeCondition(item);

        this.selectAnyItem();
        u.isFunction(this.onunselect) && this.onunselect(this.conditionMap, item, target);
    };

    /**
     * 移除所有选中项
     * @private
     */
    exports.removeAllSelectedItems = function () {
        var selectedItemsPanel = this.getSelectedItemsPanel();
        selectedItemsPanel.main.innerHTML = '';

        var me = this;
        var helper = this.helper;
        var cls = helper.getPartClassName('item-active');
        var itemsPanel = this.getItemsPanel();
        var itemLinks = itemsPanel.main.childNodes;
        u.each(itemLinks, function (itemLink) {
            if (lib.hasClass(itemLink, cls)) {
                helper.removePartClasses('item-active', itemLink);
                me.removeCondition({
                    value: lib.getAttribute(itemLink, 'data-value'),
                    text: lib.getText(itemLink)
                });
            }
        });
    };

    /**
     * 添加选中项条件
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @protected
     */
    exports.addCondition = function (item) {
        this.conditionMap[item.value] = item.text;
    };

    /**
     * 移除选中项条件
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @protected
     */
    exports.removeCondition = function (item) {
        delete this.conditionMap[item.value];
    };

    /**
     * 判断选中条件是否已经存在
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @return {bool} 是否已经存在选中条件
     * @protected
     */
    exports.hasCondition = function (item) {
        return !!this.conditionMap[item.value];
    };

    /**
     * 重渲染
     *
     * @method
     * @protected
     * @override
     */
    exports.repaint = require('esui/painters').createRepaint(
        Panel.prototype.repaint,
        {
            name: ['datasource'],
            paint: function (filterPanel, datasource) {
                filterPanel.buildItems(datasource);
                // 设置`不限`的选项，使用isAny字段标识
                u.each(datasource, function (item) {
                    if (item.isAny) {
                        filterPanel.anyItem = item;
                        return false;
                    }
                });
            }
        },
        {
            name: ['itemsLabel', 'selectedItemsLabel'],
            paint: function (filterPanel, itemLabel, selectedLabel) {
                filterPanel.getItemsLabel().setText(itemLabel);
                filterPanel.getSelectedItemsLabel().setText(selectedLabel);
            }
        }
    );

    /**
     * 获取选中的条件
     * @return {Object} 选中的条件
     */
    exports.getValue = function () {
        return this.conditionMap;
    };


    function walkDomTree (root, callback) {
        if (root.nodeType !== 1) {
            return;
        }
        callback(root);
        if (root.childNodes) {
            u.forEach(root.childNodes, function (node) {
                walkDomTree(node, callback);
            });
        }
    }

    var Filter = eoo.create(Panel, exports);
    require('esui/main').register(Filter);
    return Filter;
});
