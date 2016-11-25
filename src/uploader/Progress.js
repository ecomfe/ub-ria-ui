/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 上传组合控件
 * @exports UploadProgress
 * @author weifeng(weifeng@baidu.com)
 */
define(
    function (require) {
        var $ = require('jquery');
        var lib = require('esui/lib');
        var u = require('underscore');
        var esui = require('esui');
        var Control = require('esui/Control');

        var STATES = {
            WAITING: 'waiting',
            UPLOADING: 'uploading',
            COMPLETE: 'complete',
            FAIL: 'fail'
        };

        /**
         * Progress
         *
         * @class Progress
         */
        var exports = {};

        exports.type = 'Progress';

        // 模板
        var template = [
            '<div class="${fileClass}">',
            '  <span class="${nameClass}" title="${fileName}">${fileName}</span>',
            '  <span class="${sizeClass}">${fileSize}</span>',
            '</div>',
            '<div class="${statusClass}">',
            '  <div class="${statusInfoClass}">',
            '    <div class="${barContainerClass}">',
            '      <div class="${barClass}" id="${barId}">点击开始</div>',
            '    </div>',
            '  </div>',
            '  <div class="${operationClass}">',
            '    <esui-button class="${startButtonClass} ui-button-link" data-ui-child-name="start">',
            '        开始',
            '    </esui-button>',
            '    <span class="${resultClass}" id="${resultId}"></span>',
            '    <esui-button class="${cancelButtonClass} ui-button-link" data-ui-child-name="cancel">',
            '        取消',
            '    </esui-button>',
            '  </div>',
            '</div>'
        ].join('');

        /**
         * @override
         */
        exports.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, this.$self.defaultProperties, options);

            this.setProperties(properties);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            this.main.innerHTML = this.getProgressHtml();
            this.helper.initChildren();
            // 是否展示进度详情
            this.addState(this.progressMode);

            if (this.file.message) {
                this.updateStatus(this.file.status, this.file.message);
            }

            setIEPreiviewImage.call(this);
        };

        /**
         * @override
         */
        exports.initEvents = function () {
            var startBtn = this.getChild('start');
            startBtn && startBtn.on(
                'click',
                function (e) {
                    this.fire('start');
                },
                this
            );

            var cancelBtn = this.getChild('cancel');
            cancelBtn && cancelBtn.on(
                'click',
                function (e) {
                    this.fire('cancel');
                },
                this
            );
        };

        /**
         * @override
         */
        exports.dispose = function () {
            if (this.helper.isInStage('DISPOSED')) {
                return;
            }
            // 移除dom
            var domId = this.main.id;
            lib.removeNode(domId);
            this.$super(arguments);
        };

        /**
         * 设置当前进度
         *
         * @param {number} total 总量
         * @param {number} loaded 已加载量
         * @public
         */
        exports.setProgressing = function (total, loaded) {
            if (this.status === 'server-error' || this.status === -1) {
                return;
            }
            if (this.progressMode === 'detail' && total !== 0) {
                this.updateStatus(STATES.UPLOADING, '');
                try {
                    var percent = (loaded / total * 100).toFixed(2) + '%';
                    $('#' + this.helper.getId('bar')).css('width', percent);
                }
                catch (e) {
                    // TODO
                }
            }
            else {
                this.updateStatus(STATES.UPLOADING, '正在上传中...');
            }
        };

        /**
         * 获取进度条html
         *
         * @param {string} progressTemplate 预留一个地方可以定制进度条信息
         * @return {string}
         * @public
         */
        exports.getProgressHtml = function (progressTemplate) {
            var file = this.file;
            if (!file) {
                return '';
            }
            progressTemplate = progressTemplate || this.template;

            // TODO 图片以及非图片类型区分
            var totalTemplate = getImageContainer.call(this) + lib.format(
                progressTemplate,
                {
                    fileName: file.name,
                    fileSize: file.size,
                    fileClass: this.helper.getPartClassName('file-info'),
                    nameClass: this.helper.getPartClassName('file-name'),
                    sizeClass: this.helper.getPartClassName('file-size'),
                    statusClass: this.helper.getPartClassName('status'),
                    statusInfoClass: this.helper.getPartClassName('status-info'),
                    operationClass: this.helper.getPartClassName('status-operation'),
                    startButtonClass: this.helper.getPartClassName('start'),
                    cancelButtonClass: this.helper.getPartClassName('cancel'),
                    restartButtonClass: this.helper.getPartClassName('restart'),
                    barContainerClass: this.helper.getPartClassName('bar-container'),
                    barClass: this.helper.getPartClassName('bar'),
                    barId: this.helper.getId('bar'),
                    resultClass: this.helper.getPartClassName('result'),
                    resultId: this.helper.getId('result')
                }
            );
            return totalTemplate;
        };

        /**
         * 更新进度条状态
         *
         * @param {string} status 状态
         * @param {string} message 可能的信息
         * @public
         */
        exports.updateStatus = function (status, message) {
            if (!status) {
                return;
            }
            u.each(STATES, function (state) {
                this.removeState(state);
            }, this);
            this.states = status;
            this.addState(status);
            var $result = $('#' + this.helper.getId('result'));
            if (status === STATES.FAIL) {
                $result.addClass('ui-text-danger');
            }
            else {
                $result.addClass('ui-text-success');
            }
            this.getChild('start').hide();
            $result.html(message);
        };

        /**
         * 渐变消失
         *
         * @param {number} delayTime 渐变时间
         * @param {Function} callback 消失后回调
         * @public
         */
        exports.fadeOut = function (delayTime, callback) {
            var me = this;
            $(this.main).fadeOut(
                delayTime,
                function () {
                    callback();
                    me.dispose();
                }
            );
        };

        function setIEPreiviewImage() {
            // 中低版本IE<=9
            if (navigator.appName === 'Microsoft Internet Explorer') {
                var imagePreview = lib.g(this.helper.getId('imageId'));
                try {
                    imagePreview.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = this.file.name;
                }
                catch (e) {
                    // console.log(e);
                }
            }
        }

        // 获取本地预览图片信息
        function getImageContainer() {
            // IE10+,以及chrome和FF
            var imageTemplate = lib.format([
                '<div class="${imageTemplateClass}">',
                    '<image id="${imageId}"/>',
                '</div>'
            ].join(''), {
                imageTemplateClass: this.helper.getPartClassName('image-template'),
                imageId: this.helper.getId('imageId')
            });
            var me = this;
            if (window.FileReader) {
                var pFReader = new window.FileReader();
                pFReader.onload = function (pFEvent) {
                    var imagePreview = lib.g(me.helper.getId('imageId'));
                    if (imagePreview) {
                        imagePreview.setAttribute('src', pFEvent.target.result);
                    }
                };
                pFReader.onloadstart = function (pFEvent) {
                    me.addState('preview-reading');
                };
                pFReader.onloadend = function (pFEvent) {
                    me.removeState('preview-reading');
                };
                pFReader.readAsDataURL(me.file.sourceFile);
            }

            return imageTemplate;
        }

        var Progress = require('eoo').create(Control, exports);

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Progress.defaultProperties = {
            template: template,
            total: 0,
            loaded: 0,
            progressMode: 'detail',
            states: STATES.WAITING
        };

        esui.register(Progress);

        return Progress;
    }
);
