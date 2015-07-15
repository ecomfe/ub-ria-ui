/**
 * 过滤器
 * @file: Filter.js
 * @author: yaofeifei@baidu.com; liwei47@baidu.com
 *
 */

define(function (require) {
    var lib = require('esui/lib');
    var u = require('underscore');
    var InputControl = require('esui/InputControl');
    var eoo = require('eoo');
    var painters = require('esui/painters');
    var esui = require('esui');
    var $ = require('jquery');

    /**
     * Filter
     *
     * @extends InputControl
     * @constructor
     */
    var Filter = eoo.create(
        InputControl,
        {

            type: 'Filter',

            /**
             * 初始化配置
             *
             * @protected
             * @override
             */
            initOptions: function (options) {
                var properties = {
                    // 默认单选
                    multiple: false,
                    // 是否支持自定义
                    custom: false,
                    // 自定义按钮Label
                    customBtnLabel: '自定义',
                    datasource: [],
                    value: null
                };
                u.extend(properties, options);
                this.setProperties(properties);
            },

            /**
             * 初始化DOM结构
             *
             * @protected
             * @override
             */
            initStructure: function () {
                var controlHelper = this.helper;
                var mainEle = this.main;
                var html
                        = '<div id="${filterPanelId}" class="${filterPanelStyle}">'
                        + '<label id="${labelId}"></label>'
                        + '<div id="${contentPanelId}" class="${contentPanelStyle}"></div>'
                        + '</div>';

                mainEle.innerHTML = lib.format(
                    html,
                    {
                        filterPanelStyle: controlHelper.getPartClassName('panel'),
                        filterPanelId: controlHelper.getId('items-wrapper-panel'),
                        labelId: controlHelper.getId('items-label'),
                        contentPanelId: controlHelper.getId('items-panel'),
                        contentPanelStyle: controlHelper.getPartClassName('items-panel')
                    }
                );

                // 创建控件树
                this.initChildren(mainEle);
            },

            /**
             * 重渲染
             *
             * @method
             * @protected
             * @override
             */
            repaint: painters.createRepaint(
                InputControl.prototype.repaint,
                {
                    name: ['datasource', 'value'],
                    paint: function (filter, datasource, value) {
                        if (u.isString(value)) {
                            value = [value];
                        }
                        filter.lastSelectedItem = null;
                        u.each(datasource, function (item, index) {
                            u.each(value, function (single, i) {
                                if (item.value === single) {
                                    item.selected = true;
                                    if (!filter.multiple) {
                                        filter.lastSelectedItem = item;
                                    }
                                }
                            });
                        });
                        // 单选时， 如果没有设置默认值，则默认选择第一个
                        if (!filter.multiple
                            && !filter.lastSelectedItem
                            && datasource
                            && datasource[0]) {
                            datasource[0].selected = true;
                            filter.lastSelectedItem = datasource[0];
                        }
                        filter.buildItems(datasource);
                    }
                },
                {
                    name: ['label'],
                    paint: function (filter, label) {
                        $(filter.helper.getPart('items-label')).text(label);
                    }
                }
            ),

            /**
             * 初始化事件交互
             *
             * @protected
             * @override
             */
            initEvents: function () {
                var me = this;
                var controlHelper = me.helper;

                controlHelper.addDOMEvent(
                    me.main,
                    'click',
                    'a',
                    function (e) {
                        var itemClass = controlHelper.getPartClassName('item');
                        var cmdItemClass = controlHelper.getPartClassName('item-cmd');
                        var target = e.currentTarget;
                        var $t = $(target);

                        e.preventDefault();
                        if ($t.hasClass(itemClass)) {
                            var value = $t.attr( 'data-value');
                            var text = $t.text();
                            var item = {
                                value: value,
                                text: text
                            };

                            me.selectItem(item, target);
                        }
                        else if ($t.hasClass(cmdItemClass)) {
                            me.fire('custom-link-click');
                        }
                    }
                );
            },

            /**
             * 根据datasource生成选择项
             * @param {Array} datasource 选项列表数据源
             * @private
             */
            buildItems: function (datasource) {
                var s = '';
                var helper = this.helper;

                u.forEach(datasource, function (item) {
                    var active = item.selected ? helper.getPartClassName('item-active') : '';
                    s += buildItem.call(this, item, active);
                }, this);
                var itemsPanel = helper.getPart('items-panel');
                itemsPanel.innerHTML = s;
                this.custom && this.buildCustomItem();
            },

            /**
             * 生成自定义项
             * @private
             */
            buildCustomItem: function () {
                var html = '<a href="#" id="${customLinkId}" class="${style}">${text}</a>';
                var controlHelper = this.helper;
                var itemsPanel = controlHelper.getPart('items-panel');

                $(itemsPanel).append(
                    lib.format(
                        html,
                        {
                            customLinkId: controlHelper.getId('custom-link'),
                            style: controlHelper.getPartClassName('item-cmd'),
                            text: this.customBtnLabel
                        }
                    )
                );
            },

            /**
             * 设置选择项
             * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
             * @public
             */
            removeItem: function (item) {
                if (!item || !this.getItemByValue(item.value)) {
                    return;
                }
                var datasource = lib.deepClone(this.datasource);
                var targetItem = this.getItemByValue(item.value, datasource);
                targetItem.selected = false;
                this.setProperties({
                    datasource: datasource
                });
            },

            /**
             * 选择项
             * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
             * @param {HtmlElement} target 选中的元素
             * @private
             */
            selectItem: function (item, target) {
                var selectedItem = this.getItemByValue(item.value);
                // 是否之前被选中过
                var isChecked = false;
                if (selectedItem.selected) {
                    selectedItem.selected = false;
                    isChecked = true;
                }
                else {
                    selectedItem.selected = true;
                }
                var helper = this.helper;
                // 对单选的特殊处理
                if (!this.multiple) {
                    if (selectedItem === this.lastSelectedItem) {
                        selectedItem.selected = false;
                        this.lastSelectedItem = null;
                    }
                    else {
                        this.lastSelectedItem && (this.lastSelectedItem.selected = false);
                    }
                    var cls = helper.getPartClassName('item-active');
                    var itemLinks = target.parentNode.childNodes;
                    u.each(itemLinks, function (itemLink) {
                        if (lib.hasClass(itemLink, cls)) {
                            helper.removePartClasses('item-active', itemLink);
                            return false;
                        }
                    });
                }
                if (isChecked) {
                    helper.removePartClasses('item-active', target);
                }
                else {
                    helper.addPartClasses('item-active', target);
                }

                /**
                 * @event select
                 *
                 * 选择时触发
                 */
                this.fire('change', {
                    item: item,
                    lastItem: this.lastSelectedItem,
                    action: isChecked ? 'remove' : 'add'
                });
                if (this.multiple || !isChecked) {
                    this.lastSelectedItem = selectedItem;
                }
            },

            /**
             * 根据值获取整个选择项的数据
             * @param {string} value 值
             * @param {Object=} datasource 数据源
             * @return {Object} item 选中项的数据 格式如: {value: '', text: ''}
             * @public
             */
            getItemByValue: function (value, datasource) {
                var item;
                datasource = datasource || this.datasource;
                u.each(datasource, function (single, index) {
                    if (single.value === value) {
                        item = single;
                    }
                });
                return item;
            },

            /**
             * 获取选中的项
             * @return {Object} 选中项
             */
            getSelectedItems: function () {
                var items = [];
                u.each(this.datasource, function (item, index) {
                    if (item.selected) {
                        items.push(item);
                    }
                });
                return items;
            },

            /**
             * 获取选中的值
             * @return {Object} 选中项
             */
            getValue: function () {
                var items = this.getSelectedItems();
                var valueArr = [];
                u.each(items, function (item, index) {
                    valueArr.push(item.value);
                });
                return valueArr;
            }
        }
    );

    /**
     * 根据选项数据生成选择项
     * @param {Object} item 选项数据
     * @param {string} style 额外的样式
     * @return {HtmlElement} 生成的选择项元素
     * @private
     */
    function buildItem(item, style) {
        var html = '<a href="#" class="${style}" data-value="${value}">${text}</a>';
        style = style || '';

        return lib.format(
            html,
            {
                style: this.helper.getPartClassName('item') + ' ' + style,
                value: item.value,
                text: item.text
            }
        );
    }

    esui.register(Filter);
    return Filter;
});
