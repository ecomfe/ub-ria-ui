/**
 * UB-RIA UI Library
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 警告框（Alert）
 * @author zhangyujie(zhnagyujie@baidu.com)
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');
        var Control = require('esui/Control');

        /**
         * Alert控件
         *
         * @param {Object} options 初始化参数
         * @extends Control
         * @constructor
         */
        function Alert(options) {
            Control.apply(this, arguments);
        }

        /**
         * @cfg defaultProperties
         *
         * 默认属性值
         *
         * @cfg {string} [defaultProperties.msgType='error'] 消息类型
         *      `success`：成功：绿
         *      `prompt` ：通知：蓝
         *      `warning`：警告：黄
         *      `error`  ：错误：红
         * @cfg {String | Array} [defaultProperties.message] 数据源数组，可兼容单条string
         * @cfg {number} [defaultProperties.autoClose=false] 自动关闭延迟
         * @cfg {Boolean} [defaultProperties.closeBtn=false] 是否带有关闭按钮
         * @cfg {number} [defaultProperties.autoSlide=4000] 多条消息自动滚动时间，Null表不自动滚动
         * @cfg {Boolean} [defaultProperties.icon=true] 是否使用系统默认图标
         * @cfg {Number} [defaultProperties.stepAnimationDuration=400] 切换的渐进效果时间间隔
         * @static
         */
        Alert.defaultProperties = {
            msgType: 'error',
            autoClose: false,
            closeBtn: true,
            pageIndex: 1,
            autoSlide: 4000,
            icon: true,
            stepAnimationDuration: 400
        };

        /**
         * 控件类型，始终为`"Alert"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        Alert.prototype.type = 'Alert';

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @protected
         * @override
         */
        Alert.prototype.initOptions = function (options) {
            var properties = {};

            // 如果没有从html构造，则从js中构造时必须传入父容器
            if (!this.main.parentNode && u.isEmpty(options.container)) {
                throw new Error('Parent is needed if constructed form scripts');
            }

            // 兼容传入单条string
            if (typeof options.message === 'string') {
                options.message = [options.message];
            }

            // message去空
            options.message = u.chain(options.message).map(lib.trim).compact().value();
            if (options.message.length === 0) {
                throw new Error('Message cannot be empty');
            }

            // 保存一份autoSlide，方便mouseout后恢复计时器使用
            properties.oriAutoSlide = options.autoSlide;

            lib.extend(properties, Alert.defaultProperties, options);
            this.setProperties(properties);
        };

        /**
         * 带有注入innerHTML的部件HTML模板
         *
         * @param {String} part 部件名称
         * @param {String} nodeName HTML节点标签
         * @param {String} innerHTML 注入的innerHTML
         * @return {String} 部件HTML内容
         */
        Alert.prototype.getInjectedPartHTML = function(part, nodeName, innerHTML) {
            return this.helper.getPartBeginTag(part, nodeName) +
                innerHTML +
                this.helper.getPartEndTag(part, nodeName);
        };

        /**
         * 骨架构造
         *
         * @protected
         * @override
         */
        Alert.prototype.initStructure = function () {
            var innerHTML = '';
            var parts = ['icon', 'text', 'close', 'pager'];
            u.each(parts, function(item, index) {
                innerHTML += this.helper.getPartHTML(item, 'div');
            }, this);

            this.main.innerHTML = this.getInjectedPartHTML('container', 'div', innerHTML);
        };

        /**
         * 分页器构造
         *
         * @param {ESUI.Alert} self 控件实例
         */
        function buildPager(self) {

            // 上一条按钮
            var prev = self.getInjectedPartHTML('prev', 'div', self.helper.getPartHTML('icon-content', 'span'));

            // 下一条按钮
            var next = self.getInjectedPartHTML('next', 'div', self.helper.getPartHTML('icon-content', 'span'));

            // 页码
            var index = self.getInjectedPartHTML(
                'index',
                'div',
                self.helper.getPartHTML('page', 'strong') + '/' + self.message.length
            );

            // 渲染
            self.helper.getPart('pager').innerHTML = prev + index + next;
            self.helper.getPart('page').innerHTML = self.pageIndex;

            // 绑事件
            self.bindPagerEvent();
        }

        /**
         * 为Page绑定事件
         */
        Alert.prototype.bindPagerEvent = function() {
            var self = this;

            // 翻页至上一页
            self.helper.addDOMEvent('prev', 'click', function() {
                if (self.pageIndex > 1) {
                    self.setProperties({ pageIndex: self.pageIndex - 1 });
                }
            });

            // 翻页至下一页
            self.helper.addDOMEvent('next', 'click', function() {
                if (self.pageIndex < self.message.length) {
                    self.setProperties({ pageIndex: self.pageIndex + 1 });
                }
            });
        };

        /**
         * 移除Page的事件
         */
        Alert.prototype.removePagerEvent = function(prev, next) {
            this.helper.removeDOMEvent('prev', 'click');
            this.helper.removeDOMEvent('next', 'click');
        };

        /**
         * 为控件注入Icon
         *
         * @param {String} html 注入的HTML
         */
        Alert.prototype.injectIcon = function(html) {
            this.helper.getPart('icon').innerHTML = html;
        };

        /**
         * 重绘
         *
         * @override
         * @protected
         */
        Alert.prototype.repaint = require('esui/painters').createRepaint(
            Control.prototype.repaint,
            {
                /**
                 * @property {Boolean} icon
                 *
                 * 是否带提示图标
                 */
                name: 'icon',
                paint: function (self, icon) {

                    // 默认为true的属性兼容从html构造传入false覆盖的情况
                    if (!lib.trim(icon) || icon === 'false') {
                        self.injectIcon('');
                        return;
                    }
                    self.injectIcon(self.helper.getPartHTML('icon-content', 'span'));
                }
            },
            {
                /**
                 * @property {string} message
                 *
                 * 提示的内容，支持HTML
                 */
                name: 'message',
                paint: function (self, message) {
                    u.each(message, function(item) {
                        self.helper.getPart('text').innerHTML +=
                            self.getInjectedPartHTML('item', 'span', item);
                    });
                    if (message.length !== 1) {
                        buildPager(self);
                        var messages = lib.getChildren(self.helper.getPart('text'));
                        u.each(messages, function(item) {
                            self.helper.addPartClasses('item-hidden', item);
                        });
                    }
                }
            },
            {
                /**
                 * @property {string} msgType
                 *
                 * 提示的类型
                 */
                name: 'msgType',
                paint: function (self, msgType) {

                    // 清理掉老的type
                    u.each(allType, function(type) {
                        self.helper.removePartClasses(type);
                    });
                    self.helper.addPartClasses(self.msgType);
                }
            },
            {
                /**
                 * @property {Number} pageIndex
                 *
                 * 转到的页码
                 */
                name: 'pageIndex',
                paint: function(self, pageIndex) {

                    // 只在多条下响应pageIndex
                    if (self.message.length === 1) {
                        return;
                    }

                    // 实现fade渐进效果
                    var messages = lib.getChildren(self.helper.getPart('text'));
                    var hiddenClassName = self.helper.getPartClasses('item-hidden')[0];

                    var newMessage = messages[pageIndex - 1];
                    var oldMessage = null;

                    u.each(messages, function(item) {
                        if (!lib.hasClass(item, hiddenClassName)) {
                            oldMessage = item;
                        }
                    });

                    if (!oldMessage) {
                        self.helper.removePartClasses('item-hidden', newMessage);
                    }
                    else {
                        self.helper.removePartClasses('item-stepin', oldMessage);
                        self.helper.addPartClasses('item-stepout', oldMessage);

                        // 先disable pager，在动画执行完后绑回来
                        self.removePagerEvent();

                        clearTimeout(self.animationTimer);
                        self.animationTimer = setTimeout(function() {
                            self.helper.addPartClasses('item-hidden', oldMessage);
                            self.helper.removePartClasses('item-hidden', newMessage);
                            self.helper.removePartClasses('item-stepout', newMessage);
                            self.helper.addPartClasses('item-stepin', newMessage);

                            self.bindPagerEvent();

                        }, self.stepAnimationDuration);
                    }

                    self.helper.getPart('page').innerHTML = pageIndex;

                    // 分页器边界逻辑
                    if (pageIndex === 1) {
                        self.helper.addPartClasses('prev-disabled', 'prev');
                    }
                    else {
                        self.helper.removePartClasses('prev-disabled', 'prev');
                    }
                    if (pageIndex === self.message.length) {
                        self.helper.addPartClasses('next-disabled', 'next');
                    }
                    else {
                        self.helper.removePartClasses('next-disabled', 'next');
                    }
                }
            },
            {
                /**
                 * @property {Number} closeBtn
                 *
                 * 是否带有关闭按钮
                 */
                name: 'closeBtn',
                paint: function(self, closeBtn) {

                    // 默认为true的属性兼容从html构造传入false覆盖的情况
                    if (!lib.trim(closeBtn) || closeBtn === 'false') {
                        self.helper.getPart('button') && self.helper.removeDOMEvent('button');
                        self.helper.getPart('close').innerHTML = '';
                        return;
                    }
                    self.helper.getPart('close').innerHTML = '' +
                        self.getInjectedPartHTML('button', 'div', self.helper.getPartHTML('icon-content', 'span'));

                    self.helper.addDOMEvent('button', 'click', function(e) {
                        self.hide();
                    });
                }
            },
            {
                /**
                 * @property {Number} autoSlide
                 *
                 * 自动轮播时间间隔
                 */
                name: 'autoSlide',
                paint: function(self, autoSlide) {
                    if (autoSlide === true) {
                        autoSlide = 4000;
                    }
                    if (parseInt(autoSlide, 10) > 0) {
                        autoSlide = parseInt(autoSlide, 10);
                    }

                    // clearTimeout(self.animationTimer);
                    clearInterval(self.autoSlideTimer);
                    if (self.message.length === 1 || !lib.trim(autoSlide) || autoSlide === 'false') {
                        return;
                    }
                    self.autoSlideTimer = setInterval(lib.bind(slide, self), autoSlide);
                }
            },
            {
                /**
                 * @property {Number} autoClose
                 *
                 * 控件自动关闭时间间隔
                 */
                name: 'autoClose',
                paint: function(self, autoClose) {
                    if (autoClose === true) {
                        autoClose = 4000;
                    }
                    if (parseInt(autoClose, 10) > 0) {
                        autoClose = parseInt(autoClose, 10);
                    }

                    // 自动关闭定时器
                    clearTimeout(self.autoCloseTimer);
                    if (!lib.trim(autoClose) || autoClose === 'false') {
                        return;
                    }
                    self.autoCloseTimer = setTimeout(lib.bind(self.hide, self), autoClose);
                }
            }
        );

        /**
         * 显示提示信息
         *
         * @override
         */
        Alert.prototype.show = function () {
            if (this.helper.isInStage('DISPOSED')) {
                return;
            }

            this.insertBefore(lib.g(this.container).firstChild);

            // toggle效果实现
            this.helper.addPartClasses('toggle', 'container');

            Control.prototype.show.apply(this, arguments);
            this.fire('show');

            // 自动轮换功能暂停重启逻辑
            this.helper.addDOMEvent(this.main, 'mouseover', lib.bind(function() {
                this.setProperties({ autoSlide: false });
            }, this));
            this.helper.addDOMEvent(this.main, 'mouseout', lib.bind(function() {
                this.setProperties({ autoSlide: this.oriAutoSlide });
            }, this));
        };

        /**
         * 多条信息时，轮换到下一页，通过设置pageIndex引起重绘来实现
         */
        function slide() {
            var pageIndex = this.pageIndex;
            if (pageIndex === this.message.length) {
                pageIndex = 1;
            }
            else {
                pageIndex++;
            }
            this.setProperties({ pageIndex: pageIndex });
        }

        /**
         * 隐藏提示信息
         *
         * @override
         */
        Alert.prototype.hide = function () {
            Control.prototype.hide.apply(this, arguments);
            clearTimeout(this.autoCloseTimer);
            clearInterval(this.autoSlideTimer);
            this.fire('hide');
            this.dispose();
        };

        /**
         * 销毁控件，同时移出DOM树
         *
         * @protected
         * @override
         */
        Alert.prototype.dispose = function () {
            clearTimeout(this.autoCloseTimer);
            clearInterval(this.autoSlideTimer);
            if (this.helper.isInStage('DISPOSED')) {
                return;
            }
            lib.removeNode(this.main);
            Control.prototype.dispose.apply(this, arguments);
        };

        /**
         * 快捷方式注册
         */
        var allType = ['success', 'prompt', 'warning', 'error'];
        u.each(allType, function(type) {
            Alert[type] = function(options) {
                options.msgType = options.msgType || type;
                var alert = new Alert(options);
                alert.show();
                return alert;
            };
        });

        lib.inherits(Alert, Control);
        require('esui').register(Alert);
        return Alert;
    }
);
