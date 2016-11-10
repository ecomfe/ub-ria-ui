/**
 * UB-RIA-UI
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file Lazyload
 * @author hongfeng(homfen@outlook.com)
 */

define(
    function (require) {
        var esui = require('esui');
        var eoo = require('eoo');
        var Control = require('esui/Control');
        var u = require('underscore');

        var Lazyload = eoo.create(
            Control,
            {
                /**
                 * 控件类型，始终为`"Lazyload"`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'Lazyload',

                /**
                 * 初始化参数
                 *
                 * @param {Object} [options] 构造函数传入的参数
                 * @protected
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        containerClass: 'esui-lazy-container',
                        itemClass: 'esui-lazy-item',
                        dataAttribute: 'original',
                        placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyQzhFNjc3OTk2NUExMUUzQjg2Q0IzNzZBNEREMjQ5MSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoyQzhFNjc3QTk2NUExMUUzQjg2Q0IzNzZBNEREMjQ5MSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjJDOEU2Nzc3OTY1QTExRTNCODZDQjM3NkE0REQyNDkxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjJDOEU2Nzc4OTY1QTExRTNCODZDQjM3NkE0REQyNDkxIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+dYEt4QAABnhJREFUeNrsnWlT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',
                        appear: null,
                        offset: 0
                    };
                    u.extend(properties, options);
                    this.setProperties(properties);
                },

                /**
                 * 初始化事件交互
                 *
                 * @protected
                 * @override
                 */
                initEvents: function () {
                    lazyload.call(this);
                    this.helper.addDOMEvent(window, 'resize.lazyload', u.bind(lazyload, this));
                },

                /**
                 * 销毁释放控件
                 *
                 * @fires beforedispose
                 * @fires afterdispose
                 */
                dispose: function () {
                    if (!this.helper.isInStage('DISPOSED')) {
                        dispose.call(this);
                    }
                }
            }
        );

        function lazyload() {
            var me = this;
            var containers = $('.' + this.containerClass);
            var items = containers.find('.' + this.itemClass);
            if (items.length) {
                if (!containers.length) {
                    containers = $(window);
                }
                items.each(function () {
                    var item = $(this);
                    item.attr('src', me.placeholder);
                });
                containers.each(function () {
                    var container = $(this);
                    var handler = u.bind(loadItem, me, container);
                    if (!container.data('inited')) {
                        container.data('inited', true);
                        me.helper.addDOMEvent(container[0], 'scroll.lazyload', handler);
                    }
                    handler();
                });
            }
        }

        function loadItem(container) {
            if (checkInSight(container, window, this.offset)) {
                var items = container.find('.' + this.itemClass);
                var allLoaded = true;
                var me = this;
                var count = 0;
                items.each(function () {
                    var item = $(this);
                    if (!item.data('loaded')) {
                        allLoaded = false;
                        if (checkInSight(item, container, me.offset)) {
                            var src = item.data(me.dataAttribute);
                            item.on('load', function () {
                                if (me.appear) {
                                    me.appear.call($(this));
                                }
                                $(this).off('load');
                                $(this).data('loaded', true);
                            });
                            item.attr('src', src);
                            count++;
                        }
                    }
                    else {
                        count++;
                    }
                });
                if (allLoaded || count === items.length) {
                    container.off('.lazyload');
                }
            }
        }

        function checkInSight(element, container, offset) {
            return !aboveOfFold(element, container, offset)
                && !belowOfFold(element, container, offset)
                && !leftOfFold(element, container, offset)
                && !rightOfFold(element, container, offset);
        }

        function aboveOfFold(element, container, offset) {
            var fold;
            if (!container || container === window) {
                fold = $(window).scrollTop();
            }
            else {
                fold = $(container).offset().top;
            }
            return fold >= $(element).offset().top + $(element).height() + offset;
        }

        function belowOfFold(element, container, offset) {
            var fold;
            if (!container || container === window) {
                fold = $(window).scrollTop() + $(window).height();
            }
            else {
                fold = $(container).offset().top + $(container).height();
            }
            return fold <= $(element).offset().top - offset;
        }

        function leftOfFold(element, container, offset) {
            var fold;
            if (!container || container === window) {
                fold = $(window).scrollLeft();
            }
            else {
                fold = $(container).offset().left;
            }
            return fold >= $(element).offset().left + $(element).width() + offset;
        }

        function rightOfFold(element, container, offset) {
            var fold;
            if (!container || container === window) {
                fold = $(window).scrollLeft() + $(window).width();
            }
            else {
                fold = $(container).offset().left + $(container).width();
            }
            return fold <= $(element).offset().left - offset;
        }

        function dispose() {
            var me = this;
            $('.' + this.containerClass).each(function () {
                me.helper.removeDOMEvent(this, '.lazyload');
            });
            me.helper.removeDOMEvent(window, '.lazyload');
        }

        esui.register(Lazyload);
        return Lazyload;
    }
);
