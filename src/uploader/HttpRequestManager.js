/**
 * UB-RIA-UI 1.0
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file HttpRequestManager request调度类，在此文件中屏蔽掉浏览器请求的差异性
 * @author weifeng(weifeng@baidu.com)
 */

define(
    function (require) {
        var u = require('underscore');

        var supportXHR = (window.File && window.XMLHttpRequest);
        var supportXHR2 = (supportXHR && new window.XMLHttpRequest().upload);

        /**
         * HttpRequestManager
         *
         * @class ui.HttpRequestManager
         * @extends ui.HttpRequestManager
         */
        var exports = {};

        /**
         * @override
         */
        exports.constructor = function (file, chunkSize, action) {
            this.file = file;
            this.chunkSize = chunkSize || 0;
            this.action = action;
            this.chunkList = [];
            this.requests = [];
        }

        /**
         * @override
         */
        exports.send = function (options, data) {
            var request = getHttpRequest();
            request.send(this.action, 'POST');
        };

        /**
         * @override
         */
        exports.abort = function () {
            this.$super(arguments);

            if (this.xhr && this.xhr.abort) {
                this.xhr.abort();
            }
        };

        /**
         * 获取合适的HttpRequest，用于文件上传
         * 目前实现了Leve1 XHR、Level2 XHR以及iframe的封装
         *
         * @return {ui.HttpRequest}
         */
        function getHttpRequest() {
            var HTTPRequest;

            if (supportXHR2) {
                HTTPRequest = require('./L2XMLHttpRequest');
            }
            else if (supportXHR) {
                HTTPRequest = require('./XMLHttpRequest');
            }
            else {
                HTTPRequest = require('./IframeHttpRequest');
            }

            return HTTPRequest;
        }

        /**
         * 按照固定长度切分文件
         *
         * @param {number} chunkSize 文件切分的尺寸
         * @return {Object} 切分后的文件
         */
        function splitFile(file, chunkSize) {
            var fileObj = {};
            if (chunkSize > 0 && file.originalSize > chunkSize) {

            }
            else {
                var request = new HttpRequest();
            }
        }

        /**
         * 代理子实例的事件到当前容器上面
         *
         * @param {mini-event.Event} e 事件对象
         */
        function delegateControlEvent(e) {
            var event = require('mini-event').fromEvent(e, {
                preserveData: true,
                syncState: true
            });
            event.file = e.target.file;
            this.fire(event);
        }

        var HttpRequestManager = require('eoo').create(exports);

        return HttpRequestManager;
    }
);
