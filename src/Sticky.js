/**
 * @file Sticky控件类
 * @exports Sticky
 */

define(function (require) {
    var u = require('underscore');
    var lib = require('esui/lib');
    var paint = require('esui/painters');
    var Control = require('esui/Control');
    var eoo = require('eoo');

    var sticked = [];
    var bindScroll = false;
    var getCurrentStyle = lib.getComputedStyle;

    function documentHeight() {
        return Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.documentElement.clientHeight);
    }

    function check(sticky) {
        if (sticky.disabled) {
            return false;
        }
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop,
            dwh = documentHeight() - window.innerHeight,
            extra = (scrollTop > dwh) ? dwh - scrollTop : 0,
            etse = sticky.initialTop - sticky.top - extra;
        return (scrollTop >= etse);
    }

    function reset(sticky) {
        sticky.currentTop = null;
        var style = sticky.main.style;
        style.position = '';
        style.top = '';
        style.width = '';
        style.margin = 0 + 'px';
        style.left = '';
    }

    function checkscrollposition() {
        var stickies = sticked;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (!stickies.length || scrollTop < 0) {
            return;
        }

        var windowHeight = document.documentElement.clientHeight;
        var dwh = documentHeight() - windowHeight;
        var extra = (scrollTop > dwh) ? dwh - scrollTop : 0;
        var newTop;
        var stickyHeight;
        var sticky;
        var stickyMainElement;

        for (var i = 0; i < stickies.length; i++) {
            sticky = stickies[i];
            stickyMainElement = sticky.main;
            if (!stickyMainElement.offsetWidth || !stickyMainElement.offsetHeight) {
                continue;
            }
            if (!check(sticky)) {
                if (!isNaN(sticky.currentTop)) {
                    reset(sticky);
                }
            } 
            else {
                if (sticky.top < 0) {
                    newTop = 0;
                } 
                else {
                    stickyHeight = stickyMainElement.offsetHeight;
                    newTop = documentHeight - stickyHeight - sticky.top - scrollTop - extra;
                    newTop = newTop < 0 ? newTop + sticky.top : sticky.top;
                }
                if (sticky.currentTop != newTop) {
                    var style = stickyMainElement.style;
                    style.position = 'fixed';
                    style.top = parseInt(newTop) + 'px';
                    style.left = lib.getOffset(stickyMainElement).left + 'px';
                    style.margin = '';
                    sticky.currentTop = newTop;
                }
            }
        }
    }

    var exports = {
        type : 'Sticky',

        initOptions: function (options) {
            var properties = {
                top: 0
            };
            u.extend(properties, options); 
            this.setProperties(properties);
        },

        initStructure: function () {
            var mainElement = this.main;
            var child = lib.getChildren(mainElement)[0];
            var height = getCurrentStyle(child, 'position') != 'absolute' ? child.offsetHeight : ''; 
            var style = mainElement.style;

            style.display = 'block';
            style.height = height + 'px';
            style.float = getCurrentStyle(child, 'float') != 'none' ? getCurrentStyle(child).float : '';
            style.margin = getCurrentStyle(child, 'margin');
            this.initialTop = lib.getOffset(this.main).top;
  
            sticked.push(this);
        },

        initEvents: function() {
            if (!bindScroll) {
                // addDOMEvent中对scroll进行了延迟，所以不够流畅
                this.helper.addDOMEvent(window, 'scroll', checkscrollposition);
                bindScroll = true;
            }
        }
    };

    var Sticky = eoo.create(Control, exports);
    require('esui/main').register(Sticky);
    return Sticky;
});
