/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 富选择控件组合
 * @exports RichSelectorGroup
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var u = require('underscore');
        var eoo = require('eoo');
        var InputControl = require('esui/InputControl');
        var esui = require('esui');
        var painters = require('esui/painters');

        function traverseTree(tree, getter) {
            var children = u.map(
                tree,
                function (node) {
                    return traverseTreeWithRoot(node, getter);
                }
            );

            return children;
        }

        function traverseTreeWithRoot(tree, getter) {
            if (u.isArray(tree)) {
                tree = traverseTree(tree, getter);
            }
            else if (u.isObject(tree) && tree) {
                tree = getter(tree);

                if (tree.children) {
                    tree.children = traverseTree(tree.children, getter);
                }
            }

            return tree;
        }

        /**
         * 富选择控件组合一或两个富选择控件组成，支持单控件选择或左右控件互选
         *
         * 左右选择控件的类型以及配置由使用者通过模板自行定义
         *
         * ```
         * <div
         *   data-ui-type="CascadingRichSelector"
         *   data-ui-id="cas-slots"
         *   data-ui-name="cas-slots">
         *   <esui-table-rich-selector
         *       data-ui-child-name="source"
         *       data-ui-title="全部有效代码位"
         *       data-ui-has-head="true"
         *       data-ui-has-search-box="true"
         *       data-ui-need-batch-action="true"
         *      data-ui-batch-action-label="选择全部">
         *   </esui-table-rich-selector>
         *   <esui-table-rich-selector
         *       data-ui-child-name="target"
         *       data-ui-title="已选择代码位"
         *       data-ui-mode="delete"
         *       data-ui-need-batch-action="true"
         *       data-ui-batch-action-label="删除全部"
         *       data-ui-empty-text="请从左侧选择要添加的代码位">
         *   </esui-table-rich-selector>
         * </div>
         *
         * ```
         * 选择控件必须配置childName，'source'代表源选择器，'target'代表目标选择器
         *
         * @class RichSelectorGroup
         * @extends esui.InputContro;
         */
        var RichSelectorGroup = eoo.create(
            InputControl,
            {

                /**
                 * @override
                 */
                type: 'RichSelectorGroup',

                getCategory: function () {
                    return 'input';
                },

                /**
                 * @override
                 */
                initStructure: function () {
                    this.helper.initChildren();
                },

                /**
                 * @override
                 */
                initEvents: function () {

                    var filter = this.getChild('filter');
                    var source = this.getChild('source');
                    var target = this.getChild('target');

                    // 绑事件
                    filter && filter.on('load', this.fire.bind(this, 'load'));

                    source && source.on(
                        'add',
                        function (e) {
                            var newdata = e.target.getSelectedItemsFullStructure();
                            // 把所有节点的isSelected置false后传给另一个控件
                            newdata = traverseTreeWithRoot(
                                newdata,
                                function (node) {
                                    var newNode = u.clone(node);
                                    newNode.isSelected = false;

                                    return newNode;
                                }
                            );
                            target && target.setProperties({datasource: newdata});
                            this.fire('add');
                            this.fire('change');
                        },
                        this
                    );

                    target && target.on(
                        'delete',
                        function (e) {
                            source && source.selectItems(e.items, false);
                            this.fire('delete');
                            this.fire('change');
                        },
                        this
                    );
                },

                /**
                 * @override
                 */
                repaint: painters.createRepaint(
                    InputControl.prototype.repaint,
                    {
                        name: 'rawValue',
                        paint: function (me, rawValue) {
                            if (rawValue) {
                                me.getRealTargetSelector().setProperties({datasource: rawValue});
                            }
                        }
                    },
                    {
                        name: 'disabled',
                        paint: function (me, disabled) {
                            if (disabled) {
                                me.helper.disableChildren();
                            }
                            else {
                                me.helper.enableChildren();
                            }
                        }
                    }
                ),

                getRealTargetSelector: function () {
                    var source = this.getChild('source');
                    var target = this.getChild('target');
                    if (target) {
                        return target;
                    }
                    return source;
                },

                getValue: function () {
                    return this.getRealTargetSelector().getValue();
                },

                getRawValue: function () {
                    return this.getRealTargetSelector().getRawValue();
                },

                /**
                 * 进行验证
                 *
                 * @return {boolean}
                 */
                validate: function () {
                    var target = this.getRealTargetSelector();

                    if (typeof target.validate === 'function') {
                        return target.validate();
                    }
                }
            }
        );

        esui.register(RichSelectorGroup);
        return RichSelectorGroup;
    }
);
