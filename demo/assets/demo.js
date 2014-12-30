require.config({
    'baseUrl': '../src',
    'paths': {},
    'packages': [
        {
            'name': 'mini-event',
            'location': '../dep/mini-event/1.0.2/src',
            'main': 'main'
        },
        {
            'name': 'underscore',
            'location': '../dep/underscore/1.5.2/src',
            'main': 'underscore'
        },
        {
            'name': 'moment',
            'location': '../dep/moment/2.7.0/src',
            'main': 'moment'
        },
        {
            'name': 'etpl',
            'location': '../dep/etpl/3.0.0/src',
            'main': 'main'
        },
        {
            'name': 'esui',
            'location': '../dep/esui/3.1.0-beta.5/src',
            'main': 'main'
        },
        {
            'name': 'ub-ria-ui',
            'location': '../src',
            'main': 'main'
        },
        {
            'name': 'ef',
            'location': '../dep/ef/3.1.0-beta.2/src',
            'main': 'main'
        },
        {
            'name': 'eoo',
            'location': '../dep/eoo/0.1.1/src',
            'main': 'main'
        },
        {
            'name': 'est',
            'location': '../dep/est/1.3.0/src'
        },
        {
            'name': 'esf',
            'location': '../dep/esf/1.0.0-alpha.4/src'
        },
        {
            'name': 'eicons',
            'location': '../dep/eicons/1.0.0-alpha.1/src',
            'main': 'main.less'
        },
        {
            'name': 'er',
            'location': '../dep/er/3.1.0-beta.6/src',
            'main': 'main'
        }
    ]
});

$(function () {
    function hideSource(e) {
        $('.source-visible').removeClass('source-visible');
    }

    function viewSource(e) {
        var target = $(e.target);
        var section = target.closest('.view');
        hideSource();
        if (target.hasClass('view-markup')) {
            section.find('.source-markup').addClass('source-visible');
        }
        else if (target.hasClass('view-script')) {
            section.find('.source-script').addClass('source-visible');
        }
    }

    $('.view').on('click', '.viewer li', viewSource);
    $('.source, .viewer li').on('mousedown', false);
    //$('html').on('mousedown', hideSource);
    
    var navItems = 
        '<li><a href="Carousel.html">Carousel</a></li>' +
        '<li><a href="TreeRichSelector.html">TreeRichSelector</a></li>' +
        '<li><a href="DrawerActionPanel.html">DrawerActionPanel</a></li>';

    $('#navigator').html(navItems);

    $('.example').each(function (index, item) {
        var $sample = $('<pre class="source source-markup"><code class="language-markup"></code></pre>');
        var $code = $sample.find('.language-markup');
        var $item = $(item);
        $sample.insertAfter($item);

        var sampleCode = $item.html();
        var indexOfFirstElement = sampleCode.indexOf('<');
        var arr = sampleCode.split('\n');
        var targetArr = [];
        var reg = new RegExp('^\\s{' + (indexOfFirstElement - 1) + '}')
        for (var i = 0; i < arr.length; i++) {
            targetArr.push(arr[i].replace(reg, ''));
        }
        $code.text(targetArr.join('\n'));
    });
    Prism.highlightAll();
});
var ready = (function () {
    var list = [];
    return function (callback) {
        if (callback) {
            list.push(callback);
        }
        else {
            for (var i = 0; i < list.length; i++) {
                list[i]();
            }
            ready = function (callback) {
                callback();
            };
        }
    }
}());