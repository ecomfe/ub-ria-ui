/**
 * UB-RIA-UI 1.0
 *
 * @ignore
 * @file 折叠控件
 * @author wangyaqiong, liyidong(srhb18@gmail.com)
 */

define(
    function (require) {
        var Control = require('esui/Control');
        var lib = require('esui/lib');
        var ui = require('esui');

        require('esui/Panel');
        require('esui/Overlay');

        /**
         * 折叠控件
         *
         * @class ui.TogglePanel
         * @extends.esui.Control
         */
        var exports = {};

        /**
         * 控件类型，始终为`"TogglePanel"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'TogglePanel';

        /**
         * 初始化参数
         *
         * @param {Object} options 构造函数传入的参数
         * @override
         * @protected
         */
        exports.initOptions = function (options) {
            var defaults = {
                expanded: false,
                position: 'layer'
            };

            var properties = lib.extend(defaults, options);

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
            initTitle.call(this, titleElem);

            // 初始化content部分的DOM结构
            var position = this.position;
            if (position === 'fixed') {
                // 占位
                initContentPanel.call(this, contentElem);
            }
            else {
                // 不占位
                initContentOverlay.call(this, contentElem);
            }
        };

        /**
         * 初始化Title部分的DOM结构
         *
         * @inner
         * @param {Object} titleElem Title的DOM对象
         */
        function initTitle(titleElem) {
            var titlePanel = ui.create('Panel', {main: titleElem});
            this.helper.addPartClasses('title', titlePanel.main);
            this.addChild(titlePanel, 'title');
            titlePanel.render();
            this.set('title', titleElem && titleElem.innerHTML);
            titlePanel.helper.addDOMEvent(titlePanel.main, 'click', lib.bind(onToggle, this));
        }

        /**
         * 按Panel模式初始化Content部分的DOM结构
         *
         * @inner
         * @param {Object} contentElem content的DOM对象
         */
        function initContentPanel(contentElem) {
            var options = {
                main: contentElem,
                childName: 'content',
                viewContext: this.viewContext,
                renderOptions: this.renderOptions
            };

            var contentPanel = ui.create('Panel', options);
            this.helper.addPartClasses('content', contentPanel.main);
            this.addChild(contentPanel, 'content');
            contentPanel.render();
        }

        /**
         * 按Overlay模式初始化Content部分的DOM结构
         *
         * @inner
         * @param {Object} contentElem content的DOM对象
         */
        function initContentOverlay(contentElem) {
            var overlayMain = this.helper.createPart('layer', 'div');
            lib.addClass(overlayMain, this.helper.getPartClassName('layer'));

            var options = {
                main: contentElem,
                childName: 'content',
                attachedDOM: this.main,
                attachedLayout: 'bottom,left',
                autoClose: false,
                viewContext: this.viewContext,
                renderOptions: this.renderOptions
            };
            var contentLayer = ui.create('Overlay', options);

            this.helper.addPartClasses('content', contentLayer.main);
            this.addChild(contentLayer, 'content');
            contentLayer.render();

            var globalEvent = lib.bind(close, this);

            contentLayer.on(
                'show',
                function () {
                    this.helper.addDOMEvent(document, 'mousedown', globalEvent);
                }
            );

            contentLayer.on(
                'hide',
                function () {
                    this.helper.removeDOMEvent(document, 'mousedown', globalEvent);
                }
            );
        }

        /**
         * 关闭layer层的事件处理句柄
         *
         * @param {mini-event.Event} e 事件对象
         * @inner
         */
        function close(e) {
            var target = e.target;
            var layer = this.getChild('content');

            if (!layer) {
                return;
            }

            var isChild = lib.dom.contains(layer.main, target);

            if (!isChild) {
                layer.hide();

                // 如果是点击attachedTarget的话，需要保持expanded状态.
                // 如果是点击其他空白区域的话，直接去掉expanded就行。
                var attachedTarget = layer.attachedTarget;
                var isAttachedTarget = lib.dom.contains(attachedTarget, target) || attachedTarget === target;

                if (!isAttachedTarget) {
                    this.removeState('expanded');
                    this.removeState('active');
                }
            }
        }

        /**
         * 点击Title区域的句柄
         *
         * @inner
         */
        function onToggle() {
            this.toggleContent();
        }

        /**
         * 切换展开/收起状态
         *
         * @inner
         */
        exports.toggleContent = function () {
            this.toggleStates();
            this.fire('change');
        };

        exports.toggleStates = function () {
            var position = this.position;

            if (position === 'fixed') {
                // 占位模式
                this.toggleState('expanded');
                this.toggleState('active');
            }
            else {
                // 浮层模式
                var contentLayer = this.getChild('content');

                if (this.isExpanded()) {
                    this.removeState('expanded');
                    this.removeState('active');
                    contentLayer.hide();
                }
                else {
                    this.addState('expanded');
                    this.addState('active');
                    contentLayer.show();
                }
            }
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
            painters.state('expanded'),
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
            },
            /**
             * @property {number} width
             *
             * 宽度
             */
            painters.style('width')
        );

        exports.isExpanded = function () {
            return this.hasState('expanded');
        };

        var TogglePanel = require('eoo').create(Control, exports);

        ui.register(TogglePanel);

        return TogglePanel;
    }
);
