/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 富上传组件集合
 * @exports Uploader
 * @author weifeng(weifeng@baidu.com)
 */

define(
    function (require) {
        require('esui/Button');
        require('esui/Link');
        require('./ProgressQueue');
        require('./FileInput');

        var eoo = require('eoo');
        var esui = require('esui');
        var ui = require('esui/main');
        var Control = require('esui/Control');
        var painters = require('esui/painters');

        var File = require('./File');

        var $ = require('jquery');
        var u = require('underscore');
        var lib = require('esui/lib');

        var NORMAL = 'normal';


        var supportXHR = (window.File && window.XMLHttpRequest);
        var supportXHR2 = (supportXHR && new window.XMLHttpRequest().upload);

        var defaultQueue = {
            // 所有文件队列
            queueList: [],
            // 队列中所有文件的大小
            queueSize: 0,
            // 正在上传的文件
            uploadingFiles: [],
            // 等待开始的文件
            waitingFiles: [],
            // 出错的文件
            failedFiles: [],
            // 遗弃的文件
            // 当文件过长时会遗弃多余的文件
            abandonedFiles: [],
            // 上传完成的文件
            completeFiles: []
        };

        // card视图下模板
        var cardTemplate = [
            '<div class="${fileClass}">',
            '  <span class="${nameClass}">${fileName}</span>',
            '  <span class="${sizeClass}">${fileSize}</span>',
            '</div>',
            '<div class="${statusClass}">',
            '  <div class="${statusInfoClass}">',
            '    <div class="${barContainerClass}">',
            '      <div class="${barClass}" id="${barId}">点击开始</div>',
            '    </div>',
            '    <div class="${resultClass}" id="${resultId}"></div>',
            '  </div>',
            '  <div class="${operationClass}">',
            '    <esui-button class="${startButtonClass} ui-button-link" data-ui-child-name="start">',
            '        开始',
            '    </esui-button>',
            '    <esui-button class="${cancelButtonClass} ui-button-info" data-ui-child-name="cancel">',
            '        取消',
            '    </esui-button>',
            '  </div>',
            '</div>'
        ].join('');

        // list视图下模板
        var listTemplate = [
            '<div class="${fileClass}">',
            '  <span class="${nameClass}">${fileName}</span>',
            '  <span class="${sizeClass}">${fileSize}</span>',
            '</div>',
            '<div class="${statusClass}">',
            '  <div class="${statusInfoClass}">',
            '    <div class="${barContainerClass}">',
            '      <div class="${barClass}" id="${barId}">0%</div>',
            '    </div>',
            '    <div class="${resultClass}" id="${resultId}"></div>',
            '  </div>',
            '  <div class="${operationClass}">',
            '    <esui-button class="${startButtonClass} ui-button-link" data-ui-child-name="start">',
            '        开始',
            '    </esui-button>',
            '    <esui-button class="${cancelButtonClass} ui-button-info" data-ui-child-name="cancel">',
            '        取消',
            '    </esui-button>',
            '  </div>',
            '</div>'
        ].join('');

        /**
         * 控件类
         *
         * 上传控件有如下结构特点：
         *
         * - 上传组件          (必须，至少一个)
         *   -- 文件上传控件
         * - 上传列表        (可选，可自定义容器)
         *   -- 由一个或多个进度条组件构成
         *
         * 上传控件有两种模式：
         *
         * - 单文件上传
         * - 多文件上传
         *
         * @class ui.Uploader
         * @extends esui.Control
         */
        var Uploader = eoo.create(
            Control,
            {

                /**
                 * 控件类型，始终为`"Uploader"`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'Uploader',

                /**
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        // 文件上传队列
                        queue: lib.deepClone(defaultQueue),
                    };
                    u.extend(properties, this.$self.defaultProperties, options);

                    var adaptProperties = ['sequentialUploads', 'multiple'];

                    u.each(
                        adaptProperties,
                        function (propertyName) {
                            if (properties[propertyName] === 'false') {
                                properties[propertyName] = false;
                            }
                        }
                    );

                    this.$super([properties]);
                },

                /**
                 * @override
                 */
                initStructure: function () {
                    // 
                    if (!this.mode) {
                        this.mode = 'all';
                    }
                    var containerHtml = getContainerHtml.call(this, this.mode);
                    this.main.innerHTML = lib.format(
                        containerHtml,
                        {
                            uploadComboxClass: this.helper.getPartClassName('combox'),
                            uploadComboxHeaderClass: this.helper.getPartClassName('combox-header'),
                            uploadComboxBodyClass: this.helper.getPartClassName('combox-body'),
                            accept: this.accept,
                            multiple: this.multiple,
                            text: this.text,
                            variants: this.buttonVariants || '',
                            paramKey: this.paramKey,
                            defaultProgressContainerId: this.helper.getId('default-progress-container'),
                            uploadComboxFooterClass: this.helper.getPartClassName('combox-footer'),
                            uploadComboxFooterId: this.helper.getId('combox-footer')
                        }
                    );

                    // 创建控件树
                    this.helper.initChildren();

                    // var tpl = [
                    //     '<div class="${uploadComboxClass}">',
                    //     // 上传input
                    //     '   <div data-ui-child-name="fileInput"',
                    //     '      data-ui="type:FileInput;accept:${accept};multiple:${multiple};name:${paramKey};"></div>',
                    //     // 伪装ge按钮
                    //     '   <div data-ui-child-name="submitButton" ',
                    //     '      data-ui="type:Button;">${text}</div>',
                    //     '</div>',
                    //     '<div id="${defaultProgressContainerId}"></div>'
                    // ].join('');
                    // this.main.innerHTML = lib.format(
                    //     tpl,
                    //     {
                    //         uploadComboxClass: this.helper.getPartClassName('combox'),
                    //         accept: this.accept,
                    //         multiple: this.multiple,
                    //         text: this.text,
                    //         variants: this.buttonVariants || '',
                    //         paramKey: this.paramKey,
                    //         defaultProgressContainerId: this.helper.getId('default-progress-container')
                    //     }
                    // );

                    // // 创建控件树
                    // this.helper.initChildren();

                    // if (this.showProgress) {
                    //     this.progressContainer = this.progressContainer || this.helper.getId('default-progress-container');
                    //     var container;
                    //     // 字符串处理
                    //     if (u.isString(this.progressContainer)) {
                    //         // 先作为DOM id寻找
                    //         container = $('#' + this.progressContainer);
                    //         // 如果没找到，找控件id
                    //         if (!container[0] && this.viewContext.get(this.progressContainer)) {
                    //             container = $(this.viewContext.get(this.progressContainer).main);
                    //         }
                    //     }
                    //     // 只能认为扔了个控件进来
                    //     else {
                    //         container = $(this.progressContainer.main);
                    //     }

                    //     if (!container[0]) {
                    //         return;
                    //     }

                    //     var progressContainer = $('<div></div>');

                    //     var options = {
                    //         main: progressContainer[0],
                    //         progressMode: this.singleProgressMode
                    //     };
                    //     // 如果不支持进度，那就强制不展示进度详情
                    //     if (!supportXHR) {
                    //          options.singleProgressMode = 'general';
                    //     }

                    // 创建主容器
                    if (this.mode !== NORMAL) {
                        var progressContainer = $('#' + this.helper.getId('default-progress-container'))[0];
                        var progressQueue = ui.create('ProgressQueue', {
                            main: progressContainer,
                            progressMode: this.mode,
                            progressTemplate: this.itemTemplate,
                            // TODO
                            showMode: 'card'
                        });

                        progressQueue.render();
                        this.progressQueue = progressQueue;
                    }
                },
                /**
                 * @override
                 */
                initEvents: function () {
                    // 伪装button的点击事件
                    var submitButton = this.getChild('submitButton');
                    submitButton.on(
                        'click',
                        function (e) {
                            fileInput.triggerUploadOutside();
                            e.preventDefault();
                        }
                    );

                    // 监听上传input的变化
                    var fileInput = this.getChild('fileInput');
                    fileInput.on('change', u.bind(inputChangeHandler, this));

                    var startAllBtn = this.getChild('startAll');
                    startAllBtn && startAllBtn.on('click', operationFileQueue, this);

                    var cancelAllBtn = this.getChild('cancelAll');
                    cancelAllBtn && cancelAllBtn.on('click', this.clear, this);

                    var cardTag = this.getChild('cardTag');
                    cardTag && cardTag.on('click', function () {
                        this.progressQueue.setProperties({
                            showMode: 'card'
                        });
                    }, this);

                    var listTag = this.getChild('listTag');
                     listTag && listTag.on('click', function () {
                        this.progressQueue.setProperties({
                            showMode: 'list'
                        });
                    }, this);

                    var progressQueue = this.progressQueue;
                    if (progressQueue) {
                        var me = this;

                        progressQueue.on('start', function (e) {
                            // 点击开始上传
                            chooseProgressFile.call(me, e.file, true);
                        });

                        progressQueue.on('restart', function (e) {
                            // 重新上传
                            var file = e.file;
                            e.target.dispose();
                            // 将文件移出上传队列，然后重新进行上传
                            removeFileFromUploading.call(me, file);
                            me.receiveFile([file]);
                        });

                        progressQueue.on('cancel', function (e) {
                            var file = e.file;
                            if (file.request) {
                                file.request.abort();
                                if (me.sequentialUploads) {
                                    operationFileQueue.call(me);
                                }
                            }
                            // 从等待队列中清除
                            removeFileFromWaiting.call(me, file);
                            e.target.removeProgress(file);
                        });

                        $(this.main).on('click', '.state-selector', {progressQueue: progressQueue}, switchProgressByState);
                    }
                },

                /**
                 * @override
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    {
                        name: ['text'],
                        paint: function (uploader, text) {
                            var button = uploader.getChild('submitButton');
                            button.setContent(text);
                        }
                    },
                    {
                        name: ['disabled', 'readOnly'],
                        paint: function (uploader, disabled, readOnly) {
                            var input = uploader.getChild('fileInput');
                            var button = uploader.getChild('submitButton');
                            input.setProperties({disabled: disabled});
                            input.setProperties({readOnly: readOnly});
                            button.setProperties({disabled: disabled});
                            button.setProperties({readOnly: readOnly});
                        }
                    },
                    painters.style('width')
                ),

                /**
                 * 接收文件并做上传前的校验
                 *
                 * @param {Array} files 接收到的文件，可以是input中取到的，也可以是drag外部传入的
                 * @public
                 */
                receiveFile: function (files) {
                    // TODO 注释掉的影响
                    // 如果仍然在uploading，则不执行新的上传操作
                    // if (this.stage === 'UPLOADING') {
                    //     return;
                    // }

                    var event = this.fire('beforeupload', {files: files});
                    if (event.isDefaultPrevented()) {
                        return;
                    }

                    this.doUpload(files);
                },

                /**
                 * 开始上传
                 *
                 * @param {Array} files 接收到的文件
                 * @protected
                 */
                doUpload: function (files) {
                    // 超出最大限制，直接返回
                    if (files.length > this.maxFileNumber) {
                        this.notifyFail(this.message.ERROR_FILE_MAX_NUMBER);
                        return;
                    }

                    files = u.map(
                        files,
                        function (file, index) {
                            // 文件格式检查
                            if (!checkFileFormat.call(this, file)) {
                                file.status = 'client-error';
                                file.message = this.message.ERROR_FILE_EXTENSIONS;
                            }
                            else if (!checkFileSize.call(this, file)) {
                                file.status = 'client-error';
                                file.message = this.message.ERROR_FILE_MAX_SIEZ;
                            }
                            else {
                                file.status = 'waiting';
                                // 单文件上传要覆盖之前的文件
                                if (this.multiple === false) {
                                    this.queue.waitingFiles = [file];
                                }
                                else {
                                    this.queue.waitingFiles.push(file);
                                }
                            }
                            return file;
                        },
                        this
                    );

                    initFileList.call(this, files);
                },

                /**
                 * 获取Uploader中的文件上传组件
                 *
                 * @return {DOMElement} 容器中FileInput组件
                 * @public
                 */
                getFileInput: function () {
                    return this.getChild('fileInput');
                },

                /**
                 * 解析返回中的错误 TODO 这个的具体解析格式要跟后端商定
                 *
                 * @param {Object} response 请求返回的对象
                 * @return {string}
                 * @protected
                 */
                parseError: function (response) {
                    if (response.success === 'false') {
                        return {message: response.error};
                    }

                    return null;
                },

                /**
                 * 通知上传失败
                 *
                 * @method ui.Uploader#notifyFail
                 * @param {string} message 失败消息
                 * @protected
                 */
                notifyFail: function (message) {
                    message = message || '上传失败';
                    this.fire('fail', {message: message});
                },

                /**
                 * 通知上传完成
                 *
                 * @protected
                 * @method ui.Uploader#notifyComplete
                 */
                notifyComplete: function () {
                    this.stage = 'COMPLETE';
                    this.fire('complete', {
                        completeFiles: this.queue.completeFiles,
                        failedFiles: this.queue.failedFiles
                    });
                },

                /**
                 * 通知上传完成
                 *
                 * @public
                 * @method ui.Uploader#notifyComplete
                 */
                clear: function () {
                    // 等待队列先置空
                    this.queue.waitingFiles = [];
                    // 上传队列中都取消
                    u.each(this.queue.uploadingFiles, function(file) {
                        if (file.request) {
                            file.request.abort();
                        }
                    }); 
                    this.progressQueue.clearAllProgress();
                    this.queue = lib.deepClone(defaultQueue);
                    this.stage = 'COMPLETE';
                    refreshStutas.call(this);
                }
            }
        );

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Uploader.defaultProperties = {
            // 上传按钮文本
            text: '点击上传',
            // 文件上传的路径
            action: '/uploadFile',
            // 后台接收时的key名
            paramKey: 'files',
            // 接收的文件类型
            accept: '.gif,.jpg,.png,.swf,.xlsx,.flv',
            // 默认为单文件上传控件
            // 单文件上传控件一次只能选择一个文件
            multiple: false,
            // 单个文件最大大小，单位B，默认2M
            maxFileSize: 2147483648,
            // 单次最大上传文件数量
            maxFileNumber: 20,
            // 多文件上传时，请求同时开始还是逐个开始
            sequentialUploads: false,
            // 提示信息
            // 目前支持提供成功提示，文件大小不符
            // 文件类型不匹配,
            message: {
                // 上传成功
                SUCCESS_INFO: '上传成功',
                // 重新上传
                RESTART_INFO: '正在重新上传',
                // http错误，一般来说就是status返回不是200
                ERROR_HTTP: '上传失败，网络连接错误或上传路径无效',
                // 文件类型错误
                ERROR_FILE_EXTENSIONS: '上传失败，安全因素不支持此类文件',
                // 文件超出最大尺寸, 标准浏览器下可以判断
                ERROR_FILE_MAX_SIEZ: '超出最大上传尺寸',
                // 文件数量超过最大限制了
                ERROR_FILE_MAX_NUMBER: '发生错误，上传文件超过限定。',
                // 格式错误
                ERROR_FILE_FORMAT: '文件格式错误'
            },
            // 是否显示进度
            showProgress: true,

            // removed
            // 进度模式，seperate和total两种，seperate代表每个文件独立进度；total代表所有文件统一计算进度
            // progressMode: 'seperate',
            // singleProgressMode: 'detail',

            // 文件列表的容器
            // 如果没有会添加一个默认容器
            progressContainer: null,
            // 是否自己开始
            autoStart: false,

            /**
             * @property {string} [mode="all"]
             *
             * 指定文本框模式，可以有以下值：
             *
             * - `normal`：表示仅仅只有一个上传按钮，不自带任何预览容器
             * - `card`：表示使用card视图进行显示
             * - `list`：表示使用list列表进行显示
             * - `all`: 表示使用card和list两种视图同时进行展示
             *
             * 此属性仅能在初始化时设置，运行期不能修改
             *
             */
             mode: 'all',
             // 容器模板,
             containerTemplate: '',
             itemTemplate: {
                // card视图下的item的展示模板
                card: cardTemplate,
                /**
                 * @property {string|Object} [itemTemplate.list=""]
                 *
                 * 指定文本框模式，可以有以下值：
                 *
                 * - string：表示仅仅只有一个上传按钮，不自带任何预览容器
                 * - Object：表示使用card视图进行显示
                 *     - header 表示list需要一个默认的title
                 *     - content 表示content的模板，一般指item的模板
                 *
                 * 此属性仅能在初始化时设置，运行期不能修改
                 *
                 */
                list: listTemplate
             },

             // 是否可拖拽
             dragable: true,
             // 是否分片
             chunk: true,
             // 默认4M
             chunkSize: 4194304
        };


        /**
         * 上传输入组件变化事件处理
         *
         * @param {mini-event.Event} e 事件对象
         */
        function inputChangeHandler(e) {
            var files = this.getFileInput().files;
            this.receiveFile(files);
        }

        /**
         * 验证文件格式
         *
         * @param {Object} file file对象
         * @return {boolean}
         * @protected
         */
        function checkFileFormat(file) {
            if (this.accept) {
                // 这里就是个内置的`Rule`，走的完全是标准的验证流程，
                // 主要问题是上传控件不能通过`getValue()`获得验证用的内容，
                // 因此把逻辑写在控件内部了
                var extension = file.name.split('.');
                extension = '.' + extension[extension.length - 1].toLowerCase();

                var isValid = false;
                if (typeof this.accept === 'string') {
                    this.accept = lib.splitTokenList(this.accept);
                }
                for (var i = 0; i < this.accept.length; i++) {
                    var acceptPattern = this.accept[i].toLowerCase();
                    if (acceptPattern === extension) {
                        isValid = true;
                        break;
                    }

                    // image/*之类的，表示一个大类
                    if (acceptPattern.slice(-1)[0] === '*') {
                        var mimeType = acceptPattern.split('/')[0];
                        var targetExtensions = this.mimeTypes[mimeType];
                        if (targetExtensions && targetExtensions.hasOwnProperty(extension)) {
                            isValid = true;
                            break;
                        }
                    }
                }

                return isValid;
            }

            return true;
        }

        /**
         * 验证文件大小
         *
         * @param {Object} file file对象
         * @return {boolean}
         * @protected
         */
        function checkFileSize(file) {
            // IE9中filechange返回的event只有fileName以及fileId
            // 所以如果出现这种情况就放过去，让后端做长度校验
            if (this.maxFileSize && file.originalSize) {
                var isValid = false;
                if (file.originalSize) {
                    isValid = parseInt(file.originalSize, 10) <= parseInt(this.maxFileSize, 10);
                }

                return isValid;
            }

            return true;
        }

        /**
         * 创建上传进度队列
         *
         * @param {Array} fileList 在队列中的文件
         */
        function initFileList(fileList) {
            if (this.mode === NORMAL) {
                // 不显示进度条的时候自动开始
                // TODO 流程
                operationFileQueue.call(this);
                return;
            }

            var files = fileList ? fileList : this.queue.waitingFiles;

            u.each(files, function (file, index) {
                this.progressQueue.addProgress(file);
                this.queue.queueList.push(file);
            }, this);

            refreshStutas.call(this);

        }

        /**
         * 执行上传队列
         *
         */
        function operationFileQueue() {
            // 当队列中
            if (this.queue.waitingFiles && this.queue.waitingFiles.length) {
                // 一个个上传
                if (this.sequentialUploads && this.queue.uploadingFiles.length < 1) {
                    chooseProgressFile.call(this);
                }
                else {
                    chooseProgressFile.call(this);
                    operationFileQueue.call(this);
                }
            }
            else if (this.queue.uploadingFiles.length === 0) {
                this.notifyComplete();
            }
        }

        /**
         * 选择一个文件上传
         *
         * @param {Object|undefined} file 待上传的文件
         */
        function chooseProgressFile(file, singleFlag) {
            // TODO上传中影响
            // this.stage = 'UPLOADING';
            if (!file) {
                file = this.queue.waitingFiles.shift();
            }
            else {
                this.queue.waitingFiles = u.filter(this.queue.waitingFiles, function (wFile) {
                    return file.id !== wFile.id
                });
            }
            // 等待队列中弹出
            // 进入上传队列
            this.queue.uploadingFiles.push(file);
            // 执行上传
            uploadFile.call(this, file, singleFlag);

            refreshStutas.call(this);

            if (!singleFlag && !this.sequentialUploads) {
                operationFileQueue.call(this);
            }
        }

        // function chunkFiles(file, singleFlag) {
        //     if (file.originalSize) {
        //         var chunkCount = Math.ceil(file.originalSize);
        //         if (chunkCount >= 2) {
        //             for (var i = 0; i < chunkCount; i++) {
        //                 var chunFile = 
        //             }
        //         }
        //         else {

        //         }
        //     }
        //     else {
        //         uploadFile.call(this, file, singleFlag);
        //     }
        // }

        /**
         * 上传文件
         *
         * @param {ui.File} file 目标文件
         * @param {boolean} singleFlag 是否是one by one上传
         */
        function uploadFile(file, singleFlag) {
            var me = this;

            // 创建请求
            var request = getHttpRequest.call(this);
            file.request = request;
            // 修改文件状态
            file.status = File.UPLOADING;

            // 创建一个符合后端接口的数据对象
            var sendFile = {};
            sendFile[this.paramKey] = file.sourceFile;

            request.send(
                {container: this.main},
                sendFile
            );

            // 正常模式中不包含以下功能
            if (this.mode !== NORMAL) {
                // 上传中
                request.on(
                    'progress',
                    function (response) {
                        var loaded = response.loaded;
                        var total = response.total;
                        me.progressQueue.setProgressDetail(file, total, loaded);
                    }
                );

                // 传输终止
                request.on(
                    'abort',
                    function (event) {
                        removeFileFromUploading.call(me, file, 'abort');
                        me.fire('abort', {file: file});
                    }
                );
            }

            // 上传完成
            request.on(
                'load',
                function (event) {
                    var response = event.target.response;

                    // 解析一些校验错误
                    var error = me.parseError(response);

                    if (error) {
                        me.fire('error', {file: file});
                        if (this.mode !== NORMAL) {
                            // 修改进度状态
                            me.progressQueue.notifyError({
                                file: file,
                                status: 'client-error',
                                message: error.message
                            });
                            me.removeFileFromUploading.call(me, file, 'error');
                            addToErrorQueue.call(me, file);
                        }
                        event.preventDefault();
                        return;
                    }

                    file.status = File.COMPLETE;

                    me.fire(
                        'onecomplete',
                        {
                            file: file,
                            data:response
                        }
                    );
                    if (this.mode !== NORMAL) {
                        // 修改进度状态
                        removeFileFromUploading.call(me, file, 'load');

                        if ((me.autoStart && me.sequentialUploads) || !singleFlag) {
                            operationFileQueue.call(me);
                        }
                        me.progressQueue.notifyError(file, 'complete', me.message.SUCCESS_INFO);
                        refreshStutas.call(me);
                    }

                }
            );

            // 上传出错
            request.on(
                'error',
                function (event) {
                    me.fire('error', {file: file});
                    if (this.mode !== NORMAL) {
                        // 修改进度状态
                        removeFileFromUploading.call(me, file, 'error');
                        me.progressQueue.notifyError(file, 'server-error', event.message || me.message.ERROR_HTTP);

                        addToErrorQueue.call(me, file);

                        if ((me.autoStart && me.sequentialUploads) || !singleFlag) {
                            operationFileQueue.call(me);
                        }
                    }
                }
            );
        }

        /**
         * 将文件移出等待队列
         *
         * @param {ui.File} file 目标文件
         */
        function removeFileFromWaiting(file) {
            var queue = this.queue.waitingQueue;
            this.queue.waitingQueue = u.without(queue, file);
        }

        /**
         * 需要添加的错误文件
         *
         * @param {ui.File} file 目标文件
         */
        function addToErrorQueue(file) {
            var sameFile = u.filter(this.queue.failedFiles, function (rawFile) {
                return rawFile.id === file.id;
            });
            sameFile ? '' : this.queue.failedFiles.push(file);
        }

        /**
         * 将文件移出上传队列并放入完成队列
         *
         * @param {ui.File} file 目标文件
         * @param {string} operation 操作
         * [operation = 'load'] 将该操作放入到完成队列当中
         * [operation = 'error'] 将该操作放入到错误队列当中
         */
        function removeFileFromUploading(file, operation) {
            var queue = this.queue.uploadingFiles;
            file = u.find(
                queue,
                function (rawFile) {
                    return rawFile.id === file.id;
                }
            );
            this.queue.uploadingFiles = u.without(queue, file);

            // 放入到完成队列当中
            if ('load' === operation) {
                var completeFiles = this.queue.completeFiles;
                var sameFile = u.filter(completeFiles, function (rawFile) {
                    return rawFile.id === file.id;
                });
                sameFile.length ? '' : completeFiles.push(file);
            }
        }

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

            var httpInstance = new HTTPRequest('POST', this.action);
            return httpInstance;
        }

        /**
         * 获取容器的string
         *
         * @param {string} uploaderMode 当前的视图模式
         * @return {string}
         */
        function getContainerHtml(uploaderMode) {
            switch(uploaderMode) {
                case NORMAL:
                    return getNormalTemplate.call(this);
                default:
                    return getContainerTemplate.call(this);
            }
        }

        function getNormalTemplate() {
            if (this.containerTemplate) {
                return this.containerTemplate;
            }
            var tpl = [
                '<div class="${uploadComboxClass}">',
                // 上传input
                '   <div data-ui-child-name="fileInput"',
                '      data-ui="type:FileInput;accept:${accept};multiple:${multiple};name:${paramKey};"></div>',
                // 伪装ge按钮
                '   <div data-ui-child-name="submitButton" ',
                '      data-ui="type:Button;">${text}</div>',
                '</div>',
            ].join('');
            return tpl;
        }

        function getContainerTemplate() {
            var tpl = [
                '<div class="${uploadComboxClass}">',
                '   <div class="${uploadComboxHeaderClass}">',
                '       <div data-ui-child-name="fileInput"', // 上传input
                '       data-ui="type:FileInput;accept:${accept};multiple:${multiple};name:${paramKey};"></div>',
                '       <esui-button data-ui-child-name="submitButton">', // 伪装ge按钮
                '       ${text}',
                '       </esui-button>',
                '       <esui-button data-ui-child-name="startAll">',
                '       全部开始',
                '       </esui-button>',
                '       <esui-button data-ui-child-name="cancelAll">',
                '       全部取消',
                '       </esui-button>',
                    // TODO CSS
                    this.mode === 'all' 
                    ? '<div style="float:right;">'
                    + '<a id="tag-list" data-ui="type:Link;childName:cardTag;href:javascript:void(0);">Card'
                    + '</a><a id="tag-card" data-ui="type:Link;childName:listTag;href:javascript:void(0);">List</a></div>' : '',
                '   </div>',
                '   <div class="${uploadComboxBodyClass}">',
                '       <div id="${defaultProgressContainerId}"></div>',
                '   </div>',
                '   <div class="${uploadComboxFooterClass}" id="${uploadComboxFooterId}">',
                    getStatusOperationsHtml.call(this),
                '   </div>',
                '</div>'
            ].join('');

            return tpl;
        }

        // 获取四种操作结构
        function getStatusOperationsHtml() {
            // 完成，上传中，等待中，出错
            var statusTpl = [
                '<div>',
                '   <button type="button" data-state="complete" class="state-selector ui-button ui-button-success ui-button-circular">完成: ${completeFiles}个</button>',
                '   <button type="button" data-state="uploading" class="state-selector ui-button ui-button-info ui-button-circular">上传中: ${uploadingFiles}个</button>',
                '   <span style="float:right;">总个数：${totalCount}</span>',
                '</div>',
                '<div>',
                '   <button type="button" data-state="waiting" class="state-selector ui-button ui-button-warning ui-button-circular">等待中: ${waitingFiles}个</button>',
                '   <button type="button" data-state="fail" class="state-selector ui-button ui-button-circular ui-button-circular">出错: ${failedFiles}个</button>',
                '   <span style="float:right;">总大小：${totalSize}</span>',
                '</div>',
            ].join('');

            return lib.format(statusTpl, {
                completeFiles: this.queue.completeFiles.length,
                uploadingFiles: this.queue.uploadingFiles.length,
                waitingFiles: this.queue.waitingFiles.length,
                failedFiles: this.queue.failedFiles.length,
                totalCount: this.queue.queueList.length,
                totalSize: this.queue.queueSize
            });
        }

        function refreshStutas() {
            $('#' + this.helper.getId('combox-footer')).html(getStatusOperationsHtml.call(this));
        }

        function switchProgressByState(e) {
            var $this = $(this);
            var progressQueue = e.data.progressQueue;
            var state = $this.data('state');
            $('.state-selector').not($this).removeClass('state-selector-active');
            $this.toggleClass('state-selector-active');
            progressQueue.showSelectPrgress($this.hasClass('state-selector-active') ? state : 'all');
        }

        esui.register(Uploader);
        return Uploader;
    }
);
