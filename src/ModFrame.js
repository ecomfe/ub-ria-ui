/**
 * 快捷输入控件浮层
 * @file: ModFrame.js
 * @author: liwei
 *
 */

define(function (require) {
    var u = require('underscore');
    var Panel = require('esui/Panel');
    var Overlay = require('esui/Overlay');
    var Button = require('esui/Button');
    var Label = require('esui/Label');
    var Link = require('esui/Link');
    var lib = require('esui/lib');

    var eoo = require('eoo');


    var count = 0;

    var titleTpl = [
        '<div class="${0}" id="${1}">',
        '<span data-ui="type:Label;id:${5};childName:${5};skin:display;',
        'maxWidth:@labelMaxWidth" class="no-break"></span>',
        '<a href="javascript:;" class="trigger ${4}" data-ui="type:Link;',
        'id:${6};childName:${6};skin:change">修改</a>',
        '${3}',
        '${2}',
        '</div>'
    ].join('');

    var btnTpl = [
        '<div class="${0}">',
        '<div data-ui="type:Button;id:${1};childName:${1};skin:flat;">保存</div>',
        '<div data-ui="type:Button;id:${2};childName:${2};skin:link;">取消</div>',
        '</div>'
    ].join('');


    var overlayTpl = [
        '<div data-ui="type:Overlay;autoClose:false;fixed:true;id:${3};childName:${3};',
        'width:${1};height:${2};" style="position:absolute">',
        '${0}</div>'
    ].join('');

    function getOverlayHtml(html) {
        return lib.format(overlayTpl, {
            0: html,
            1: this.width || 200,
            2: this.height || 100,
            3: this.overlayId
        });
    }

    function getTitleHtml() {
        return lib.format(titleTpl, {
            0: this.helper.getPartClassName('title'),
            1: this.helper.getId('title'),
            2: this.hint ? '<span class="hint validate-info">' + this.hint + '</span>' : '',
            3: this.tip ? '<span class="cred">' + this.tip + '</span>' : '',
            4: +this.hideLink === 1 || this.hideLink === true ? 'hide' : '',
            5: this.txtLabelId,
            6: this.modifyLinkId
        });
    }

    function getBtnHtml() {
        return lib.format(btnTpl, {
            0: this.helper.getPartClassName('toolbar'),
            1: this.saveBtnId,
            2: this.cancelBtnId
        });
    }

    function updateTxtLabel(inputControl) {
        var text;
        switch (inputControl.type) {
            // case 'Calendar': break;
            // case 'RangeCalendar': break;
            case 'Select': text = inputControl.getDisplayHTML(inputControl.getSelectedItem()); break;
            default: text = inputControl.getValue(); break;
        }
        this.setLabelText(text);
    }

    var exports = {};

    /**
    * @constructor
    * @param {Object} options 控件初始化参数.
    * @extends {Overlay}
    * @export
    */
    exports.constructor = function (options) {
        this.$super(arguments);

        /**
         * @private
         * @type {string|boolean}
         */
        this.hideLink;

        /**
         * @private
         * @type {string}
         */
        this.hint;

        /**
         * @private
         * @type {string}
         */
        this.tip;

        /**
         * @private
         * @type {string} 指定layer定位
         */
        if (this.position) {
            this.position = this.position.split('-');
        }
        else {
            this.position = ['right', 'top'];
        }

        count++;
        this.overlayId = 'overlay_' + count;
        this.txtLabelId = 'txtLabel_' + count;
        this.modifyLinkId = 'modifyLink_' + count;
        this.saveBtnId = 'saveBtn_' + count;
        this.cancelBtnId = 'cancelBtn_' + count;
    };

    exports.type = 'ModFrame';

    exports.initStructure = function () {
        var childrenElements = [].slice.call(this.main.children);
        this.appendContent(lib.bind(getOverlayHtml, this)(lib.bind(getBtnHtml, this)()));
        this.prependContent(lib.bind(getTitleHtml, this)());

        var wrapperOverlay = this.getChild(this.overlayId);
        var txtLabel = this.getChild(this.txtLabelId);
        var modifyLink = this.getChild(this.modifyLinkId);

        var inputControl;
        u.each(this.children, function (child) {
            if (child !== wrapperOverlay
                && child !== txtLabel
                && child !== modifyLink) {
                inputControl = child;
                return false;
            }
        });

        if (!inputControl) {
            throw new Error('Lack of child input control!');
        }

        wrapperOverlay.addChild(inputControl, inputControl.childName || inputControl.id);
        wrapperOverlay.inputControl = inputControl;

        var wrapperOverlayMain = wrapperOverlay.main;
        var wrapperOverlayFirstChild = wrapperOverlayMain.firstChild;
        u.forEach(childrenElements, function (child) {
            wrapperOverlayMain.insertBefore(child, wrapperOverlayFirstChild);
        });
    };


    exports.onafterrender = function () {
        var wrapperOverlay = this.getChild(this.overlayId);
        var txtLabel = this.getChild(this.txtLabelId);
        wrapperOverlay.setProperties({attachedControl: txtLabel});
    };


    exports.initEvents = function () {
        this.$super(arguments);
        var me = this;

        var txtLabel = this.getChild(this.txtLabelId);
        var wrapperOverlay = this.getChild(this.overlayId);
        var cancelBtn = wrapperOverlay.getChild(this.cancelBtnId);
        var saveBtn = wrapperOverlay.getChild(this.saveBtnId);
        var modifyLink = this.getChild(this.modifyLinkId);

        modifyLink.onclick = function () {
            wrapperOverlay.show();
            wrapperOverlay.attachLayout(txtLabel.main, me.position);
        };

        cancelBtn.onclick = function () {
            wrapperOverlay.hide();
        };

        saveBtn.onclick = function () {
            if (wrapperOverlay.inputControl.validate()) {
                lib.bind(updateTxtLabel, me)(wrapperOverlay.inputControl);
                wrapperOverlay.hide();
            }
        };
    };

    /**
     * @param {string} [txt] 设置显示的文本
     */
    exports.setLabelText = function (txt) {
        this.setProperties({labelText: txt});
    };

    /**
     * @return {InputControl} 返回内嵌在ModFrame中的输入控件
     */
    exports.getInputControl = function () {
        var wrapperOverlay = this.getChild(this.overlayId);
        return wrapperOverlay && wrapperOverlay.inputControl;
    };

    exports.repaint = require('esui/painters').createRepaint(
        Panel.prototype.repaint,
        {
            name: ['labelText'],
            paint: function (frame, labelText) {
                var txtLabel = frame.getChild(frame.txtLabelId);
                txtLabel.setText(labelText);
            }
        }
    );

    var ModFrame = eoo.create(Panel, exports);
    require('esui/main').register(ModFrame);
    return ModFrame;
});
