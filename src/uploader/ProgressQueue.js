/**
 * UB-RIA-UI 1.0
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file 进度管理器，管理进度条列表
 * @exports ProgressQueue
 * @author weifeng(weifeng@baidu.com)
 */
define(
    function (require) {
        var Progress = require('./Progress');
        require('esui/Button');
        require('esui/Panel');
        var $ = require('jquery');
        var lib = require('esui/lib');
        var u = require('underscore');

        var esui = require('esui');
        var ui = require('esui/main');
        var Control = require('esui/Control');
        var painters = require('esui/painters');

        /**
         * Progress
         *
         * @class Progress
         */
        var exports = {};

        exports.type = 'ProgressQueue';

        /**
         * @override
         */
        exports.initOptions = function (options) {
            var properties = {
                progressMode: 'all',
                progressTemplate: '',
                showMode: 'card'
            };
            lib.extend(properties, options);

            this.setProperties(properties);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            if (this.progressMode === 'list' || this.progressMode === 'all') {
                var listChildName = 'list-panel'
                var listPanel = esui.create('Panel', {
                    childName: listChildName,
                    states: this.progressMode === 'all' ? 'hidden' : 'show'
                });
                listPanel.appendTo(this);
                this.addChild(listPanel, listChildName);
            }

            if (this.progressMode === 'card' || this.progressMode === 'all') {
                var cardChildName = 'card-panel';
                var cardPanel = esui.create('Panel', {
                    childName: cardChildName,
                    states: this.progressMode === 'all' ? 'hidden' : 'show'
                });
                cardPanel.appendTo(this);
                this.addChild(cardPanel, cardChildName);
            }
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
         * 获取进度条管理器模板
         *
         * @param {string} template 预留一个地方可以定制进度条信息
         * @return {string}
         * @public
         */
        exports.getProgressQueueHtml = function (template) {
            var template = template || this.template;

            var totalTemplate = lib.format(
                template,
                {
                    ProgressQueue: this.helper.getPartClassName('progress-queue'),
                    ProgressQueueHeaderClass: this.helper.getPartClassName('progress-queue-header'),
                    ProgressQueueListClass: this.helper.getPartClassName('progress-queue-list'),
                    ProgressQueueListId: this.helper.getId('progress-queue-id'),
                    ProgressQueueFooterClass: this.helper.getPartClassName('progress-queue-footer')
                }
            );
            return totalTemplate;
        };

        /**
         * 添加进度条
         *
         * @param {Object} file 基于文件信息生成进度条
         * @public
         */
        exports.addProgress = function (file) {
            if (!file) {
                return;
            }

            if (this.progressMode === 'list' || this.progressMode === 'all') {
                var listPanel = this.getChild('list-panel');
                var listProgress = createProgress.call(this, 'list', file);
                listProgress.appendTo(listPanel);
                // 代理所有子控件事件
                listProgress.on('*', delegateControlEvent, this);
                this.addChild(listProgress, listProgress.childName);
            }

            if (this.progressMode === 'card' || this.progressMode === 'all') {
                var cardPanel = this.getChild('card-panel');
                var cardProgress = createProgress.call(this, 'card', file);
                cardProgress.appendTo(cardPanel);
                // 代理所有子控件事件
                cardProgress.on('*', delegateControlEvent, this);
                this.addChild(cardProgress, cardProgress.childName);
            }
        };

        /**
         * 移除进度条
         *
         * @param {Object} file 需要删除的进度条
         * @public
         */
        exports.removeProgress = function (file) {
            var progress = this.getChild('progress-' + file.id)
            this.removeChild(progress);
            progress.dispose();
        };

        /**
         * 设置进度条详情
         *
         * @param {string} template 预留一个地方可以定制进度条信息
         * @public
         */
        exports.setProgressDetail = function (file, total, loaded) {
            var progresses = this.getProgresses(file);
            u.chain(progresses).invoke('setProgressing', total, loaded);
        };

        exports.notifyError = function (file, status, message) {
            var progresses = this.getProgresses(file);
            u.chain(progresses).invoke('updateStatus', status, message);
        };

        exports.notifyComplete = function (file) {
            var progresses = this.getProgresses(file);
            u.chain(progresses).invoke('updateStatus');
        }

        exports.getProgresses = function (file) {
            var fileId = file.id;
            return u.compact([
                this.getChild('progress-list-' + fileId),
                this.getChild('progress-card-' + fileId)
            ]);
        };

        exports.clearAllProgress = function () {
            u.chain(this.children)
            .filter(function (control) {
                return control.childName && control.childName.indexOf('progress-') > -1;
            })
            .compact()
            .invoke('dispose');
        };

        /**
         * 切换显示的容器，只有在all(双容器)下才能使用
         *
         * @param {mini-event.Event} e 事件对象
         */
        exports.toggleMode = function (mode) {
            if (this.progressMode === 'all') {
                var modePanel = mode + '-panel';
                var oppositeMode = getOppositeMode(mode) + '-panel';
                this.getChild(modePanel) && this.getChild(modePanel).show();
                this.getChild(oppositeMode) && this.getChild(oppositeMode).hide();
            }
        };

        /**
         * 切换当前容器内的panel
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        exports.repaint = painters.createRepaint(
            Control.prototype.repaint,
            {
                name: ['showMode'],
                paint: function (progressQueue, mode) {
                    progressQueue.toggleMode(mode);
                }
            }
        );


        /**
         * 代理子control的事件
         *
         * @param {mini-event.Event} e 事件对象
         */
        function delegateControlEvent(e) {
            var event = require('mini-event').fromEvent(e, { preserveData: true, syncState: true });
            event.file = e.target.file;
            this.fire(event);
        };

        /**
         * 新建进度条
         *
         * @param {string} type 新建的类型
         * @param {Object} file 传递的文件对象
         * @return {Control} 进度条实例
         */
        function createProgress(type, file) {
            var childName = ['progress', type, file.id].join('-');
            var template = this.progressTemplate[type];
            if (!template) {
                template = this.progressTemplate.list || this.progressTemplate.card;
            }
            return esui.create('Progress', {
                childName: childName,
                file: file,
                template: template,
                variants: type
            });
        };

        function getOppositeMode(mode) {
            return mode === 'list' ? 'card' : 'list';
        };

        /**
         * 显示或者取消指定状态的进度条
         *
         * @param {string} state 需要显示的状态
         * @public
         */
        exports.showSelectPrgress = function (state) {
            var progressClass = [
                esui.getConfig('uiClassPrefix'),
                'progress'
            ].join('-');
            var $main = $(this.main);
            if ('all' === state) {
                $main.find('.' + progressClass).show();
            }
            else {
                $main.find('.' + progressClass).hide();
                $main.find('.' + esui.getConfig('stateClassPrefix') + '-' + state).show();
            }
        };

        var ProgressQueue = require('eoo').create(Control, exports);

        esui.register(ProgressQueue);

        return ProgressQueue;
    }
);
