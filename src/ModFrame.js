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
        '<div class="${titleClass}" id="${titleId}">',
        '<span data-ui="type:Label;id:${txtLabelId};childName:${txtLabelId};skin:display;',
        'maxWidth:@labelMaxWidth" class="no-break"></span>',
        '<a href="javascript:;" class="trigger ${linkHide}" data-ui="type:Link;',
        'id:${modifyLinkId};childName:${modifyLinkId};skin:change">${modifyBtnContent}</a>',
        '${tip}',
        '${hint}',
        '</div>'
    ].join('');

    var btnTpl = [
        '<div class="${toolbarClass}">',
        '<div data-ui="type:Button;id:${saveBtnId};childName:${saveBtnId};skin:flat;">保存</div>',
        '<div data-ui="type:Button;id:${cancelBtnId};childName:${cancelBtnId};skin:link;">取消</div>',
        '</div>'
    ].join('');


    var overlayTpl = [
        '<div data-ui="type:Overlay;autoClose:false;fixed:true;id:${overlayId};childName:${overlayId};',
        'width:${width};height:${height};" style="position:absolute">',
        '${content}</div>'
    ].join('');

    function getOverlayHtml(html) {
        return lib.format(overlayTpl, {
            content: html,
            width: this.width || 'auto',
            height: this.height || 'auto',
            overlayId: this.overlayId
        });
    }

    function getTitleHtml() {
        return lib.format(titleTpl, {
            titleClass: this.helper.getPartClassName('title'),
            titleId: this.helper.getId('title'),
            hint: this.hint ? '<span class="hint validate-info">' + this.hint + '</span>' : '',
            tip: this.tip ? '<span class="cred">' + this.tip + '</span>' : '',
            linkHide: +this.hideLink === 1 || this.hideLink === true ? 'hide' : '',
            txtLabelId: this.txtLabelId,
            modifyLinkId: this.modifyLinkId,
            modifyBtnContent: this.modifyBtnIcon ? '<span class="' + this.modifyBtnIcon + '"></span>' : (this.modifyBtnText || '修改')
        });
    }

    function getBtnHtml() {
        return lib.format(btnTpl, {
            toolbarClass: this.helper.getPartClassName('toolbar'),
            saveBtnId: this.saveBtnId,
            cancelBtnId: this.cancelBtnId
        });
    }

    function noop() {}

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

        /*var wrapperOverlay = this.getChild(this.overlayId);
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
        });*/
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

        cancelBtn.onclick = me.onSave || noop;

        saveBtn.onclick = me.onCancel || noop;
    };

    /**
     * 隐藏弹出层
     */
    exports.hideOverlay = function () {
        var wrapperOverlay = this.getChild(this.overlayId);
        wrapperOverlay.hide();
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
