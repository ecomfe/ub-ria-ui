/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file image、flash列表，可选中、下载图标、删除图标
 * @author hongfeng (homfen@outlook.com)
 */

define(
    function (require) {
        // 模板
        var imagePanelTpl = ''
            + '<!-- if: ${datasource.length} === 0 -->'
            + '<div class="${classPrefix}-image-noneTip">${noneTip}<\/div>'
            + '<!-- else -->'
            + ''
            + '<!-- for: ${datasource} as ${image}, ${index} -->'
            + '<!-- if: ${index} % ${column} === 0 -->'
            + '<div class="${classPrefix}-image-row">'
            + '<!-- \/if -->'
            + ''
            + '    <div class="${classPrefix}-image-item" data="${image.imageId}" style="width:${imageWidth}px;">'
            + ''
            + '    <!-- if: ${imageId} == ${image.imageId} -->'
            + '        <div class="${classPrefix}-image-wrapper ${classPrefix}-selected">'
            + '        <!-- else -->'
            + '        <div class="${classPrefix}-image-wrapper">'
            + '        <!-- \/if -->'
            + ''
            + '            <!-- if: ${image.imageType} !== "flash" -->'
            + '            <img class="${classPrefix}-image" src="${image.imageUrl}" alt="" data="${image.imageId}"'
            + ' data-type="${image.imageType}">'
            + '            <!-- else -->'
            + '            <embed class="${classPrefix}-image" name="${image.flashName}" errormessage="${image.erro'
            + 'rMessage}" wmode="transparent" ver="9.0.0" align="middle" valign="middle" movie="${image.imageUrl}" '
            + 'src="${image.imageUrl}" data="${image.imageId}" data-type="${image.imageType}">'
            + '            <!-- \/if -->'
            + ''
            + '            <div class="${classPrefix}-image-operates">'
            + '                <!-- if: !${image.noOperate} && ${operates.length} -->'
            + '                <!-- for: ${operates} as ${operate} -->'
            + '                <span data-name="${operate.name}" title="${operate.title || operate.name}" class="${'
            + 'classPrefix}-image-operate ${iconPrefix}-${operate.name}"><\/span>'
            + '                <!-- \/for -->'
            + '                <!-- \/if -->'
            + '            <\/div>'
            + ''
            + '            <!-- if: ${canSelect} -->'
            + '            <span class="${classPrefix}-image-check ${iconPrefix}-check"><\/span>'
            + '            <!-- \/if -->'
            + ''
            + '        <\/div>'
            + ''
            + '        <!-- if: ${needDesc} -->'
            + '        <div class="${classPrefix}-caption-wrapper">'
            + '            ${imageCaptionTpl}'
            + '        <\/div>'
            + '        <!-- \/if -->'
            + '    <\/div>'
            + ''
            + '<!-- if: ${index} % ${column} === ${column}-1 || ${index} === ${datasource.length}-1 -->'
            + '<\/div>'
            + '<!-- \/if -->'
            + '<!-- \/for -->'
            + ''
            + '<!-- \/if -->';

        var u = require('underscore');
        var $ = require('jquery');
        var esui = require('esui');
        var eoo = require('eoo');
        var etpl = require('etpl');
        var painters = require('esui/painters');
        var InputControl = require('esui/InputControl');

        var ImagePanel = eoo.create(
            InputControl,
            {

                /**
                 * 控件类型，始终为 `ImagePanel`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'ImagePanel',

                /**
                 * 初始化参数
                 *
                 * @param {Object} options 参数对象
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        needDesc: true,                                 // 是否需要显示图标描述信息
                        canSelect: true,                                // 能否选中
                        operates: [],                                   // 右上角的操作按钮
                        imageWidth: 60,                                  // 图标长
                        column: 5,                                      // 每行image数
                        datasource: [],                                 // 数据源
                        imageId: 0,                                      // 默认选中的图标ID
                        noneTip: '抱歉，暂时还没有符合条件的图标',      // 没有数据时显示的tip
                        itemCaptionTpl: null                            // 自定义描述，可以为"#"开头的id，或模板string
                    };

                    u.extend(properties, options);
                    this.setProperties(properties);
                },

                /**
                 * 初始化控件结构
                 *
                 * @override
                 */
                initStructure: function () {
                    refresh.call(this);
                },

                /**
                 * 绑定事件
                 *
                 * @override
                 */
                initEvents: function () {
                    // 图标区域点击事件派发
                    var selector = '.' + this.helper.getPrimaryClassName('image-operates');
                    this.helper.addDOMEvent(this.main, 'click', selector, u.bind(imageClickDispater, this));
                },

                /**
                 * 重新给datasource赋值，并重绘控件
                 *
                 * @param {Array} [datasource] 传入datasource
                 */
                setDatasource: function (datasource) {
                    this.setProperties({datasource: u.clone(datasource)});
                },

                /**
                 * 重渲染
                 *
                 * @method
                 * @protected
                 * @override
                 */
                repaint: painters.createRepaint(
                    InputControl.prototype.repaint,
                    {
                        name: 'datasource',
                        paint: function (panel, datasource) {
                            panel.rawValue = null;
                            refresh.call(panel);
                        }
                    }
                )
            }
        );

        /**
         * 编译自定义描述模板
         *
         * @return {string} html
         */
        function getCaptionTpl() {
            var html = '';
            var desc = this.itemCaptionTpl;
            if (desc) {
                if (desc.charAt(0) === '#') {
                    html += $(desc).html();
                }
                else {
                    html += desc;
                }
            }
            else {
                html += ''
                    + '<!-- for: ${image.desc} as ${desc} -->'
                    + '    <p>${desc}<\/p>'
                    + '<!-- \/for -->';
            }
            return html;
        }

        /**
         * 刷新图标列表
         */
        function refresh() {
            var keys = [
                'needDesc',
                'canSelect',
                'operates',
                'imageWidth',
                'column',
                'datasource',
                'imageId',
                'noneTip'
            ];
            var data = u.pick(this, keys);

            data.iconPrefix = this.helper.getIconClass();
            data.classPrefix = this.helper.getPrimaryClassName();

            if (!this.imagePanelRender) {
                var tpl = imagePanelTpl.replace('${imageCaptionTpl}', getCaptionTpl.call(this));
                this.imagePanelRender = etpl.compile(tpl);
            }

            this.main.innerHTML = this.imagePanelRender(data);
        }

        /**
         * 图标区域点击事件派发
         *
         * @param {Event} e 点击事件
         * @event
         */
        function imageClickDispater(e) {
            var control = this;
            var target = $(e.target);
            var targetParent = target.parent();
            var operate = target.data('name');
            var helper = this.helper;

            if (!operate) {
                operate = 'select';
            }
            targetParent = target.parents('.' + helper.getPrimaryClassName('image-wrapper'));
            target = targetParent.find('.' + helper.getPrimaryClassName('image'));

            // 已选择，直接return
            var selectedClass = helper.getPrimaryClassName('selected');
            if (operate === 'select' && targetParent.hasClass(selectedClass)) {
                return;
            }
            // 勾选
            var main = $(control.main);
            main.find('.' + selectedClass).removeClass(selectedClass);
            targetParent.addClass(selectedClass);

            var imageType = target.data('type') || 'image';
            var imageId = target.attr('data');
            var imageUrl = target.attr('src');

            control.rawValue = {
                imageType: imageType,
                imageId: imageId,
                imageUrl: imageUrl
            };

            // 触发事件
            control.fire('imageclick', {
                operate: operate,
                imageType: imageType,
                imageId: imageId,
                imageUrl: imageUrl
            });
        }

        esui.register(ImagePanel);

        return ImagePanel;
    }
);
