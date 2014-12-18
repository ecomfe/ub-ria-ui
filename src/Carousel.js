/**
 * @file 图片轮播控件
 * @author yaofeifei(yaofeifei@baidu.com)
 */

define(function (require) {
    var u = require('underscore');
    var lib = require('esui/lib');
    var paint = require('esui/painters');
    var Control = require('esui/Control');

    var mainTpl = [
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
    var itemTpl = [
        '<li class="${type-selector}-item ${item-selector}" index="${index}" style="width:${width}px;height:${height}px;">',
            '<img class="${type-selector}-item-img" src="${imgSrc}"/>',
            '<span class="${type-selector}-check ${icon-check}"></span>',
        '</li>'
    ].join('');
    var pageTpl = '<li index="${index}" class="${type-selector}-page"></li>';

    function Carousel(options) {
        Control.call(this, options);
    }

    Carousel.prototype = {
        /**
         * 控件类型，始终为`"Button"`
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
         * @protected
         * @override
         */
        initOptions: function (options) {
            /**
             * 默认选项配置
             */
            var properties = {
                pageSize: 8,
                itemWidth: 80,
                itemHeight: 50,
                itemKey: 'templateId',
                itemObjectKey: 'thumbnail',
                datasource: [],
                value: null,
                disabled: false
            };
            u.extend(properties, options);
            if (properties.value) {
                properties.value = parseInt(properties.value, 10);
            }
            var itemWidth = parseFloat(properties.itemWidth, 10);
            var itemHeight = parseFloat(properties.itemHeight, 10);
            var pageSize = parseFloat(properties.pageSize, 10);
            properties._wrapWidth = (itemWidth + 4 * 2 + 2 * 2) * pageSize;
            properties._wrapHeight = itemHeight + 4 * 2;
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
            this.main.innerHTML = this._getMainHtml();
        },

        /**
         * 初始化事件交互
         *
         * @protected
         * @override
         */
        initEvents: function () {
            var me = this;
            //左右的把手事件绑定
            var left = lib.g(me.helper.getId('leftP'));
            var right = lib.g(me.helper.getId('rightP'));
            me.helper.addDOMEvent(left, 'click', function () {
                me._pointerClick(-1);
            });
            me.helper.addDOMEvent(right, 'click', function () {
                me._pointerClick(1);
            });
            //列表项切换
            var ul = lib.g(me.helper.getId('list'));
            me.helper.addDOMEvent(ul, 'click', me._itemChangeHandler);
            //最下面翻页
            var toolbar = lib.g(me.helper.getId('toolbar'));
            me.helper.addDOMEvent(toolbar, 'click', me._toolbarHandler);
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
                    var list = lib.g(carousel.helper.getId('list'));
                    var toolbar = lib.g(carousel.helper.getId('toolbar'));
                    list.innerHTML = carousel._getItemHtml(datasource, itemWidth, itemHeight);
                    toolbar.innerHTML = carousel._getToolbarHtml(datasource);
                }
            },
            {
                name: 'value',
                paint: function (carousel, value) {
                     carousel.setValue(value);
                }
            },
            {
                name: '_wrapWidth',
                paint: function (carousel, value) {
                    var wrap = lib.g(carousel.helper.getId('list')).parentNode;
                    wrap.style.width = value + 'px';
                    var container = lib.g(carousel.helper.getId('main'));
                    container.style.width = value + 30 * 2 + 'px';
                }
            },
            {
                name: '_wrapHeight',
                paint: function (carousel, value) {
                    var wrap = lib.g(carousel.helper.getId('list')).parentNode;
                     wrap.style.height = value + 'px';
                }
            }
        ),

        /**
         * 拼接main的dom结构
         * @return {string} html片段
         * @private 
         */
        _getMainHtml : function () {
            var me = this;
            return lib.format(
                mainTpl,
                {
                    'type-selector': me.helper.getPrimaryClassName(),
                    'contentId': me.helper.getId('main'),
                    'leftId': me.helper.getId('leftP'),
                    'listId': me.helper.getId('list'),
                    'rightId': me.helper.getId('rightP'),
                    'toolbarId': me.helper.getId('toolbar'),
                    'icon-left-arrow': me.helper.getIconClass('chevron-left'),
                    'icon-right-arrow': me.helper.getIconClass('chevron-right')
                }
            );
        },

        /**
         * 拼接内容项的dom结构
         * @param {Array} data 渲染数据
         * @param {number} itemWidth 单项的宽
         * @param {number} itemHeight 单项的高
         * @return {string} html片段
         * @private 
         */
        _getItemHtml: function (data, itemWidth, itemHeight) {
            var me = this;
            var html = [];
    
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var _tmpItem = item;
                if (typeof item[me.itemObjectKey] === 'object') {
                    _tmpItem = item[me.itemObjectKey];
                }
                var str = lib.format(
                    itemTpl,
                    {
                        'imgSrc': _tmpItem.url,
                        'width': itemWidth,
                        'height': itemHeight,
                        'index': i,
                        'type-selector': me.helper.getPrimaryClassName(),
                        'item-selector': me.disabled ? me.helper.getPartClassName('disabled') : '',
                        'icon-check': me.helper.getIconClass('check')
                    }
                );
                html.push(str);
            }
            return html.join('');
        },

        /**
         * 拼接底部分页条的dom结构
         * @param {Array} data 渲染所需的数据
         * @return {string} html片段
         * @private 
         */
        _getToolbarHtml : function (data) {
            var me = this;
            data = data || me.datasource;
            var html = [];
            var len = data.length;
            var divided = Math.ceil(len / me.pageSize);
            var realLen = divided;
    
            me.PAGE_LENGTH = realLen;
            
            for (var i = 0; i < realLen; i++) {
                var str = lib.format(
                    pageTpl,
                    {
                        index: i,
                        'type-selector': me.helper.getPrimaryClassName()
                    }
                );
                html.push(str);
            }
            return html.join('');
        },

        /**
         * 获取page的序号根据选中项的index
         * @return {number} page的序号
         * @private 
         */
        _getPageByIndex: function () {
            if (this.selectedIndex === -1) {
                return 0;
            }
            return Math.floor(this.selectedIndex / this.pageSize);
        },

        /**
         * 设置选中项
         * @param {number} value 选中项的值
         * @public 
         */
        setValue: function (value) {
            var me = this;
            me.value = parseInt(value, 10) || me.value;
            if (this.value === null) {
                this.selectedIndex = 0;
                var selectedItem = this.datasource[this.selectedIndex];
                this.value = selectedItem ? selectedItem[me.itemKey] : null;
            }
            else {
                var noValueMatch = true;
                for (var i = 0; i < me.datasource.length; i++) {
                    var item = me.datasource[i];
                    if (item[me.itemKey] === this.value) {
                        this.selectedIndex = i;
                        noValueMatch = false;
                        break;
                    }
                }
                if (noValueMatch) {
                    this.selectedIndex = -1;
                }
            }
    
            if (this.selectedIndex !== -1) {
                var selector = lib.g(me.helper.getId('list'));
                var lis = selector.getElementsByTagName('li');
                if (lis && lis.length) {
                    var li = lis[this.selectedIndex];
                    lib.addClass(li, this.helper.getPrimaryClassName('selected-item'));
                }
            }
            var page = this._getPageByIndex();
            this.setPage(page);
        },

        /**
         * 设置page
         * @param {number} page 获取page的序号 
         * @public
         */
        setPage: function (page) {
            var me = this;
            page = page || 0;
            page = parseInt(page, 10);
            var currentPageClass = me.helper.getPrimaryClassName('current-page');
            if (this.currentPage === null) {
                this.currentPage = 0;
            }
            if (this.currentPage !== page) {
                this.currentPage = page;
            }
            /**
             * 先取消所有的已选page
             */
            var allDom = lib.getChildren(lib.g(me.helper.getId('toolbar')));
            for (var i = 0; i < allDom.length; i++) {
                var dom = allDom[i];
                lib.removeClass(dom, currentPageClass);
                var index = parseInt(dom.getAttribute('index'), 10);
                if (this.currentPage === index) {
                    lib.addClass(dom, currentPageClass);
                }
            }
            me._setPointerStyle();
            me._setCarouseListPosition();
        },

        /**
         * 设置左右箭头的样式
         * @private 
         */
        _setPointerStyle: function () {
            var disableClass = this.helper.getPartClasses('pointer-disable')[0];
            if (this.PAGE_LENGTH === 1) {
                lib.addClass(this.helper.getId('leftP'), disableClass);
                lib.addClass(this.helper.getId('rightP'), disableClass);
            }
            else {
                if (this.currentPage === 0) {
                    lib.addClass(this.helper.getId('leftP'), disableClass);
                    lib.removeClass(this.helper.getId('rightP'), disableClass);
                }
                else if (this.currentPage === this.PAGE_LENGTH - 1) {
                    lib.removeClass(this.helper.getId('leftP'), disableClass);
                    lib.addClass(this.helper.getId('rightP'), disableClass);
                }
                else {
                    lib.removeClass(this.helper.getId('leftP'), disableClass);
                    lib.removeClass(this.helper.getId('rightP'), disableClass);
                }
            }
            
        },

        /**
         * 设置翻页的滚动位置
         * @private 
         */
        _setCarouseListPosition: function () {
            var pageOffset = -this._wrapWidth;
            var left = (pageOffset * this.currentPage) + 'px';
            lib.g(this.helper.getId('list')).style.left = left;
        },

        /**
         * 左右箭头点击后的处理函数
         * @param {number} n 区别方向  -1=left 1=right
         * @private 
         */
        _pointerClick: function (n) {
            var me = this;
            var nextPage = me.currentPage + n;
            if (nextPage >= me.PAGE_LENGTH ||
                nextPage <  0) {
                return;
            }
            else {
                me.setPage(nextPage);
            }
        },

        /**
         * 单个选项处理handler
         * @param {number} index 选项的序号 
         * @param {HTMLElement} el dom对象
         * @private
         */
        _itemClick: function (index, el) {
            var me = this;
            var selector;
            var selectedClass = me.helper.getPrimaryClassName('selected-item');
            if (me.disabled) {
                return;
            }
            else {
                if (me.selectedIndex === index) {
                    return;
                }
                if (me.selectedIndex !== -1) {
                    selector = lib.g(me.helper.getId('list'));
                    var lis = selector.getElementsByTagName('li');
                    var li = lis[me.selectedIndex];
                    lib.removeClass(li, selectedClass);
                }
                lib.addClass(el, selectedClass);
                me.selectedIndex = index;
                var item = me.datasource[me.selectedIndex];
                var value = me.datasource[me.selectedIndex][me.itemKey];
                me.value = value;
                /**
                 * @event select
                 *
                 * 切换选项时触发
                 *
                 * @param {value} index 选中项在{@Carousel#datasource}中的值
                 * @param {meta.Carousel} item 选中的项
                 * @param {number} index 选中项在{@Carousel#datasource}中的索引
                 * @member Carousel
                 */
                me.fire('change', {
                    'value': value, 
                    'item': item, 
                    'index': index 
                });
            }
        },

        /**
         * 设置控件状态
         * 
         * @param {boolean} isDisabled 是否需要将控件设置为disable
         */
        setDisable: function (isDisabled) {
            var me = this;
            var list = lib.g(this.helper.getId('list'));
            var children = lib.children(list);
            me.disabled = !!isDisabled;
            u.each(children, function (el) {
                if (me.disabled) {
                    lib.addClass(el, me.helper.getPartClassName('disabled'));
                }
                else {
                    lib.removeClass(el, me.helper.getPartClassName('disabled'));
                }
            });
            
        },

        /**
         * 翻页按钮点击处理函数
         * @param {number} nextPage 目标页的序号
         * @private 
         */
        _pageClick: function (nextPage) {
            if (this.currentPage === nextPage) {
                return;
            }
            else {
                this.setPage(nextPage);
            }
        },

        /**
         * 选择项切换处理函数，采用事件委托的方式
         * @param {Event} e 事件对象
         * @private
         */
        _itemChangeHandler: function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (target.nodeName === 'IMG') {
                var el = target.parentNode;
                var index = parseInt(el.getAttribute('index'), 10);
                this._itemClick(index, el);
            }
        },

        /**
         * 底部工具条处理函数，采用事件委托的方式
         * @param {Event} e 事件对象
         * @private
         */
         _toolbarHandler: function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (target.nodeName === 'LI') {
                var index = parseInt(target.getAttribute('index'), 10);
                this._pageClick(index);
            }
        },

        /**
         * 获取值
         * @return {number}
         * @public 
         */
        getValue: function() {
            return this.value;
        },

        /**
         * 获取选中项的数据
         * @return {Object}
         * @public 
         */
        getItem: function() {
            var me = this;
            var item = me.datasource[me.selectedIndex];
            return item;
        },

        /**
         * 释放控件
         * 
         * @public
         */
        dispose: function () {
            Carousel.superClass.dispose.call(this);
        }
    };

    lib.inherits(Carousel, Control);
    require('esui/main').register(Carousel);
    return Carousel;
});
