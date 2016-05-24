/**
 * UB-RIA-UI
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 文本框辅助方法
 * @author zengxiaohui(zengxiaohui@baidu.com)
 *         weifeng(weifeng@baidu.com)
 */

define(
    function (require) {
        var exports = {};

        /**
         * 获取文本框t当前光标所在位置
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @return {number} 光标所在位置
         */
        exports.getCaretPosition = function (t) {
            var value;
            var len;
            var textInputRange;
            var endRange;
            var pos = 0;

            if (document.selection) {
                // IE
                var ds = document.selection;
                var range = ds.createRange();

                if (range && range.parentElement() === t) {
                    value = t.value.replace(/\r\n/g, '\n');
                    len = value.length;

                    textInputRange = t.createTextRange();
                    textInputRange.moveToBookmark(range.getBookmark());

                    endRange = t.createTextRange();
                    endRange.collapse(false);

                    if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                        pos = len;
                    }
                    else {
                        pos = -textInputRange.moveStart('character', -len);
                    }
                }

                return pos;
            }

            // chrome
            return t.selectionStart;
        };

        /**
         * 在文本框t中，设置光标的位置为p
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @param  {number} p 光标位置
         */
        exports.setCaretPosition = function (t, p) {
            select(t, p, p);
        };

        /**
         * 获取光标前的字符串
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @return {string} 光标前的字符串
         */
        exports.getTextBeforeCaret = function (t) {
            var value = t.value;
            var str = value;
            var caretPos = this.getCaretPosition(t);
            str = value.slice(0, caretPos);

            if (document.selection) {
                // IE的文本框换行有两个字符
                str = str.replace(/\r\n/g, '\n');
            }

            // 需要对空格、'<'等符号进行编码
            str = this.encodeHTML(str);
            str = str.replace(/\n/g, '<br >');
            return str;
        };

        /**
         * 对字符中进行HTML编码
         *
         * @param {string} source 源字符串
         * @return {string} HTML编码后的字符串
         */
        exports.encodeHTML = function (source) {
            source = source + '';
            return source
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        /**
         * 选中文本框t中，从s到e的字符
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @param  {number} s 开始位置
         * @param  {number} e 结束位置
         */
        function select(t, s, e) {
            if (document.selection) {

                // 创建一个可变的动态的range
                var range = t.createTextRange();

                range.moveEnd('character', -t.value.length);
                range.moveEnd('character', e);
                range.moveStart('character', s);
                range.select();
            }
            else {
                t.setSelectionRange(s, e);
                t.focus();
            }
        }

        /**
         * 在文本框t当前光标位置后面添加字符txt
         *
         * @param {HTMLTextAreaElement} t  文本框
         * @param {string} txt 待插入字符
         * @param {number} caretPos 光标位置
         */
        exports.add = function (t, txt, caretPos) {
            if (document.selection) {
                t.focus();
                this.setCaretPosition(t, caretPos);
                document.selection.createRange().text = txt;
            }
            else {
                var cp = t.selectionStart;
                var len = t.value.length;

                t.value = t.value.slice(0, cp) + txt + t.value.slice(cp, len);
                this.setCaretPosition(t, cp + txt.length);
            }
        };

        /**
         * 删除光标前面或者后面的n个字符
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @param  {number}  n>0删除后面n字符，否则删除前面n字符
         * @param  {number} caretPos 光标位置
         */
        exports.del = function (t, n, caretPos) {
            var p = caretPos || this.getCaretPosition(t);
            var val = t.value;

            if (document.selection) {
                val = val.replace(/\r\n/g, '\n');
            }

            t.value = n > 0 ? val.slice(0, p) + val.slice(p - n)
                            : val.slice(0, p + n) + val.slice(p);

            var newPos = p - (n < 0 ? -n : 0);
            this.setCaretPosition(t, newPos);
        };

        return exports;
    }
);
