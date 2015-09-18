/**
 * UB-RIA-UI
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 过滤器
 * @exports filter.Filter
 * @author yaofeifei@baidu.com; liwei47@baidu.com
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
     * @class filter.Filter
     * @extends esui.InputControl
     */
    var Filter = eoo.create(
        InputControl,
        {

            /**
             * @override
             */
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
                var html = '<div id="${filterPanelId}" class="${filterPanelStyle}">'
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
                    name: ['datasource', 'rawValue'],
                    paint: function (filter, datasource, rawValue) {
                        if (!u.isArray(rawValue)) {
                            rawValue = [rawValue];
                        }

                        u.each(filter.datasource, function (item, index) {
                            if (u.indexOf(rawValue, item.value) > -1) {
                                item.selected = true;
                            }
                        });

                        filter.buildItems();
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
                        var itemRemoveClass = controlHelper.getPartClassName('item-remove');
                        var cmdItemClass = controlHelper.getPartClassName('item-cmd');
                        var $t = $(e.target);
                        var $tWrapper = $t.closest('a');

                        e.preventDefault();
                        if ($t.hasClass(itemRemoveClass)) {
                            var value = $tWrapper.data('value');
                            var item = {value: value};

                            me.removeItem(item);
                            me.fire('custom-item-remove', {item: item});
                        }
                        else {
                            if ($tWrapper.hasClass(itemClass)) {
                                var item = {
                                    value: $tWrapper.attr('data-value'),
                                    text: $tWrapper.text()
                                };

                                me.selectItem(item);
                            }
                            else if ($tWrapper.hasClass(cmdItemClass)) {
                                me.fire('custom-link-click');
                            }
                        }
                    }
                );
            },

            /**
             * 根据datasource生成选择项
             *
             * @param {Array} datasource 选项列表数据源
             * @private
             */
            buildItems: function () {
                var helper = this.helper;
                var htmls = u.map(
                    this.datasource,
                    function (item) {
                        var active = item.selected ? helper.getPartClassName('item-active') : '';
                        return buildItem.call(this, item, active);
                    },
                    this
                );

                helper.getPart('items-panel').innerHTML = htmls.join('');
                this.custom && buildCustomItem.call(this);
            },

            /**
             * 新增选择项
             *
             * @public
             * @param {Object} item 新增的选择项
             */
            addItem: function (item) {
                this.datasource.push(item);
                this.buildItems();
            },

            /**
             * 移除选择项
             *
             * @param {Object} item 待移除的项
             */
            removeItem: function (item) {
                var removeItem = this.getItemByValue(item.value);
                this.datasource = u.without(this.datasource, removeItem);
                this.buildItems();
            },

            /**
             * 设置选择项
             *
             * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
             * @public
             */
            unselectItem: function (item) {
                if (!item || !this.getItemByValue(item.value)) {
                    return;
                }
                var targetItem = this.getItemByValue(item.value);
                targetItem.selected = false;
                this.buildItems();
            },

            /**
             * 选择项
             *
             * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
             * @param {HtmlElement} target 选中的元素
             * @private
             */
            selectItem: function (item) {
                var selectedItem = this.getItemByValue(item.value);
                var lastItem;
                var oldSelected = selectedItem.selected;

                // 需要移除前一个单选
                if (!this.multiple && !oldSelected) {
                    var selectedItems = this.getSelectedItems();
                    if (selectedItems.length > 0) {
                        lastItem = selectedItems[0];
                        lastItem.selected = false;
                    }
                }

                selectedItem.selected = !selectedItem.selected;

                /**
                 * @event select
                 *
                 * 选择时触发
                 */
                this.fire('change', {
                    item: item,
                    lastItem: lastItem,
                    action: oldSelected ? 'unselect' : 'select'
                });
                this.buildItems();
            },

            /**
             * 根据值获取整个选择项的数据
             *
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
             *
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
             *
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
     *
     * @param {Object} item 选项数据
     * @param {string} style 额外的样式
     * @return {HtmlElement} 生成的选择项元素
     * @private
     */
    function buildItem(item, style) {
        var htmls = [
            '<a href="#" class="${style}" data-value="${value}" data-allow-delete="${allowDelete}">',
            '<span>${text}</span>',
            '</a>'
        ];
        var allowDeleteSegment = '<span class="ui-icon ui-filter-remove ui-filter-item-remove"></span>';
        var allowDelete = item.allowDelete || false;
        allowDelete && htmls.splice(2, 0, allowDeleteSegment);

        return lib.format(
            htmls.join(''),
            {
                style: this.helper.getPartClassName('item') + ' ' + (style || ''),
                value: item.value,
                text: item.text
            }
        );
    }

    /**
     * 生成自定义项
     */
    function buildCustomItem() {
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
    }

    esui.register(Filter);
    return Filter;
});
