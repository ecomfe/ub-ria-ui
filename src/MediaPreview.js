/**
 * 图片,Flash和视频的预览控件
 * @file MediaPreview.js
 * @author chuzhenyang(chuzhenyang@baidu.com)
 */

define(function (require) {
    var u = require('underscore');
    var esui = require('esui');
    var lib = require('esui/lib');
    var Control = require('esui/Control');
    var eoo = require('eoo');
    var $ = require('jquery');
    var painters = require('esui/painters');
    var PreviewHelper = require('./helper/PreviewHelper');

    /**
     * 图片,视频和Flash预览控件
     *
     * 显示图片,视频和Flash资源,并提供配置
     *
     * @extends {Control}
     * @param {Object} options 初始化参数
     * @constructor
     */
    var MediaPreview = eoo.create(
        Control,
        {
            /**
             * 控件类型,始终为`"MediaPreview"`
             *
             * @type {string}
             * @readonly
             * @override
             */
            type: 'MediaPreview',

            /**
             * 初始化参数
             *
             * 对于图片资源,显示的宽度为容器宽度
             * 而高度是默认高度,最大高度为容器高度
             *
             * @param {Object} [options] 构造函数传入的参数
             * @protected
             * @override
             */
            initOptions: function (options) {
                var properties = {
                    /**
                     * @property {number} [width=300]
                     *
                     * 默认宽度
                     */
                    width: 300,
                    /**
                     * @property {number} [width=500]
                     *
                     * 默认高度
                     */
                    height: 500,
                    /**
                     * @property {String} [toolClass='']
                     *
                     * 要设置的工具图标的class名称,要以','分隔,用来标识点击了那个工具icon
                     */
                    toolClass: '',
                    /**
                     * @property {String} [sourceUrl='']
                     *
                     * 资源路径
                     */
                    sourceUrl: '',
                    /**
                     * @property {String} [sourceType='']
                     *
                     * 资源的类别,共支持以下四种类型
                     * 1.image: 图片类型
                     * 2.flash: 带有'swf'后缀名的flash文件
                     * 3.flv: 带有'flv'后缀名的视频文件
                     * 4.video: 带有'mp4|mov|mkv|mpg|avi|rmvb|rm|ogg|wmv|mp3|wma|mid'后缀名的文件
                     */
                    sourceType: ''
                };

                u.extend(properties, MediaPreview.defaultProperties, options);

                this.setProperties(properties);
            },

            /**
             * 初始化DOM结构
             *
             * @protected
             * @override
             */
            initStructure: function () {
                var helper = this.helper;

                var tpl = [
                    '<div id="${containerId}" class="${containerClass}">',
                        '<div id="${bodyId}" class="${bodyClass}"></div>',
                        '<div id="${toolId}" class="${toolClass}"></div>',
                    '</div>'
                ].join('');

                var mainElement = this.main;

                mainElement.innerHTML = lib.format(
                    tpl,
                    {
                        containerId: helper.getId('container'),
                        containerClass: helper.getPartClasses('container'),
                        bodyId: helper.getId('body'),
                        bodyClass: helper.getPartClasses('body'),
                        toolId: helper.getId('tool'),
                        toolClass: helper.getPartClasses('tool')
                    }
                );
            },

            /**
             * 重渲染
             *
             * @method
             * @protected
             * @override
             */
            repaint: painters.createRepaint(
                Control.prototype.repaint,
                /**
                 * @property {String} sourceUrl
                 * @property {String} sourceType
                 *
                 * 资源的路径以及type
                 */
                {
                    name: ['sourceUrl', 'sourceType'],
                    paint: function (mediaPreview, sourceUrl, sourceType) {
                        initBody.call(mediaPreview);
                    }
                },
                /**
                 * @property {String} toolClass
                 *
                 * 工具栏工具的class,以','分隔,用来标志工具icon
                 */
                {
                    name: ['toolClass'],
                    paint: function (mediaPreview, toolClass) {
                        initToolBar.call(mediaPreview);
                    }
                },
                /**
                 * @property {number} width
                 * @property {number} height
                 *
                 * 文本框的宽度及高度
                 */
                {
                    name: ['width', 'height'],
                    paint: function (mediaPreview, width, height) {
                        $(mediaPreview.main).width(width).height(height);
                    }
                }
            ),

            /**
             * 初始化事件交互
             *
             * @protected
             * @override
             */
            initEvents: function () {
                var me = this;

                // 为所有的具有'data-role="tool"'属性的span节点添加点击事件
                // 并在该控件上fire一个'iconclick'的事件,参数是点击的span的class
                this.helper.addDOMEvent(
                    this.helper.getPart('tool'),
                    'click',
                    '[data-role="tool"]',
                    function (event) {
                        var toolNode = event.target;
                        me.fire('iconclick', {iconClass: $(toolNode).attr('class')});
                    }
                );
            }
        }
    );

    /**
     * 默认属性值
     *
     * @type {Object}
     * @public
     */
    MediaPreview.defaultProperties = {
        errorHtml: '无法预览该内容！'
    };

    /**
     * 构造预览资源的html结构
     *
     * @ignore
     */
    function initBody() {
        var bodyElement = $(this.main).find('#' + this.helper.getId('body'));
        var errorTpl = '<p class="${errorClass}">' + this.errorHtml + '</p>';

        var width = this.width;
        var height = this.height;
        if (this.sourceType === 'image') {
            width = '100%';
            height = 'auto';
        }
        var html = PreviewHelper.preview({
            width: width,
            height: height,
            url: this.sourceUrl,
            type: this.sourceType
        });

        // 如果PreviewHelper中无法将其渲染出来,这里要现实一个错误的模版
        if (!html) {
            html = lib.format(
                errorTpl,
                {
                    errorClass: this.helper.getPartClasses('error')
                }
            );
        }
        bodyElement.html(html);
    }

    /**
     * 构造工具栏的html结构
     *
     * @ignore
     */
    function initToolBar() {
        var toolClass = this.toolClass;
        var helper = this.helper;
        var toolTpl = '<span data-role="tool" class="${toolClass}"></span>';
        if (!toolClass) {
            return;
        }

        var mainElement = this.main;
        u.each(toolClass.split(','), function (className) {
            $(mainElement).find('#' + helper.getId('tool')).append(lib.format(
                toolTpl,
                {
                    toolClass: className
                }
            ));
        });
    }

    esui.register(MediaPreview);
    return MediaPreview;
});
