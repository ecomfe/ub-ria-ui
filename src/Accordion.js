/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 手风琴控件
 * @author wangfj(wangfengjiao01@baidu.com)
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');
        var Control = require('esui/Control');

        /**
         * 手风琴控件
         *
         * @extends Control
         * @constructor
         */
        function Accordion() {
            Control.apply(this, arguments);
        }

        /**
         * 控件类型，始终为`"Accordion"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        Accordion.prototype.type = 'Accordion';

        /**
         * 初始化参数
         *
         * 如果初始化时未给定{@link Accordion#panels}属性，则按以下规则从DOM中获取：
         *
         * 1. 获取主元素的所有子元素，每个子元素视为panel
         * 2. 将每个panel的第一个元素作为header
         * 3. 将每个panel的第二个元素作为content
         * 4. 将两个元素的文本内容保存到panels数组中
         *
         * 需要注意的是，此元素仅在初始化时起效果，随后会被移除，
         * 因此不要依赖此元素上的`id`或者`class`、`style`等属性
         *
         *
         * @param {Object} [options] 构造函数传入的参数
         * @protected
         * @override
         */
        Accordion.prototype.initOptions = function (options) {
            var properties = {

                /**
                 * @property {array} panels
                 *
                 * panel项配置
                 * 初始化时保存文本内容
                 * 构造DOM节点后保存对节点的引用
                 */
                panels: [],

                /**
                 * @property {number} activeIndex
                 *
                 * 激活的panel下标
                 * 如果为负数视为全部折叠
                 */
                activeIndex: 0,

                /**
                 * @property {string} iconPosition
                 *
                 * 三角标识的位置
                 * prefix:起始位置;suffix:结束位置;after:标题后面
                 */
                iconPosition: 'prefix',

                /**
                 * @property {boolean} hoverable
                 *
                 * 是否hover展开
                 */
                hoverable: false,

                /**
                 * @property {boolean} collapsible
                 *
                 * 折叠方式
                 */
                collapsible: false
            };

            u.extend(properties, options);

            var panels = lib.getChildren(this.main);

            for (var i = 0; i < panels.length; i++) {
                var panel = panels[i];
                var config = {};

                var header = lib.dom.first(panel);
                if (header) {
                    config.header = header.innerHTML;

                    var content = lib.dom.next(header);
                    if (content) {
                        config.content = content.innerHTML;
                    }
                }
                properties.panels.push(config);
            }

            if (typeof properties.activeIndex === 'string') {
                properties.activeIndex = +properties.activeIndex;
            }

            // -1标记为所有元素折叠
            if (properties.activeIndex < 0 || properties.activeIndex === null) {
                properties.activeIndex = -1;
            }

            this.setProperties(properties);
        };

        /**
         * 重渲染
         *
         * @method
         * @protected
         * @override
         */
        Accordion.prototype.repaint = require('esui/painters').createRepaint(
            Control.prototype.repaint,
            {
                // panel项配置
                name: ['panels'],
                paint: createAccordionEl
            },
            {
                // 激活的panel下标
                name: 'activeIndex',
                paint: activateAccordion
            }
        );

        /**
         * 创建手风琴元素
         *
         * @param {Accordion} accordion accordion控件实例
         * @ignore
         */
        function createAccordionEl(accordion) {

            var fragment = document.createDocumentFragment();
            var panel = '';

            for (var i = 0; i < accordion.panels.length; i++) {
                var config = accordion.panels[i];
                var isActive = accordion.activeIndex === i;
                panel = createPanelEl(accordion, config, isActive);
                fragment.appendChild(panel);
            }

            accordion.main.innerHTML = '';
            accordion.main.appendChild(fragment);
        }

        /**
         * 创建panel元素
         *
         * @param {accordion} accordion 控件实例
         * @param {meta.panel} config panel的配置数据项
         * @param {boolean} isActive 是否激活状态
         * @return {string} 返回DOM片段
         */
        function createPanelEl(accordion, config, isActive) {

            // 创建一个空panel元素，并填充内容
            var panel = document.createElement('div');
            panel.setAttribute('data-role', 'panel');
            accordion.helper.addPartClasses('panel', panel);

            if (isActive) {
                accordion.helper.addPartClasses('panel-active', panel);
            }
            panel.innerHTML = accordion.getPanelHTML(config);

            // 获取头部元素，增加样式属性
            var header = lib.dom.first(panel);
            if (header) {
                config.header = header;
                accordion.helper.addPartClasses('header', header);

                // 获取三角元素，增加样式属性
                var triangle = lib.dom.last(header);
                accordion.helper.addPartClasses('triangle', triangle);
                accordion.helper.addPartClasses('triangle-' + accordion.iconPosition, triangle);

                // 获取内容元素，增加样式属性
                var content = lib.dom.next(header);
                if (content) {
                    config.content = content;
                    accordion.helper.addPartClasses('content', content);

                    // 内容元素是否固定高度
                    if (accordion.fixHeight) {
                        content.style.cssText = ''
                            + 'height: ' + parseInt(accordion.fixHeight, 10) + 'px;'
                            + 'overflow: auto';
                    }
                }
            }
            return panel;
        }

        /**
         * 获取panel的HTML
         *
         * @param {meta.panel} config panel数据项
         * @return {string} 返回HTML片段
         */
        Accordion.prototype.getPanelHTML = function (config) {
            var html = lib.format(
                this.panelTemplate,
                {
                    header: u.escape(config.header),
                    content: config.content
                }
            );
            return html;
        };

        /**
         * panel模板
         *
         * 在模板中可以使用以下占位符：
         *
         * - `{string} header`：文本内容，经过HTML转义
         * - `{string} content`：可能为文本内容或HTML内容，不需要转义
         *
         * @type {string}
         */
        Accordion.prototype.panelTemplate = ''
            + '<div data-role="header">'
                + '${header}'
                + '<i></i>'
            + '</div>'
            + '<div data-role="content">'
                + '${content}'
            + '</div>';

        /*
         * 点击时的切换逻辑
         *
         * @param {Event} e 触发事件的事件对象
         * @fires collapse
         * @ignore
         */
        function clickAccordion(e) {
            var target = e.target;
            while (target && !this.helper.isPart(target, 'header')) {
                target = target.parentNode;
            }
            if (this.helper.isPart(target, 'header')) {
                var panel = target.parentNode;

                var accordion = panel.parentNode;
                var activeIndex = 0;
                for (var i = 0; i < accordion.children.length; i++) {
                    if (accordion.children[i] === panel) {
                        activeIndex = i;
                        break;
                    }
                }

                // 非互斥折叠
                if (this.collapsible) {
                    // 该元素内容已展开，折叠收缩
                    if (this.helper.isPart(panel, 'panel-active')) {
                        collapseAccordion.call(this);
                        this.activeIndex = -1;
                    }
                    else {
                        // 只激活当前元素
                        this.set('activeIndex', activeIndex);
                    }
                }
                // 互斥折叠
                else {
                    // 该元素内容已展开，什么都不做
                    if (this.helper.isPart(panel, 'panel-active')) {
                        return;
                    }
                    // 只激活当前元素
                    this.set('activeIndex', activeIndex);
                }
            }
        }

        /*
         * 激活指定位置的panel
         *
         * @param {accordion} accordion accordion控件实例
         * @parma {number} index 待激活的panel下标
         * @ignore
         */
        function activateAccordion(accordion, index) {

            for (var i = 0; i < accordion.panels.length; i++) {
                var config = accordion.panels[i];

                var methodName =
                    i === index ? 'removePartClasses' : 'addPartClasses';
                if (config.content) {
                    accordion.helper[methodName]('content-hidden', config.content);
                }
                var panel = lib.getChildren(accordion.main)[i];
                methodName =
                    i === index ? 'addPartClasses' : 'removePartClasses';
                accordion.helper[methodName]('panel-active', panel);
            }
        }

        /**
         * 折叠处于激活状态的panel
         *
         *
         */
        function collapseAccordion() {
            var panel = this.panels[this.activeIndex];

            if (panel.content) {
                this.helper.addPartClasses('content-hidden', panel.content);
            }
            var panelEl = lib.getChildren(this.main)[this.activeIndex];
            this.helper.removePartClasses('panel-active', panelEl);
        }

        /**
         * 初始化事件类型
         *
         * @protected
         * @override
         */
        Accordion.prototype.initEvents = function () {
            var type = this.hoverable ? 'mouseover' : 'click';
            this.helper.addDOMEvent(this.main, type, clickAccordion);
        };

        /**
         * 添加一个panel
         *
         * @param {meta.panel} config panel的配置对象
         *
         */
        Accordion.prototype.add = function (config) {
            this.insert(config, this.panels.length);
        };

        /**
         * 在指定位置添加一个panel
         *
         * @param {meta.panel} config panel的配置对象
         * @param {number} index 插入的位置
         * 如果小于0则会插入到最前面，大于当前panel数量则插入到最后面
         *
         */
        Accordion.prototype.insert = function (config, index) {
            index = Math.min(index, this.panels.length);
            index = Math.max(index, 0);

            // 新加的panel不可能是激活状态的，唯一的例外下面会覆盖到
            var panelEl = createPanelEl(this, config, false);
            this.panels.splice(index, 0, config);

            var children = lib.getChildren(this.main);
            this.main.insertBefore(
                panelEl, children[index] || null);

            // 如果原来是没有panel的，则新加的这个默认激活
            if (this.panels.length === 1) {
                this.activeIndex = 0;
                activateAccordion(this, 0);
            }
            else {
                // 如果在当前激活的panel前面插入一个，则`activeIndex`需要变化，
                // 但视图是不用刷新的
                if (index <= this.activeIndex) {
                    this.activeIndex++;
                }

                // 新加入的panel默认要隐藏起来
                if (config.content) {
                    this.helper.addPartClasses('content-hidden', config.content);
                }
            }
        };

        /**
         * 移除一个panel
         *
         * @param {meta.panel} config panel的配置对象
         *
         */
        Accordion.prototype.remove = function (config) {
            var index = 0;
            while ((index = u.indexOf(this.panels, config, index)) >= 0) {
                this.removeAt(index);
            }
        };

        /**
         * 根据下标移除一个panel
         *
         * @param {number} index 需要移除的panel下标
         *
         */
        Accordion.prototype.removeAt = function (index) {
            var removed = this.panels.splice(index, 1)[0];
            if (removed) {
                var children = lib.getChildren(this.main);
                var panelEl = children[index];
                panelEl.parentNode.removeChild(panelEl);

                // 如果删的panel在当前激活的panel的前面，
                // 则当前激活的panel的下标其实改变了，`activeIndex`是要调整的，
                // 但这种情况下实际激活的还是同一个panel，不用重新渲染
                if (index < this.activeIndex) {
                    this.activeIndex--;
                }
                // 如果正好激活的panel被删了，则把激活panel换成当前的后一个，
                // 如果没有后一个了，则换成最后一个，这需要重新渲染
                else if (index === this.activeIndex) {
                    this.activeIndex = Math.min(
                        this.activeIndex,
                        this.panels.length - 1
                    );
                    activateAccordion(this, this.activeIndex);
                }

                // 隐藏对应的元素
                if (removed.content) {
                    this.helper.addPartClasses('content-hidden', removed.content);
                }
            }
        };

        /**
         * 获取当前激活的{@link meta.panel}对象
         *
         * @return {meta.panel}
         */
        Accordion.prototype.getActivePanel = function () {
            return this.get('panels')[this.get('activeIndex')];
        };

        lib.inherits(Accordion, Control);
        require('esui/main').register(Accordion);
        return Accordion;
    }
);
