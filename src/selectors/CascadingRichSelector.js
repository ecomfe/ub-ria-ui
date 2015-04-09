/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 双排左右互选富选择控件组合
 * @exports CascadingRichSelector
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {

        /**
         * @class CascadingRichSelector
         * @extends esui.Panel
         */
        var exports = {};

        /**
         * @override
         */
        exports.type = 'CascadingRichSelector';

        exports.getCategory = function () {
            return 'input';
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            this.helper.initChildren();
            var source = this.getChild('source');
            var target = this.getChild('target');

            // 绑事件
            source.on(
                'add',
                function () {
                    var newdata = this.getSelectedItemsFullStructure();
                    target.setProperties({datasource: newdata});
                }
            );

            target.on(
                'delete',
                function (arg) {
                    var items = arg.items;
                    source.selectItems(items, false);
                }
            );
        };

        exports.getValue = function () {
            var target = this.getChild('target');
            return target.getValue();
        };

        exports.getRawValue = function () {
            var target = this.getChild('target');
            return target.getRawValue();
        };

        /**
         * 进行验证
         *
         * @return {boolean}
         */
        exports.validate = function () {
            var target = this.getChild('target');

            if (!target) {
                return true;
            }

            if (typeof target.validate === 'function') {
                return target.validate();
            }
        };

        var CascadingRichSelector = require('eoo').create(require('esui/Panel'), exports);
        require('esui').register(CascadingRichSelector);

        return CascadingRichSelector;
    }
);
