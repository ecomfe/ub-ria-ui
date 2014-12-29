/**
 * @file 图片轮播控件
 * @author yaofeifei(yaofeifei@baidu.com)
 */

define(function (require) {
    var u = require('underscore');
    var lib = require('esui/lib');
    var paint = require('esui/painters');
    var Control = require('esui/Control');
    var eoo = require('eoo');

    var MAIN_TPL = [
        '<div class="${type-selector}-main" id="${contentId}">',
            '<div class="${type-selector}-content">',
                '<span class="${type-selector}-pointer ${type-selector}-pointer-active-l ${icon-left-arrow}" id="${leftId}"></span>',
                '<div class="ui-carouse-list-wrap">',
                    '<ul class="${type-selector}-list" id="${listId}"></ul>',
                '</div>',
                '<span class="${type-selector}-pointer ${type-selector}-pointer-active-r ${icon-right-arrow}" id="${rightId}"></span>',
            '</div>',
            '<div class="${type-selector}-toolbar">',
                '<ul id="${toolbarId}"></ul>',
            '</div>',
        '</div>'
    ].join('');
    
    var ITEM_TPL = [
        '<li class="${type-selector}-item ${item-selector}" index="${index}" style="width:${width}px;height:${height}px;">',
            '<img class="${type-selector}-item-img" src="${imgSrc}"/>',
            '<span class="${type-selector}-check ${icon-check}"></span>',
        '</li>'
    ].join('');
    
    var PAGE_TPL = '<li index="${index}" class="${type-selector}-page"></li>';

    var exports = (function () {
        /**
         * 拼接main的dom结构
         * @return {string} html片段
         * @inner 
         */
        function getMainHtml() {
            return lib.format(
                MAIN_TPL,
                {
                    'type-selector': this.helper.getPrimaryClassName(),
                    'contentId': this.helper.getId('main'),
                    'leftId': this.helper.getId('left-handler'),
                    'listId': this.helper.getId('list'),
                    'rightId': this.helper.getId('right-handler'),
                    'toolbarId': this.helper.getId('toolbar'),
                    'icon-left-arrow': this.helper.getIconClass('chevron-left'),
                    'icon-right-arrow': this.helper.getIconClass('chevron-right')
                }
            );
        };

        /**
         * 拼接内容项的dom结构
         * @param {Array} data 渲染数据
         * @param {number} itemWidth 单项的宽
         * @param {number} itemHeight 单项的高
         * @return {string} html片段
         * @inner 
         */
        function getItemHtml(data, itemWidth, itemHeight) {
            var me = this;
            var html = [];
            u.each(data, function (item, index) {
                var str = lib.format(
                    ITEM_TPL,
                    {
                        'imgSrc': item.url,
                        'width': itemWidth,
                        'height': itemHeight,
                        'index': index,
                        'type-selector': me.helper.getPrimaryClassName(),
                        'item-selector': me.disabled ? me.helper.getPartClassName('disabled') : '',
                        'icon-check': me.helper.getIconClass('check')
                    }
                );
                html.push(str);
            });
            return html.join('');
        };

        /**
         * 拼接底部分页条的dom结构
         * @param {Array} data 渲染所需的数据
         * @return {string} html片段
         * @inner 
         */
        function getToolbarHtml(data) {
            var html = [];
            var len = data.length;
            var divided = Math.ceil(len / this.pageSize);
            this.pageLength = divided;
            for (var i = 0; i < divided; i++) {
                var str = lib.format(
                    PAGE_TPL,
                    {
                        'index': i,
                        'type-selector': this.helper.getPrimaryClassName()
                    }
                );
                html.push(str);
            }
            return html.join('');
        };

        /**
         * 获取page的序号根据选中项的index
         * @return {number} page的序号
         * @inner 
         */
        function getPageByIndex() {
            if (this.selectedIndex === -1) {
                return 0;
            }
            return Math.floor(this.selectedIndex / this.pageSize);
        };
        
        /**
         * 设置左右箭头的样式
         * @inner 
         */
        function setPointerStyle() {
            var disableClass = this.helper.getPartClasses('pointer-disable')[0];
            if (this.pageLength === 1) {
                lib.addClass(this.helper.getId('left-handler'), disableClass);
                lib.addClass(this.helper.getId('right-handler'), disableClass);
            }
            else {
                if (this.currentPage === 0) {
                    lib.addClass(this.helper.getId('left-handler'), disableClass);
                    lib.removeClass(this.helper.getId('right-handler'), disableClass);
                }
                else if (this.currentPage === this.pageLength - 1) {
                    lib.removeClass(this.helper.getId('left-handler'), disableClass);
                    lib.addClass(this.helper.getId('right-handler'), disableClass);
                }
                else {
                    lib.removeClass(this.helper.getId('left-handler'), disableClass);
                    lib.removeClass(this.helper.getId('right-handler'), disableClass);
                }
            }
        };

        /**
         * 设置翻页的滚动位置
         * @inner 
         */
        function setCarouseListPosition() {
            var pageOffset = -this.wrapWidth;
            var left = (pageOffset * this.currentPage) + 'px';
            this.helper.getPart('list').style.left = left;
        };

        /**
         * 左右箭头点击后的处理函数
         * @param {number} n 区别方向  -1=left 1=right
         * @inner 
         */
        function pointerClick(n) {
            var nextPage = this.currentPage + n;
            if (nextPage >= this.pageLength ||
                nextPage <  0) {
                return;
            }
            else {
                this.setPage(nextPage);
            }
        };

        /**
         * 单个选项处理handler
         * @param {number} index 选项的序号 
         * @param {HTMLElement} el dom对象
         * @inner
         */
        function itemClick(index, el) {
            if (this.disabled || this.selectedIndex === index) {
                return;
            }
            var selectedClass = this.helper.getPrimaryClassName('selected-item');
            if (this.selectedIndex !== -1) {
                var selector = this.helper.getPart('list');
                var lis = selector.getElementsByTagName('li');
                var li = lis[this.selectedIndex];
                lib.removeClass(li, selectedClass);
            }
            lib.addClass(el, selectedClass);
            this.selectedIndex = index;
            var item = this.datasource[this.selectedIndex];
            this.selectedItem = item;
            var value = this.datasource[this.selectedIndex]['id'];
            this.value = value;
            /**
             * @event change
             *
             * 值发生变化时触发
             *
             * `Carousel`控件的值变化是以{@link Carousel#selectedIndex}属性为基准
             */
            this.fire('change');
        };
        
        /**
         * 翻页按钮点击处理函数
         * @param {number} nextPage 目标页的序号
         * @inner 
         */
        function pageClick(nextPage) {
            if (this.currentPage === nextPage) {
                return;
            }
            else {
                this.setPage(nextPage);
            }
        };

        /**
         * 选择项切换处理函数，采用事件委托的方式
         * @param {Event} e 事件对象
         * @inner
         */
        function itemChangeHandler(e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (target.nodeName === 'IMG') {
                var el = target.parentNode;
                var index = parseInt(el.getAttribute('index'), 10);
                itemClick.call(this, index, el);
            }
        };

        /**
         * 底部工具条处理函数，采用事件委托的方式
         * @param {Event} e 事件对象
         * @inner
         */
        function toolbarHandler(e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (target.nodeName === 'LI') {
                var index = parseInt(target.getAttribute('index'), 10);
                pageClick.call(this, index);
            }
        };

        return {
            /**
             * 控件类型
             *
             * @type {string}
             * @readonly
             * @override
             */
            type: 'Carousel',
    
            /**
             * 初始化参数
             *
             * @param {Object} [options] 构造函数传入的参数
             * @param {number} option.pageSize 每页显示的个数
             * @param {number} option.itemWidth 每项的宽度
             * @param {number} option.itemHeight 每项的高度
             * @param {Array} option.datasource 所有项的数据数组
             * @param {number} option.value 选中的项的id值
             * @param {number} option.selectedIndex 选中的项的序号
             * @param {boolean} option.disabled 是否禁用
             * @protected
             * @override
             */
            initOptions: function (options) {
                var properties = {
                    pageSize: 8,
                    itemWidth: 80,
                    itemHeight: 50,
                    datasource: [],
                    value: null,
                    selectedIndex: -1,
                    disabled: false
                };
                u.extend(properties, options);
                if (properties.value) {
                    properties.value = parseInt(properties.value, 10);
                    u.each(properties.datasource, function (item, index) {
                        if (item.id === properties.value) {
                            properties.selectedIndex = index;
                        }
                    });
                    properties.selectedItem = properties.datasource[properties.selectedIndex];
                }
                properties.itemWidth = parseFloat(properties.itemWidth, 10);
                properties.itemHeight = parseFloat(properties.itemHeight, 10);
                properties.pageSize = parseFloat(properties.pageSize, 10);
                this.setProperties(properties);
            },
    
            /**
             * 创建控件主元素，默认使用`div`元素
             *
             * 如果需要使用其它类型作为主元素，
             * 需要在始终化时提供{@link Control#main}属性
             *
             * @return {HTMLElement}
             * @protected
             * @override
             */
            createMain: function () {
                return document.createElement('div');
            },
    
            /**
             * 初始化DOM结构
             *
             * @protected
             */
            initStructure: function () {
                this.main.innerHTML = getMainHtml.call(this);
            },
    
            /**
             * 初始化事件交互
             *
             * @protected
             * @override
             */
            initEvents: function () {
                //左右的把手事件绑定
                var left = this.helper.getPart('left-handler');
                var right = this.helper.getPart('right-handler');
                this.helper.addDOMEvent(left, 'click', u.bind(pointerClick, this, -1));
                this.helper.addDOMEvent(right, 'click', u.bind(pointerClick, this, 1));
                //列表项切换
                var ul = this.helper.getPart('list');
                this.helper.addDOMEvent(ul, 'click', u.bind(itemChangeHandler, this));
                //最下面翻页
                var toolbar = this.helper.getPart('toolbar');
                this.helper.addDOMEvent(toolbar, 'click', u.bind(toolbarHandler, this));
            },
    
            /**
             * 重新渲染视图
             * 仅当生命周期处于RENDER时，该方法才重新渲染
             *
             * @param {Array=} 变更过的属性的集合
             * @override
             */
            repaint: paint.createRepaint(
                Control.prototype.repaint,
                {
                    name: ['datasource', 'itemWidth', 'itemHeight'],
                    paint: function (carousel, datasource, itemWidth, itemHeight) {
                        var list = carousel.helper.getPart('list');
                        var toolbar = carousel.helper.getPart('toolbar');
                        list.innerHTML = getItemHtml.call(carousel, datasource, itemWidth, itemHeight);
                        toolbar.innerHTML = getToolbarHtml.call(carousel, datasource);
                        //设置wrap的宽高
                        //4为每项的border宽度 
                        //2为每项的margin宽度
                        var wrapWidth = (itemWidth + 4 * 2 + 2 * 2) * carousel.pageSize;
                        var wrapHeight = itemHeight + 4 * 2;
                        carousel.wrapWidth = wrapWidth;
                        var wrap = list.parentNode;
                        wrap.style.width = wrapWidth + 'px';
                        wrap.style.height = wrapHeight + 'px';
                        var container = carousel.helper.getPart('main');
                        container.style.width = wrapWidth + 30 * 2 + 'px';
                    }
                },
                {
                    name: 'value',
                    paint: function (carousel, value) {
                        carousel.setValue(value);
                    }
                }
            ),

            /**
             * 设置选中项
             * @param {number} value 选中项的值
             * @public 
             */
            setValue: function (value) {
                if (!value && value !== 0) {
                    return;
                }
                this.value = parseInt(value, 10);
                this.selectedIndex = -1;
                var me = this;
                u.each(this.datasource, function (item, index) {
                    if (item.id === me.value) {
                        me.selectedIndex = index;
                    }
                });
                this.selectedItem = this.datasource[this.selectedIndex];

                if (this.selectedIndex !== -1) {
                    var selector = this.helper.getPart('list');
                    var lis = selector.getElementsByTagName('li');
                    var selectedClass = this.helper.getPrimaryClassName('selected-item');
                    u.each(lis, function (dom, i) {
                        lib.removeClass(dom, selectedClass);
                    });
                    var li = lis[this.selectedIndex];
                    lib.addClass(li, selectedClass);
                }
                var page = getPageByIndex.call(this);
                this.setPage(page);
            },
    
            /**
             * 设置page
             * @param {number} page 获取page的序号 
             * @public
             */
            setPage: function (page) {
                page = page || 0;
                page = parseInt(page, 10);
                var currentPageClass = this.helper.getPrimaryClassName('current-page');
                if (this.currentPage === null) {
                    this.currentPage = 0;
                }
                if (this.currentPage !== page) {
                    this.currentPage = page;
                }
                var allDom = lib.getChildren(this.helper.getPart('toolbar'));
                var me = this;
                u.each(allDom, function (dom, i) {
                    lib.removeClass(dom, currentPageClass);
                    var index = parseInt(dom.getAttribute('index'), 10);
                    if (me.currentPage === index) {
                        lib.addClass(dom, currentPageClass);
                    }
                });
                setPointerStyle.call(this);
                setCarouseListPosition.call(this);
            },

            /**
             * 获取值
             * @return {number}
             * @public 
             */
            getValue: function() {
                return this.value;
            }
        };
    })();
    
    var Carousel = eoo.create(Control, exports);
    require('esui/main').register(Carousel);
    return Carousel;
});
