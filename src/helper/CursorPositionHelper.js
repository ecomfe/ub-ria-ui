/**
 * @file获取光标像素坐标
 * @author liwei@baidu.com
 */

define(function (require) {
    var $ = require('jquery');
    var u = require('underscore');
    var eoo = require('eoo');

    var DIV_PROPERTIES = {
        left: -9999,
        position: 'absolute',
        top: 0,
        whiteSpace: 'pre-wrap'
    };

    var COPY_PROPERTIES = [
        'border-width', 'font-family', 'font-size', 'font-style', 'font-variant',
        'font-weight', 'height', 'letter-spacing', 'word-spacing', 'line-height',
        'text-decoration', 'text-align', 'width', 'padding-top', 'padding-right',
        'padding-bottom', 'padding-left', 'margin-top', 'margin-right',
        'margin-bottom', 'margin-left', 'border-style', 'box-sizing', 'tab-size'
    ];

    function getStyles() {
        var styles = {};
        var self = this;
        $.each(COPY_PROPERTIES, function (i, property) {
            styles[property] = self.$el.css(property);
        });
        return styles;
    }

    function copyCss() {
        // Set 'scroll' if a scrollbar is being shown; otherwise 'auto'.
        var overflow = this.el.scrollHeight > this.el.offsetHeight ? 'scroll' : 'auto';
        return u.extend(
            {
                overflow: overflow
            },
            DIV_PROPERTIES,
            getStyles.call(this)
        );
    }

    function getTextFromHeadToCaret() {
        return this.el.value.substring(0, this.el.selectionEnd);
    }

    function getTextFromHeadToCaretIE() {
        this.el.focus();
        var range = document.selection.createRange();
        range.moveStart('character', -this.el.value.length);
        var arr = range.text.split(sentinelChar)
        return arr.length === 1 ? arr[0] : arr[1];
    }

    function getCaretRelativePosition() {
        var notIE = typeof this.el.selectionEnd === 'number';
        var getHeadText =
            notIE ? getTextFromHeadToCaret : getTextFromHeadToCaretIE;

        var $dummyDiv = $('<div></div>')
                .css(copyCss.call(this))
                .text(getHeadText.call(this));
        var $span = $('<span></span>').text('.').appendTo($dummyDiv);
        this.$el.before($dummyDiv);
        var position = $span.position();
        position.top += $span.height() - this.$el.scrollTop();
        position.lineHeight = $span.height();
        $dummyDiv.remove();
        return position;
    }

    var TextAreaPositionHelper = eoo.create(
        {
            constructor: function (ele) {
                this.$el = $(ele);
                this.el = this.$el[0];
            },

            getCaretPosition: function () {
                var position = getCaretRelativePosition.call(this);
                var offset = this.$el.offset();
                position.top += offset.top;
                position.left += offset.left;
                return position;
            }
        }
    );

    return TextAreaPositionHelper;
});
