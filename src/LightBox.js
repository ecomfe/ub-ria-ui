/**
 * 弹层预览
 * @file LightBox.js
 * @author liwei
 */

define(function (require) {
    var lib = require('esui/lib');
    var u = require('underscore');
    var eoo = require('eoo');
    var Dialog = require('esui/Dialog');
    var Control = require('esui/Control');
    var helper = require('esui/controlHelper');
    var swf = require('./swf');

    var NOT_SUPPORT_MESSAGE = '暂不支持该格式预览';
    var VIDEO_TPL = [
        '<video id="${id}" title="${title}" width="${width}" height="${height}" src="${src}" autoplay="autoplay">',
        '该浏览器暂不支持此格式视频预览',
        '</video>'
    ].join('');

    var FLV_PLAYER = require.toUrl('img/video-preview-player.swf');

    var LOADING_TPL = '<div style="width:${width}px;height:${height}px;'
        + 'line-height:${height}px;text-align:center;">加载中...</div>';

    var LOADED_FAILTURE_TPL = '<div style="width:${width}px;height:${height}px;'
        + 'line-height:${height}px;text-align:center;">加载图片失败</div>';

    var exports = {};

    /**
     * @extends Control
     * @constructor
     */
    exports.constructor = function () {
        this.$super(arguments);
        this.dialog = null;
    };

    exports.type = 'LightBox';

    /**
     * 初始化配置
     *
     * @protected
     * @override
     */
    exports.initOptions = function (options) {
        var properties = {
            currentIndex: 0,
            width: 800,
            height: 'auto'
        };
        u.extend(properties, options);
        this.setProperties(properties);
    };

    /**
     * 初始化DOM结构
     *
     * @protected
     * @override
     */
    exports.initStructure = function () {
        var properties = {
            id: helper.getGUID('dialog-lightbox-foot'),
            type: 'warning',
            content: '',
            closeButton: true,
            mask: true,
            alwaysTop: true,
            closeOnHide: false,
            width: 'auto'
        };

        u.extend(properties, {
            title: this.title || '',
            foot: this.foot || '',
            draggable: this.draggable || false,
            needFoot: this.needFoot || false
        });
        var dialog = ui.create('Dialog', properties);
        dialog.appendTo(document.body);
        this.dialog = dialog;
    };

    /**
     * 初始化事件交互
     *
     * @protected
     * @override
     */
    exports.initEvents = function () {
        this.initCarousel();
        var leftLink = lib.g(helper.getId(this.dialog, 'link-left'));
        var rightLink = lib.g(helper.getId(this.dialog, 'link-right'));

        var me = this;

        helper.addDOMEvent(this.dialog, leftLink, 'click', function (e) {
            me.showPreviousMedia();
        });
        helper.addDOMEvent(this.dialog, rightLink, 'click', function (e) {
            me.showNextMedia();
        });
    };

    /**
     * 初始化图片/视频轮播
     *
     * @protected
     */
    exports.initCarousel = function () {
        var tpl = [
            '<div id="${mediaId}" class="${mediaStyle}"></div>',
            '<div id="${linkId}" class="${linkStyle}">',
            '<a href="javascript:;" id="${leftLinkId}" class="${leftLinkStyle}">',
            '<i class="${leftLinkIconStyle}"></i></a>',
            '<a href="javascript:;" id="${rightLinkId}" class="${rightLinkStyle}">',
            '<i class="${rightLinkIconStyle}"></i></a>',
            '</div>'
        ].join('');
        var body = this.dialog.getBody();
        body.setContent(
            lib.format(tpl, {
                mediaId: helper.getId(this.dialog, 'media'),
                mediaStyle: this.dialog.helper.getPartClassName('lightbox-content-media'),
                linkId: helper.getId(this.dialog, 'link'),
                linkStyle: this.dialog.helper.getPartClassName('lightbox-content-link'),
                leftLinkId: helper.getId(this.dialog, 'link-left'),
                leftLinkStyle: this.dialog.helper.getPartClassName('lightbox-content-link-left'),
                leftLinkIconStyle: this.dialog.helper.getIconClass('chevron-left'),
                rightLinkId: helper.getId(this.dialog, 'link-right'),
                rightLinkStyle: this.dialog.helper.getPartClassName('lightbox-content-link-right'),
                rightLinkIconStyle: this.dialog.helper.getIconClass('chevron-right')
            })
        );

        this.mediaContainer = lib.g(helper.getId(this.dialog, 'media'));
    };

    /**
     * 显示图片/视频对话框容器
     * @param {Object} args 显示对话框时传入的参数
     * @protected
     */
    exports.show = function (args) {
        args && this.setProperties(args);
        var link = lib.g(helper.getId(this.dialog, 'link'));
        link.style.display = this.datasource.length <= 1 ? 'none' : '';
        this.showMedia();
    };

    /**
     * 隐藏图片/视频对话框容器
     *
     * @protected
     */
    exports.hide = function () {
        this.dialog.hide();
    };

    /**
     * 填充内容
     * @param {Array} list 图片或视频数据列表
     * @protected
     */
    exports.setContent = function (list) {
        this.setProperties({
            datasource: list
        });
    };

    /**
     * 设置头部标题
     * @param {string} title 对话框头部标题
     * @protected
     */
    exports.setTitle = function (title) {
        this.setProperties({
            title: title
        });
    };

    /**
     * 设置尾部内容
     * @param {string} foot 对话框尾部内容
     * @protected
     */
    exports.setFoot = function (foot) {
        this.setProperties({
            foot: foot
        });
    };

    /**
     * 显示图片/视频
     *
     * @protected
     */
    exports.showMedia = function () {
        var data = this.datasource[this.currentIndex];
        this.showLoading();

        if (!data.type) {
            if (/\.(?:jpg|png|gif|jpeg|bmp)$/i.test(data.url)) {
                data.type = 'image';
            }
            else if (/\.swf$/i.test(data.url)) {
                data.type = 'flash';
            }
            else if (/\.(?:mp4|flv|mov|mkv|mpg|avi|rmvb|rm|ogg|wmv|mp3|wma|mid)$/i.test(data.url)) {
                data.type = 'video';
            }
        }
        this.preview(data);
    };

    /**
     * 显示加载状态
     *
     * @protected
     */
    exports.showLoading = function () {
        this.mediaContainer.innerHTML = lib.format(LOADING_TPL, this);
        this.dialog.show();
    };

    /**
     * 预览图片/视频
     * @param {Object} options 预览参数
     * @protected
     * @return {Object} 播控方法
     */
    exports.preview = function (options) {
        var html = NOT_SUPPORT_MESSAGE;
        if (options) {
            var type = options.type;
            options.id = options.id || 'preiew-' + Math.random();
            options.width = options.width || this.width;
            options.height = options.height || this.height;
            if (type === 'image') {
                this.previewImage(options);
                return;
            }
            if (type === 'flash') {
                html = getFlashHtml(options);
            }
            else if (type === 'video') {
                var url = options.url;
                if (/\.flv$/.test(url)) {
                    html = getFlvHtml(options);
                }
                else if (/\.mp4|\.mov/.test(url)) {
                    html = getVideoHtml(options);
                }
            }

            this.mediaContainer.innerHTML = html;
            this.dialog.show();

            return {
                play: function () {
                    var flvPlayer = swf.getMovie(options.id);
                    if (flvPlayer && flvPlayer.playVid) {
                        setTimeout(function () {
                            flvPlayer.playVid(options.url);
                        }, 0);
                    }
                },
                pause: function () {
                    var flvPlayer = swf.getMovie(options.id);
                    if (flvPlayer) {
                        flvPlayer.playVid('');
                    }
                }
            };
        }
    };

    /**
     * 预览图片
     * @param {Object} data 图片数据
     * @protected
     */
    exports.previewImage = function (data) {
        var me = this;
        var img = new Image();
        img.onload = function () {
            me.mediaContainer.innerHTML = '';
            me.mediaContainer.appendChild(img);
            me.dialog.show();
            img.onload = img.onerror = null;
        };

        img.onerror = function () {
            me.mediaContainer.innerHTML = lib.format(LOADED_FAILTURE_TPL, me);
            img.onload = img.onerror = null;
        };
        img.src = data.url;
    };

    /**
     * 显示下一个图片/视频
     *
     * @protected
     */
    exports.showNextMedia = function () {
        this.currentIndex = ++this.currentIndex % this.datasource.length;
        this.showMedia();
    };

    /**
     * 显示上一个图片/视频
     *
     * @protected
     */
    exports.showPreviousMedia = function () {
        this.currentIndex = (--this.currentIndex + this.datasource.length) % this.datasource.length;
        this.showMedia();
    };

    /**
     * 重渲染
     *
     * @method
     * @protected
     * @override
     */
    exports.repaint = require('esui/painters').createRepaint(
        Control.prototype.repaint,
        {
            name: ['title'],
            paint: function (control, title) {
                control.dialog.setTitle(title || '');
            }
        }
    );

    /**
     * 获取预览Flash
     * @param {Object} options flash数据
     * @private
     * @return {string}
     */
    function getFlashHtml(options) {
        return swf.createHTML({
            'id': options.id || 'preview-fla',
            'url': options.url,
            'width': options.width,
            'height': options.height,
            'wmode': 'transparent'
        });
    }

    /**
     * 获取预览视频
     * @param {Object} options flv数据
     * @private
     * @return {string}
     */
    function getFlvHtml(options) {
        return swf.createHTML({
            'id': options.id || 'preview-flv',
            'url': FLV_PLAYER,
            'width': options.width,
            'height': options.height,
            'wmode': 'transparent',
            'vars': 'play_url=' + options.url
        });
    }

    /**
     * 获取预览视频 - html5
     * @param {Object} options 视频数据
     * @private
     * @return {string}
     */
    function getVideoHtml(options) {
        return lib.format(VIDEO_TPL, {
            id: options.id || 'preview-video',
            title: options.title,
            src: options.url,
            width: options.width,
            height: options.height
        });
    }

    var LightBox = eoo.create(Control, exports);
    require('esui/main').register(LightBox);
    return LightBox;
});
