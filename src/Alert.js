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
         * @cfg {number} [defaultProperties.autoClose=5000] 自动关闭延迟
         * @cfg {Boolean} [defaultProperties.closeBtn=false] 是否带有关闭按钮
         * @cfg {number} [defaultProperties.autoSlide=4000] 多条消息自动滚动时间，Null表不自动滚动
         * @static
         */
        Alert.defaultProperties = {
            msgType: 'error',
            container: 'sysinfo',
            autoClose: false,
            closeBtn: true,
            pageIndex: 1,
            autoSlide: 4000,
            icon: false
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

            // 必须有父容器
            if(!options.container && !lib.g('sysinfo')) {
                throw new Error('Parent node(id) is needed, the default property doesn\'t work');
            }

            // 兼容传入单条string
            if(typeof(options.message) === 'string') {
                options.message = [options.message];
            }

            // message去空
            options.message = u.chain(options.message).map(lib.trim).compact().value();
            if(options.message.length === 0) {
                throw new Error('Message cannot be empty');
            }

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
            var self = this;

            var innerHTML = '';
            var parts = ['icon', 'text', 'close', 'pager'];
            u.each(parts, function(item, index) {
                innerHTML += self.helper.getPartHTML(item, 'div');
            });

            this.main.innerHTML = this.getInjectedPartHTML('container', 'div', innerHTML);
        };

        /**
         * 分页器构造
         */
        function buildPager(self) {

            // 上一条按钮
            var prev = self.getInjectedPartHTML('prev', 'div', self.helper.getPartHTML('icon-content', 'i'));

            // 下一条按钮
            var next = self.getInjectedPartHTML('next', 'div', self.helper.getPartHTML('icon-content', 'i'));

            // 页码
            var index = self.getInjectedPartHTML(
                'index',
                'div',
                self.helper.getPartHTML('page', 'strong') + '/' + self.message.length
            );

            // 渲染
            var pager = self.helper.getId('pager');
            lib.g(pager).innerHTML = prev + index + next;
            self.helper.getPart('page').innerHTML = self.pageIndex;

            // 绑事件
            self.helper.addDOMEvent('prev', 'click', function(e) {
                if(self.pageIndex > 1) {
                    self.setProperties({pageIndex: self.pageIndex - 1});
                }
            });
            self.helper.addDOMEvent('next', 'click', function(e) {
                if(self.pageIndex < self.message.length) {
                    self.setProperties({pageIndex: self.pageIndex + 1});
                }
            });
        }

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
                    if(icon === false) {
                        return;
                    }
                    self.injectIcon(self.helper.getPartHTML('icon-content', 'i'));
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
                    if(isSingle(message) === false) {
                        buildPager(self);
                        var messages = lib.getChildren(self.helper.getPart('text'));
                        var hiddenClassName = self.helper.getPartClasses('item-hidden')[0];
                        u.each(messages, function(item) {
                            lib.addClass(item, hiddenClassName);
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
                    if(isSingle(self.message)) {
                        return;
                    }

                    // 实现fade渐进效果
                    var messages = lib.getChildren(self.helper.getPart('text'));
                    var hiddenClassName = self.helper.getPartClasses('item-hidden')[0];
                    var fadeinClassName = self.helper.getPartClasses('item-fadein')[0];
                    var fadeoutClassName = self.helper.getPartClasses('item-fadeout')[0];

                    var newMessage = messages[pageIndex - 1];
                    var oldMessage = null;

                    u.each(messages, function(item) {
                        if(!lib.hasClass(item, hiddenClassName)) {
                            oldMessage = item;
                        }
                    });

                    if(!oldMessage) {
                        lib.removeClass(newMessage, hiddenClassName);
                    }
                    else {
                        lib.addClass(oldMessage, fadeoutClassName);
                        lib.removeClass(oldMessage, fadeinClassName);
                        clearTimeout(self.fadeTimer);
                        self.fadeTimer = setTimeout(function() {
                            lib.addClass(oldMessage, hiddenClassName);
                            lib.removeClass(newMessage, hiddenClassName);
                            lib.removeClass(newMessage, fadeoutClassName);
                            lib.addClass(newMessage, fadeinClassName);
                        }, 400);
                    }

                    self.helper.getPart('page').innerHTML = pageIndex;

                    // 分页器边界逻辑
                    if(pageIndex === 1) {
                        self.helper.addPartClasses('prev-disabled', 'prev');
                    }
                    else {
                        self.helper.removePartClasses('prev-disabled', 'prev');
                    }
                    if(pageIndex === self.message.length) {
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
                    if(closeBtn === false) {
                        return;
                    }
                    self.helper.getPart('close').innerHTML = '' +
                        self.getInjectedPartHTML('button', 'div', self.helper.getPartHTML('icon-content', 'i'));

                    self.helper.addDOMEvent('button', 'click', function(e) {
                        self.hide();
                    });
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

            this.appendTo(lib.g(this.container));

            // toggle效果实现
            this.helper.addPartClasses('toggle', 'container');

            Control.prototype.show.apply(this, arguments);
            this.fire('show');

            // 自动关闭定时器
            clearTimeout(this.autoCloseTimer);
            if (this.autoClose === true) {
                this.autoClose = 3000;
            }
            if(this.autoClose) {
                this.autoCloseTimer = setTimeout(lib.bind(this.hide, this), this.autoClose);
            }

            // 自动轮换定时及暂停重启逻辑
            this.setAutoSlide();
            this.helper.addDOMEvent(this.main, 'mouseover', lib.bind(function() {
                clearInterval(this.autoSlideTimer);
                clearTimeout(this.fadeTimer);
            }, this));
            this.helper.addDOMEvent(this.main, 'mouseout', this.setAutoSlide);
        };

        /**
         * 设置自动轮换
         */
        Alert.prototype.setAutoSlide = function() {
            clearInterval(this.autoSlideTimer);
            if(this.autoSlide === true) {
                this.autoSlide = 2000;
            }
            if(!isSingle(this.message) && this.autoSlide) {
                this.autoSlideTimer = setInterval(lib.bind(slide, this), this.autoSlide);
            }
            function slide() {
                var pageIndex = this.pageIndex;
                if(pageIndex === this.message.length) {
                    pageIndex = 1;
                }
                else {
                    pageIndex++;
                }
                this.setProperties({pageIndex: pageIndex});
            }
        };

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
         * 判断是否单条消息
         *
         * @param {Array} message 消息数组
         * @return {Boolean} 是否单条
         */
        function isSingle(message) {
            return message[1] ? false : true;
        }

        /**
         * 快捷方式注册
         */
        var allType = ['success', 'prompt', 'warning', 'error'];
        for (var key in allType) {
            if (allType.hasOwnProperty(key)) {
                (function (msgType) {
                    Alert[msgType] = function (options) {
                        options.msgType = options.msgType || msgType;
                        var alert = new Alert(options);
                        Control.prototype.hide.apply(alert);
                        alert.insertBefore(lib.g(alert.container));
                        alert.show(options);
                        return alert;
                    };
                })(allType[key]);
            }
        }

        lib.inherits(Alert, Control);
        require('esui').register(Alert);
        return Alert;
    }
);
