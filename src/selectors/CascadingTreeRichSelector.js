/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 * @file CascadingTreeRichSelector控件类
 * @author (yaofeifei@baidu.com)
 * @date 2015-03-02
 */

define(
    function (require) {
        require('esui/Panel');

        var InputControl = require('esui/InputControl');
        var helper = require('esui/controlHelper');
        var lib = require('esui/lib');
        var u = require('underscore');
        var ui = require('esui');

        require('./TreeRichSelector');

        /**
         * 控件类
         *
         * @constructs CascadingTreeRichSelector
         * @param {Object} options 初始化参数
         */
        function CascadingTreeRichSelector(options) {
            InputControl.apply(this, arguments);
        }

        lib.inherits(CascadingTreeRichSelector, InputControl);

        CascadingTreeRichSelector.prototype.type = 'CascadingTreeRichSelector';

        CascadingTreeRichSelector.prototype.initOptions = function (options) {
            var properties = {
                height: 340,
                width: 200,
                datasource: [],
                // 字段
                fields: [
                    {field: 'name', content: 'name', width: 110, searchScope: 'partial', isDefaultSearchField: true}
                ],
                keyField: 'id'
            };

            lib.extend(properties, options);

            properties.width = Math.max(200, properties.width);

            this.setProperties(properties);
        };

        CascadingTreeRichSelector.prototype.initStructure = function () {
            // source和target通用属性
            var commonOption = {
                needBatchAction: true,
                hasRowHead: false,
                hasFoot: false,
                itemName: this.itemName,
                height: this.height,
                width: this.width,
                fields: this.fields,
                keyField: this.keyField
            };

            // 备选区属性
            var sourceOption = {
                mode: 'add',
                hasSearchBox: this.hasSourceSearchBox,
                batchActionLabel: '添加全部',
                title: this.sourceTitle,
                emptyText: this.sourceEmptyText
            };

            // 已选区属性
            var targetOption = {
                mode: 'delete',
                hasSearchBox: this.hasTargetSearchBox,
                batchActionLabel: '删除全部',
                title: this.targetTitle,
                emptyText: this.targetEmptyText
            };

            var sourceSelector = ui.create('TreeRichSelector', u.extend(sourceOption, commonOption));
            var targetSelector = ui.create('TreeRichSelector', u.extend(targetOption, commonOption));

            this.helper.addPartClasses('source', sourceSelector.main);
            this.helper.addPartClasses('source', targetSelector.main);

            this.addChild(sourceSelector, 'source');
            sourceSelector.appendTo(this.main);

            this.addChild(targetSelector, 'target');
            targetSelector.appendTo(this.main);
        };
        /**
         * 初始化与DOM元素、子控件等的事件交互，仅在第一次渲染时调用
         *
         * @override
         */
        CascadingTreeRichSelector.prototype.initEvents = function () {
            var sourceSelector = this.getChild('source');
            var targetSelector = this.getChild('target');
            sourceSelector.on(
                'add',
                function () {
                    var newdata = this.getSelectedTree();
                    targetSelector.setProperties({datasource: newdata});
                }
            );
            targetSelector.on(
                'delete',
                function (arg) {
                    var items = arg.items;
                    sourceSelector.selectItems(items, false);
                }
            );
        };
        /**
         * 根据外部设定来刷新
         *
         * @param {ui.CascadingTreeRichSelector} control 类实例
         * @param {Array} datasource 数据源
         * @param {Array} rawValue 初始值
         * @ignore
         */
        function refresh(control, datasource, rawValue) {
            /**
             * 数据源，里面的具体格式以后端数据为准
             * [
             *     {
             *         id: 1,
             *         name: 'xxxx',
             *         otherField: 'yyyy'
             *         ...
             *     }
             * ]
             * @type {Array}
             */
            if (!datasource) {
                return;
            }
            var source = control.getChild('source');
            source.walkTree(
                datasource,
                datasource.children,
                function (parent, child) {
                    u.each(
                        rawValue,
                        function (id) {
                            if (id === child.id) {
                                child.isSelected = true;
                            }
                        }
                    );
                }
            );
            // 更新source状态
            source.setProperties({datasource: datasource});

            // 更新target状态
            var target = control.getChild('target');
            var newdata = source.getSelectedTree();
            target.setProperties({datasource: newdata});
        }

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        CascadingTreeRichSelector.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: ['datasource', 'rawValue'],
                paint: refresh
            }
        );

        /**
         * 获取已经选择的数据项
         * 就是一个代理，最后从结果列表控件里获取
         * @return {Array}
         * @public
         */
        CascadingTreeRichSelector.prototype.getSelectedTree = function () {
            var source = this.getChild('source');
            return source.getSelectedTree();
        };

        /**
         * 设置元数据
         *
         * @param {Array} selectedItems 置为选择的项.
         */
        CascadingTreeRichSelector.prototype.setRawValue = function (selectedItems) {
            this.set('rawValue', selectedItems);
        };

        /**
         * 获取已经选择的数据项
         *
         * @return {Array}
         */
        CascadingTreeRichSelector.prototype.getRawValue = function () {
            var selectedItems = this.getChild('target').getSelectedItems();
            var rawValue = [];
            u.each(selectedItems, function (item, index) {
                // 只取树末节点的id
                if (!item.children) {
                    rawValue.push(item.id);
                }
            });
            return rawValue;
        };

        /**
         * 将value从原始格式转换成string
         *
         * @param {*} rawValue 原始值
         * @return {string}
         */
        CascadingTreeRichSelector.prototype.stringifyValue = function (rawValue) {
            var selectedIds = [];
            u.each(rawValue, function (item) {
                selectedIds.push(item);
            });
            return selectedIds.join(',');
        };

        require('esui').register(CascadingTreeRichSelector);

        return CascadingTreeRichSelector;
    }
);
