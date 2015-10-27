define(
    function (require) {

        require('jquery-simulate');

        var esui = require('esui');
        var TokenField = require('ubRiaUi/TokenField');

        var container = document.getElementById('container');
        var tokenField = esui.init(container)[0];

        describe('TokenField common', function () {
            var main = tokenField.main;
            it('should be a constructor', function () {
                expect($(main)).toBeInDOM();
            });
        });
    }
);
