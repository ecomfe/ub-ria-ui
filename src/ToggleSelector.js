/**
 * SSP for WEB
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 可将一个单选RichSelector展开收起的控件
 * @class ToggleSelector
 * @extends ub-ria.ui.TogglePanel
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var u = require('underscore');

        var exports = {};

        exports.type = 'ToggleSelector';
        exports.styleType = 'TogglePanel';

        exports.getCategory = function () {
            return 'input';
        };

        exports.initOptions = function (options) {
            var properties = {
                textField: null,
                collapseAfterChange: true
            };
            options = u.extend(properties, options);
            this.$super(arguments);
        };

        exports.initStructure = function () {
            this.$super(arguments);
            lib.addClass(
                this.main,
                'ui-toggle-selector'
            );
        };

        exports.initEvents = function () {
            this.$super(arguments);
            var target = this.viewContext.getSafely(this.targetControl);
            target.on('change', u.bind(changeHandler, this));
            target.on('add', u.bind(addHandler, this));
            this.updateDisplayText(target);
        };

        /**
         * @override
         */
        exports.toggleContent = function () {
            this.$super(arguments);
        };

        /**
         * 数据变化时如果没有阻止，则更新显示文字
         */
        function changeHandler(e) {
            var event = this.fire('change');
            if (!event.isDefaultPrevented()) {
                this.updateDisplayText(e.target);
            }
        }

        /**
         * 添加数据时才控制展开收起
         */
        function addHandler(e) {
            if (this.collapseAfterChange) {
                this.toggleContent();
            }
        }

        exports.updateDisplayText = function (target) {
            var displayText = this.title;
            // 要render了以后才能获取到value
            if (target.helper.isInStage('RENDERED')) {
                var rawValue = target.getRawValue();
                // 因为只针对单选控件，因此即便是多个也默认选第一个
                if (u.isArray(rawValue)) {
                    rawValue = rawValue[0];
                }
                if (rawValue && rawValue[this.textField]) {
                    displayText = rawValue[this.textField];
                }
            }
            this.set('title', displayText);
        };

        exports.getRawValue = function () {
            var target = this.viewContext.getSafely(this.targetControl);
            var rawValue = target.getRawValue();
            if (rawValue.length > 0) {
                return rawValue[0][this.valueField];
            }
        };

        exports.getValue = function () {
            return this.getRawValue();
        };

        /**
         * 进行验证
         *
         * @return {boolean}
         */
        exports.validate = function () {
            var target = this.viewContext.get(this.targetControl);

            if (!target) {
                return true;
            }

            if (typeof target.validate === 'function') {
                return target.validate();
            }
        };

        var TogglePanel = require('./TogglePanel');
        var ToggleSelector = require('eoo').create(TogglePanel, exports);
        require('esui').register(ToggleSelector);

        return ToggleSelector;
    }
);
