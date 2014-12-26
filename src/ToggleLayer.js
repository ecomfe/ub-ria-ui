/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 浮层控件
 * @author liyidong(srhb18@gmail.com)
 */

define(
    function (require) {
        var Control = require('esui/Control');
        var lib = require('esui/lib');
        var ui = require('esui');

        require('esui/Panel');
        require('esui/Overlay');

        var exports = {};
        /**
         * 控件类型
         *
         * @override
         */
        exports.type = 'ToggleLayer';

        /**
         * 初始化参数
         *
         * @override
         * @protected
         */
        exports.initOptions = function (options) {
            var defaultProperties = {
                expanded: false
            };

            var properties = lib.extend(defaultProperties, options);

            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        exports.initStructure = function () {
            var children = lib.getChildren(this.main);
            var titleElem = children[0];
            var contentElem = children[1];

            // 初始化Title部分的DOM结构
            var titlePanel = ui.create('Panel', {main: titleElem});
            this.helper.addPartClasses('title', titlePanel.main);
            this.addChild(titlePanel, 'title');
            titlePanel.render();
            this.set('title', titleElem && titleElem.innerHTML);
            titlePanel.helper.addDOMEvent(titlePanel.main, 'click', lib.bind(onToggle, this));

            // 初始化content部分的DOM结构
            var overlayMain = this.helper.createPart('layer', 'div');
            lib.addClass(overlayMain, this.helper.getPartClassName('layer'));

            var options = {
                main: contentElem,
                childName: 'content',
                attachedDOM: lib.getChildren(this.main)[0],
                attachedLayout: 'bottom,left',
                viewContext: this.viewContext,
                renderOptions: this.renderOptions,
                autoClose: false,
                toggleLayer: this
            };
            var contentLayer = ui.create('Overlay', options);

            this.helper.addPartClasses('content', contentLayer.main);
            this.addChild(contentLayer, 'content');
            contentLayer.render();

            contentLayer.on(
                'show',
                function () {
                    this.helper.addDOMEvent(document, 'mousedown', close);
                }
            );

            contentLayer.on(
                'hide',
                function () {
                    this.helper.removeDOMEvent(document, 'mousedown', close);
                }
            );
        };

        function close (e) {
            var target = e.target;
            var layer = this.main;

            if (!layer) {
                return;
            }

            var isChild = lib.dom.contains(layer, target);

            if (!isChild) {
                this.hide();

                // 如果是点击attachedTarget的话，需要保持expended状态.
                // 如果是点击其他空白区域的话，直接去掉expended就行。
                var attachedTarget = this.attachedTarget;
                var isAttachedTarget = lib.dom.contains(attachedTarget, target) || attachedTarget === target;

                if (!isAttachedTarget) {
                    this.toggleLayer.removeState('expended');
                }
            }
        }

        /**
         * 初始化DOM结构
         *
         * @ignore
         */
        function onToggle() {
            this.toggleContent();
        }

        /**
         * 切换展开/收起状态
         *
         * @public
         */
        exports.toggleContent = function () {
            var contentLayer = this.getChild('content');

            if (this.isExpanded()) {
                this.removeState('expended');
                contentLayer.hide();
            }
            else {
                this.addState('expended');
                contentLayer.show();
            }

            this.fire('change');
        };

        var painters = require('esui/painters');
        /**
         * 重绘
         *
         * @override
         * @protected
         */
        exports.repaint = painters.createRepaint(
            Control.prototype.repaint,
            painters.state('expended'),
            {
                name: 'title',
                paint: function (panel, title) {
                    panel.getChild('title').set('content', title);
                }
            },
            {
                name: 'content',
                paint: function (panel, content) {
                    panel.getChild('content').set('content', content);
                }
            }
        );

        exports.isExpanded = function () {
            return this.hasState('expended');
        };

        var ToggleLayer = require('eoo').create(Control, exports);

        require('esui').register(ToggleLayer);
        return ToggleLayer;
    }
);
