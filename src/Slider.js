/**
 * @file 滑动杆控件
 * @author liyuqiang(liyuqiang@baidu.com)
 */

define(
    function (require) {
        require('esui/Panel');
        require('esui/TextBox');
        require('esui/Select');

        // 注册验证类
        require('esui/validator/RequiredRule');
        require('esui/validator/MaxRule');
        require('esui/validator/MinRule');
        require('esui/validator/PatternRule');

        var esui = require('esui');
        var lib = require('esui/lib');
        var InputControl = require('esui/InputControl');

        var exports = {};

        /**
         * 控件的类型
         * @override
         * @type {String}
         */
        exports.type = 'Slider';

        /**
         * 参数的初始化
         * @protected
         * @override
         * @param  {Object} options [初始化的参数]
         */
        exports.initOptions = function (options) {
            /**
             * 默认的属性
             * @type {Object}
             * @type {string} defaults.orientation 滑块的形式 横着为'' 竖着为’vertical‘
             * @type {number} defaults.start 起始值 默认是0
             * @type {number} defaults.end 结束值 默认是10,
             * @type {number} defaults.step 滑动杆值的步长默认是1
             * @type {number | Arrary} defaults.value 滑动杆的值 默认为min或[min, max]
             * @type {number} defaults.min 最小值 不能小于start, 无值时与start相同
             * @type {number} defaults.max 最大值 不能大于end,无值时与end相同
             * @type {string} defaults.unitText 滑动杆内数值后面的单位
             * @type {boolean} defaults.isShowSelectedBG 滑杆已选择的部分是否加背景色显示 显示true 不显示false 默认true
             * @type {boolean} defaults.isHasHead 是否显示标题和头部 显示true 不显示false
             * @type {string} defaults.title 滑动杆的头部标题
             * @type {string} defaults.headType 默认label 还可以是textbox、select
             * @type {string} defaults.pattern 文本框时验证的正则表达式
             * @type {string} defaults.errorMessage 正则验证错误时的提示信息
             * @type {Array} defaults.datasource 下拉框时的数据源
             * @type {boolean} defaults.isHasFoot 是否有脚 有true 无false 默认false
             * @type {number} defaults.footStep 显示角标的间隔 默认为2
             * @type {Number} defaults.footLiWidth 每个角标的宽度
             * @type {boolean} defaults.range 滑动杆控件是否是选择区间 默认false 是true
             */
            var defaults = {
                orientation: '',
                start: 0,
                end: 10,
                step: 1,

                unitText: '',
                isShowSelectedBG: true,

                isHasHead: false,
                title: '标题',
                headType: 'label',
                pattern: '^-?[1-9]\d*|0$',
                errorMessgae: '输入的值必须为数字',
                datasource: [],

                isHasFoot: false,
                footStep: 2,
                footTextWidth: 40,

                range: false
            };

            var properties = {};

            lib.extend(properties, defaults, options);

            // 字符串转数字
            properties.start = +properties.start;
            properties.end = +properties.end;
            properties.step = +properties.step;

            // 处理min和max
            properties.min =
                typeof properties.min !== 'undefined' ? properties.min : properties.start;
            properties.max =
                typeof properties.max !== 'undefined' ? properties.max : properties.end;

            // min和max只能在start和end的中间
            properties.min = Math.max(properties.min, properties.start);
            properties.max = Math.min(properties.max, properties.end);

            // 水平、竖直滑动杆时的设置
            if (properties.orientation === 'vertical') {
                // 竖直滑动杆时参数的设置
                properties.leftTop = 'top';
                properties.rightBottom = 'bottom';
                properties.widthHeight = 'height';
                properties.cursorWH = 'height';
                properties.pageXY = 'pageY';
            }
            else {
                // 水平时参数的设置
                properties.leftTop = 'left';
                properties.rightBottom = 'right';
                properties.widthHeight = 'width';
                properties.cursorWH = 'width';
                properties.pageXY = 'pageX';
            }

            // 适配value的数据
            properties = adaptorValue.call(this, properties);

            this.$super([properties]);
        };

        /**
         * 适配控件的value
         * @param  {Object} properties 参数
         * @return {Object}            适配后的参数
         */
        function adaptorValue (properties) {

            var value = properties.value;
            delete properties.value;

            if (value != null && properties.rawValue == null) {
                properties.rawValue = this.parseValue(value);
            }

            properties.min =
                typeof properties.min !== 'undefined' ? properties.min : this.min;
            properties.max =
                typeof properties.max !== 'undefined' ? properties.max : this.max;

            if (properties.range || this.range) {
                // 值类型是区间时
                properties.rawValue =
                    typeof properties.rawValue === 'undefined'
                        ? [properties.min, properties.max] : properties.rawValue;

                // 结果是区间时
                properties.minRangeValue = properties.rawValue[0];
                properties.maxRangeValue = properties.rawValue[1];

                properties.minRangeValue =
                    Math.max(properties.minRangeValue, properties.min);
                properties.maxRangeValue =
                    Math.min(properties.maxRangeValue, properties.max);

                // value只能在[min, max]之间
                properties.rawValue = [
                    properties.minRangeValue,
                    properties.maxRangeValue
                ];
            }
            else {
                // 值类型是单个值时
                properties.rawValue =
                    typeof properties.rawValue === 'undefined'
                        ? properties.min : properties.rawValue;

                // value只能在min 和 max中间
                properties.rawValue = Math.max(properties.rawValue, properties.min);
                properties.rawValue = Math.min(properties.rawValue, properties.max);
            }

            return properties;
        }

        /**
         * 批量设置控件的属性值
         * @param {Object} properties 属性值集合
         * @override
         */
        exports.setProperties = function (properties) {

            // 给控件设值的时候适配数据用
            if (properties.hasOwnProperty('rawValue')) {
                properties = adaptorValue.call(this, properties);

            }

            return InputControl.prototype.setProperties.call(this, properties);
        };

        /**
         * 创建滑动杆的头部，
         * 有标题、显示值的label或输入框（文本框或者下拉框），
         * 放在原型里为了可以重写
         * @return {Panel} 返回Panel的对象
         * @protected
         */
        exports.createHead = function () {
            if (this.isHasHead) {
                // 有头
                var headTpl = '<label for="${headValueDomId}" class="${headLabelClasses}">'
                                + '${title}：'
                            + '</label>';

                var headData = {
                    title: this.title,
                    value: this.rawValue,
                    headLabelClasses: this.helper.getPartClasses('head-label').join(),
                    headValueClasses: this.helper.getPartClasses('head-value').join(),
                    headValueDomId: this.helper.getId('head-value'),
                    headValueId: this.id + '-head-value'
                };

                switch (this.headType) {
                    case 'textbox':
                        // textbox时

                        headTpl += '<div class="${headValueClasses} ${headTextBoxClasses}"'
                                    + 'data-ui="id:${headValueId};childName:headValue;type:TextBox;'
                                    + 'required:required;value:${value};'
                                    + '${max}${min}${pattern}${errorMessgae}">'
                                + '</div>';

                        headData.headTextBoxClasses =
                            this.helper.getPartClasses('head-textbox').join();

                        headData.max =
                            typeof this.max !== 'undefined' ? ('max:' + this.max + ';') : '';
                        headData.min =
                            typeof this.min !== 'undefined' ? ('min:' + this.min + ';') : '';

                        headData.pattern =
                            this.pattern ? ('pattern:' + this.pattern + ';') : '';

                        headData.errorMessgae = this.errorMessgae
                            ? ('patternErrorMessage:' + this.errorMessgae + ';') : '';


                        break;
                    case 'select':
                        // select时

                        headTpl += '<div class="${headValueClasses} ${headSelectClasses}"'
                                    + 'data-ui="id:${headValueId};childName:headValue;type:Select;'
                                    + 'value:${value};">'
                                + '</div>';

                        headData.headSelectClasses = this.helper.getPartClasses('head-select').join();

                        break;
                    default:
                        // 其它情况都当label处理

                        headTpl += '<span class="${headValueClasses} ${headSpanClasses}"'
                                    + 'id="${headValueDomId}">'
                                    + '${value}'
                                + '</span>';

                        headData.headSpanClasses = this.helper.getPartClasses('head-span').join();

                        break;
                }

                // 滑动杆的数值有单位
                if (this.unitText) {
                    headData.unitText = this.unitText;
                    headData.headUnitClasses =
                        this.helper.getPartClasses('head-unit').join();
                    headTpl += '<span class="${headUnitClasses}">${unitText}</span>';
                }

                var headHtml = lib.format(headTpl, headData);
                var headDom = this.helper.createPart('head');

                headDom.innerHTML = headHtml;
                this.main.appendChild(headDom);

                var options = {
                    main: headDom,
                    renderOptions: this.renderOptions
                };

                // 创建个panel来做容器
                var panel = esui.create('Panel', options);

                panel.initChildren();
                this.addChild(panel, 'head');

                if (this.headType === 'select') {
                    // select时 设置数据源
                    var select = panel.getChild('headValue');

                    select.setProperties(
                        {
                            datasource: this.datasource,
                            value: this.value
                        }
                    );
                }

                // 存储头部的的控件或dom元素，同步数据用
                if (this.headType === 'label') {
                    // label
                    this.headTarget = this.helper.getPart('head-value');
                }
                else {
                    // textbox 或 select
                    this.headTarget = panel.getChild('headValue');
                }

                return panel;
            }
        };

        /**
         * 创建滑动杆体
         * 有滑块的范围和滑块，
         * 滑块的范围分为显示的范围、已选的范围
         * 滑动杆可能有一个滑块或两个滑块，类型是区间时可能有两个滑块，最大值和最小值
         * 任意一个是显示的起始值时显示一个滑块
         * 放在原型里是为了可重写
         * @protected
         */
        exports.createBody = function () {
            var bodyElement = this.bodyElement = this.helper.createPart('body');
            var cursorElement = this.cursorElement = this.helper.createPart('body-cursor');

            bodyElement.appendChild(cursorElement);

            // 区间时需要两个滑块
            if (this.range) {
                var cursorElementTwo
                    = this.cursorElementTwo
                        = this.helper.createPart('body-cursortwo');

                bodyElement.appendChild(cursorElementTwo);
            }

            // 已选择的范围加个背景色
            if (this.isShowSelectedBG) {
                // 已选择的区间元素
                var bodySelectedElement
                    = this.bodySelectedElement
                        = this.helper.createPart('body-selected');

                bodyElement.appendChild(bodySelectedElement);
            }

            this.main.appendChild(bodyElement);


            // 初始化body内元素的宽度和位置
            initBodyElements(this);
        };

        exports.footTemplate = '<li style="left: ${left}px;">${text}${unitText}</li>';

        /**
         * 创建滑动杆的脚
         * 脚就是一些数值的标尺显示
         * 放在原型上是为了可重写
         * @protected
         */
        exports.createFoot = function () {
            if (!this.isHasFoot) {
                return;
            }

            var footElement = this.helper.getPart('foot');

            // 有就移除 重新创建
            if (footElement) {
                lib.removeNode(footElement);
            }

            footElement = this.helper.createPart('foot', 'ul');

            var footHtml = '';
            var len = (this.end - this.start) / this.footStep;
            var footStepWidth = this.width / len;
            var unitText = '';

            if (this.unitText) {
                unitText = this.unitText;
            }

            for (var i = 0; i <= len; i++) {
                var data = {
                    left: i * footStepWidth - this.footTextWidth / 2,
                    text: this.start + i * this.footStep,
                    unitText: unitText
                };

                footHtml += lib.format(this.footTemplate, data);
            }

            footElement.innerHTML = footHtml;
            this.main.appendChild(footElement);
        };

        /**
         * 初始化dom结构，仅在第一次渲染的时候使用
         * @protected
         * @override
         */
        exports.initStructure = function () {
            // 竖直滑动杆时增加样式
            if (this.orientation === 'vertical') {
                lib.addClass(this.main, this.helper.getPartClasses('vertical')[0]);
            }

            this.createHead();
            this.createBody();
            this.createFoot();
        };

        /**
         * 绑定滑块拖拽的事件
         * @private
         */
        function bindCursorEvents() {
            var cursorElement = this.cursorElement;

            // 给滑块绑定事件
            if (cursorElement) {
                initDragEvents(this, cursorElement);
            }

            // 值是区间时 给第二个滑块绑定事件
            if (this.range) {
                initDragEvents(this, this.cursorElementTwo);
            }
        }

        function returnFalse() {
            return false;
        }

        /**
         * 禁止用户的选择事件
         * @param  {Slider} slider     控件实例
         * @param  {Element} element    禁止的元素
         * @param  {boolean} unselected 绑定为false,解绑为true
         * @private
         */
        function makeUnselectable(slider, element, unselected) {
            if (unselected) {
                slider.helper.removeDOMEvent(element, 'selectstart');
            }
            else {
                slider.helper.addDOMEvent(element, 'selectstart', returnFalse);
            }
        }

        /**
         * 根据滑块left或top的值来计算value
         * @param  {number} cursorLeftTop 滑块位置left或top的值
         * @return {number}      滑块的值
         * @private
         */
        function getValueByLeftTop(cursorLeftTop) {
            var widthHeight = this.widthHeight;

            // 滑块的宽度
            var cursorWH = this.cursorWH;
            // 滑块容器的宽度
            var tmpWidthHeight = this[widthHeight];
            // 选择的宽度
            var selectedWidthHeight = cursorLeftTop + cursorWH / 2;
            var similarValue =
                (selectedWidthHeight / tmpWidthHeight) * (this.end - this.start);

            // 根据步长算值
            similarValue = similarValue - similarValue % this.step;

            var value = this.start + Math.round(similarValue);

            return value;
        }

        /**
         * 根据值获取滑块的位置
         * @param  {number} value 滑块的值
         * @return {number}       滑块的左侧位置
         * @private
         */
        function getLeftTopByValue(value) {
            var widthHeight = this.widthHeight;
            var cursorWH = this.cursorWH;

            var tmpwidthHeight = this[widthHeight];
            var start = this.start;
            var end = this.end;

            var cursorLeftTop =
                (value - start) / (end - start) * tmpwidthHeight - cursorWH / 2;

            return cursorLeftTop;
        }

        /**
         * 根据值去做相应的调整，包括head里显示、赋值和微调滑块的位置
         * 为啥要微调位置，因为你不知道鼠标会停在哪，比如1，2之间跨度太大时 要落到值上
         * @param {Slider} slider 滑动杆控件
         * @param {number} value  滑动杆的值
         * @param {boolean} isSyncValue 需要设置控件的值true 不需要false
         */
        function setByValue(slider, value, isSyncValue) {
            var cursorElement = slider.cursorElement;
            var cursorLeftTop;

            var leftTop = slider.leftTop;
            var widthHeight = slider.widthHeight;

            if (slider.range) {
                var cursorElementTwo = slider.cursorElementTwo;
                var cursorLeftTopTwo = getLeftTopByValue.call(slider, value[1]);

                cursorElementTwo.style[leftTop] = cursorLeftTopTwo + 'px';
                cursorLeftTop = getLeftTopByValue.call(slider, value[0]);

                // hack: 默认第一个滑块的z-index是2 第二个滑块的z-index的是3
                // 因为区间的值可以是2,2这种，当两个滑块值是这种切最大值时，这时只能滑块1可拖动
                // 这时要把它放在第二个滑块上面
                if (value[0] === value[1] && value[0] === slider.max) {
                    cursorElement.style.zIndex = 3;
                    cursorElementTwo.style.zIndex = 2;
                }
                else {
                    cursorElement.style.zIndex = 2;
                    cursorElementTwo.style.zIndex = 3;
                }
            }
            else {
                cursorLeftTop = getLeftTopByValue.call(slider, value);
            }

            // 调整滑块的位置
            cursorElement.style[leftTop] = cursorLeftTop + 'px';

            // 已选择的部分加个背景色显示
            if (slider.isShowSelectedBG) {
                if (slider.range) {
                    slider.bodySelectedElement.style[leftTop]
                        = cursorLeftTop + slider.cursorWH / 2 + 'px';

                    slider.bodySelectedElement.style[widthHeight]
                        = cursorLeftTopTwo - cursorLeftTop + 'px';
                }
                else {
                    slider.bodySelectedElement.style[widthHeight]
                        = cursorLeftTop + slider.cursorWH / 2 + 'px';
                }
            }

            // 内部文本框或者下拉框触发的此操作 不需要再同步它们的值了 别的都需要
            if (isSyncValue) {
                syncValue(slider, value);
            }
        }

        /**
         * 同步控件内数值的显示
         * @param {Slider} slider 滑杆对象
         * @param {number} value  滑杆的值
         */
        function syncValue(slider, value) {
            // 同步头部的值
            if (slider.isHasHead) {
                if (slider.headTarget instanceof InputControl) {
                    // 先去掉绑定的事件 防止循环调用
                    if (slider.headTarget.type === 'TextBox') {
                        slider.headTarget.un('blur');
                    }
                    else if (slider.headTarget.type === 'Select') {
                        slider.headTarget.un('change');
                    }

                    slider.headTarget.setProperties(
                        {
                            value: value
                        }
                    );

                    // 再捆绑事件
                    if (slider.headTarget.type === 'TextBox') {
                        slider.headTarget.on('blur', blurHandler, slider);
                    }
                    else if (slider.headTarget.type === 'Select') {
                        slider.headTarget.on('change', changeHandler, slider);
                    }
                }
                else {
                    // label时
                    slider.headTarget.innerHTML = value;
                }
            }
        }

        /**
         * 鼠标移动的事件
         * @param {Event} e 事件对象
         * @param {boolean} isMouseUp 是否是鼠标松开的触发 是为true 不是为false
         * @return {number} 返回value 让mouseup用
         * @private
         */
        function mousemoveHandler(e, isMouseUp) {
            var target = this.activeCursorElement;
            var cursorElement = this.cursorElement;
            var mousePos = lib.event.getMousePosition(e);

            var pageXY = this.pageXY;
            var leftTop = this.leftTop;
            var widthHeight = this.widthHeight;

            // 拖动的滑块距left的值
            var cursorLeftTop;

            // 滑块区间的时候
            if (this.range) {
                // 拖动的是否是第一个滑块
                var isFirst = false;
                // 另外一个坏块的left
                var otherLeftTop;
                // 另一个滑块的值
                var otherValue;

                // 滑块是第一个时
                if (target.id === cursorElement.id) {
                    otherLeftTop = getLeftTopByValue.call(this, this.maxRangeValue);
                    otherValue = this.maxRangeValue;
                    isFirst = true;

                    cursorLeftTop =
                        Math.max(
                            this.minStartPos - this.startPos,
                            mousePos[pageXY] - this.startPos
                        );

                    cursorLeftTop = Math.min(cursorLeftTop, otherLeftTop);
                }
                else {
                    // 滑块是第二个时
                    otherLeftTop = getLeftTopByValue.call(this, this.minRangeValue);
                    otherValue = this.minRangeValue;

                    cursorLeftTop =
                        Math.max(otherLeftTop, mousePos[pageXY] - this.startPos);

                    cursorLeftTop = Math.min(cursorLeftTop, this.maxEndPos - this.startPos);
                }
            }
            else {
                target = cursorElement;

                cursorLeftTop = Math.max(
                    this.minStartPos - this.startPos,
                    mousePos[pageXY] - this.startPos
                );

                cursorLeftTop = Math.min(
                    cursorLeftTop,
                    this.maxEndPos - this.startPos
                );
            }

            // 根据left来计算值
            var value;
            var curValue = getValueByLeftTop.call(this, cursorLeftTop);

            if (this.range) {
                if (isFirst) {
                    value = [curValue, otherValue];
                }
                else {
                    value = [otherValue, curValue];
                }
            }
            else {
                value = curValue;
            }

            if (!isMouseUp) {
                target.style[this.leftTop] = cursorLeftTop + 'px';

                // 已选择的部分加个背景色显示
                if (this.isShowSelectedBG) {
                    if (this.range) {

                        var tmpWidthHeight;

                        if (isFirst) {
                            this.bodySelectedElement.style[leftTop] = cursorLeftTop + 'px';
                            tmpWidthHeight = otherLeftTop - cursorLeftTop;
                        }
                        else {
                            this.bodySelectedElement.style[leftTop] = otherLeftTop + 'px';
                            tmpWidthHeight = cursorLeftTop - otherLeftTop;
                        }

                        this.bodySelectedElement.style[widthHeight] = tmpWidthHeight + 'px';

                    }
                    else {
                        this.bodySelectedElement.style[widthHeight]
                            = cursorLeftTop + this.cursorWH / 2 + 'px';
                    }
                }

                // 滑动的时候触发move事件
                this.fire('move', value);
            }

            // 同步头部的数值显示
            syncValue(this, value);

            return value;
        }

        /**
         * 鼠标的松开事件
         * @param {Event} e 事件的对象
         * @private
         */
        function mouseupHandler(e) {
            // 去掉active的样式
            lib.removeClass(
                this.activeCursorElement,
                this.helper.getPartClasses('body-cursor-active')[0]
            );

            // 放开和mousemove时做得事是一样的，再做一遍
            var value = mousemoveHandler.call(this, e, true);

            // 设置控件的值，因为是内部设值不涉及重绘，所以不调set*方法了
            this.rawValue = value;
            this.minRangeValue = value[0];
            this.maxRangeValue = value[1];

            setByValue(this, value, true);

            // 放开鼠标的时候触发change事件
            this.fire('change', value);

            var doc = document;

            this.helper.removeDOMEvent(doc, 'mouseup', mouseupHandler);
            this.helper.removeDOMEvent(doc, 'mousemove', mousemoveHandler);
            // 清除浏览器select的事件
            makeUnselectable(this, this.main, true);
        }

        /**
         * 初始化body内元素的坐标和宽度
         * @param  {Slider}  slider 滑动杆控件
         */
        function initBodyElements(slider) {
            var bodyElement = slider.bodyElement;
            var cursorElement = slider.cursorElement;
            // 获取滑块容器的位置
            var bodyPos = lib.getOffset(bodyElement);

            var leftTop = slider.leftTop;
            var rightBottom = slider.rightBottom;
            var widthHeight = slider.widthHeight;

            // 获取滑块容器的宽度，用来计算值用
            slider[widthHeight] = bodyPos[widthHeight];

            // 获取滑块的宽度
            var cursorWH =
                parseInt(lib.getStyle(cursorElement, widthHeight), 10);

            // 保存滑块的宽度
            slider.cursorWH = cursorWH;

            // 滑块能去的最左边
            if (typeof slider.min !== 'undefined') {
                var minLeftTop = getLeftTopByValue.call(slider, slider.min);
                // 滑块所能去的最左边
                slider.minStartPos = bodyPos[leftTop] + minLeftTop;
                // 滑竿范围的最左边
                slider.startPos = bodyPos[leftTop];
            }

            // 滑块能去的最右侧
            if (typeof slider.max !== 'undefined') {
                var maxLeftTop = getLeftTopByValue.call(slider, slider.max);

                slider.maxEndPos = bodyPos[leftTop] + maxLeftTop;
                slider.endPos = bodyPos[rightBottom];
            }
        }

        /**
         * 鼠标的按下事件
         * @param {Event} e 事件对象
         * @private
         */
        function mousedownHandler(e) {
            // 存住活动的对象
            this.activeCursorElement = e.target;

            // 增加active的样式
            lib.addClass(e.target, this.helper.getPartClasses('body-cursor-active')[0]);

            // 点击的时候再初始化各种坐标 为了一些初始化时不在屏幕内的控件
            initBodyElements(this);

            var doc = document;

            // 禁止鼠标select事件
            makeUnselectable(this, this.main);

            // 鼠标的松开事件
            this.helper.addDOMEvent(doc, 'mouseup', mouseupHandler);
            // 鼠标的移动事件
            this.helper.addDOMEvent(doc, 'mousemove', mousemoveHandler);
        }

        /**
         * 处理拖拽事件
         * @param  {Slider} slider  控件的实例
         * @param  {Element} element  处理事件的dom元素
         * @param  {boolean} unbind  绑定为false 解绑为true
         * @private
         */
        function initDragEvents(slider, element, unbind) {
            if (unbind) {
                slider.helper.removeDOMEvent(element, 'mousedown', mousedownHandler);
            }
            else {
                slider.helper.addDOMEvent(element, 'mousedown', mousedownHandler);
            }
        }

        /**
         * 绑定头部的事件
         * @private
         */
        function bindHeadEvents() {
            if (!this.isHasHead) {
                return;
            }

            var target = this.headTarget;

            if (target instanceof InputControl) {
                 // textbox时
                if (target.type === 'TextBox') {
                    // textbox时实时的监听blur做验证用
                    target.on('blur', blurHandler, this);
                }
                else if (target.type === 'Select') {
                    // select时的change监听事件
                    target.on('change',  changeHandler, this);
                }
            }
        }

        /**
         * 头部文本框的blur处理事件
         * @param  {Event} e 事件对象
         * @private
         */
        function blurHandler(e) {
            var target = e.target;
            var isValid = target.validate();

            if (isValid) {
                // 验证通过
                var value = target.getValue();

                this.rawValue = +value;
                setByValue(this, value);
            }
        }

        /**
         * 头部下拉框的change处理事件
         * @param  {Event} e 事件对象
         * @private
         */
        function changeHandler(e) {
            var target = e.target;
            var value = target.getValue();

            this.value = +value;
            setByValue(this, value);
        }

        /**
         * 初始化事件的交互
         * @protected
         * @override
         */
        exports.initEvents = function () {
            // 绑定滑块的事件
            bindCursorEvents.call(this);

            // 绑定头部的事件
            bindHeadEvents.call(this);
        };

        /**
         * 获取滑动杆的值
         * @return {*} 滑动杆的值
         */
        exports.getValue = function () {
            var value;

            if (this.range) {
                value = [this.minRangeValue, this.maxRangeValue];
            }
            else {
                value = this.getRawValue();
            }

            return value;
        };

        /**
         * 重新渲染
         * @protected
         * @override
         * @type {Function} 重新渲染时要执行的函数
         */
        exports.repaint = require('esui/painters').createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'rawValue',
                paint: function (slider, value) {
                    setByValue(slider, value, true);
                }
            }
        );

        /**
         * 销毁控件
         * @protected
         * @override
         */
        exports.dispose = function () {
            this.headTarget &&  this.headTarget.dispose && this.headTarget.dispose();
            this.headTarget = null;
            this.bodyElement = null;
            this.cursorElement = null;
            this.bodySelectedElement = null;
            this.activeCursorElement = null;

            if (this.range) {
                this.cursorElementTwo = null;
            }


            this.$super(arguments);
        };


        var Slider = require('eoo').create(InputControl, exports);
        esui.register(Slider);

        return Slider;
    }
);
