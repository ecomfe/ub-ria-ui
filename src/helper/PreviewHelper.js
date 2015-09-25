/**
 * 构造图片，视频和Flash显示的HTML片段
 * @file PreviewHelper.js
 * @author chuzhenyang(chuzhenyang@baidu.com)
 */

define(function (require) {
    require('./swfHelper');

    var $ = require('jquery');

    var PreviewHelper = {
        preview: function (options) {
            var type = options.type || this.analysizeType(options.url);
            var previewNode = null;

            if (!options.url || !type) {
                return;
            }

            switch (type.toLowerCase()) {
                case 'image':
                    previewNode = getImageHtml(options);
                    break;
                case 'flash':
                    previewNode = getFlashHtml(options);
                    break;
                case 'flv':
                    previewNode = getFlvHtml(options);
                    break;
                case 'video':
                    previewNode = getVideoHtml(options);
                    break;
            }

            return previewNode;
        },
        analysizeType: function (url) {
            var type = '';
            if (/\.(?:jpg|png|gif|jpeg|bmp)$/i.test(url)) {
                type = 'image';
            }
            else if (/\.swf/i.test(url)) {
                type = 'flash';
            }
            else if (/\.(?:mp4|mov|mkv|mpg|avi|rmvb|rm|ogg|wmv|mp3|wma|mid)/i.test(url)) {
                type = 'video';
            }
            else if (/\.flv/i.test(url)) {
                type = 'flv';
            }

            return type;
        }
    };

    function getImageHtml(options) {
        var img = new Image();
        img.src = options.url;
        if (options.width) {
            img.style.width = options.width;
        }
        if (options.height) {
            img.style.height = options.height;
        }

        return img;
    }

    function getFlashHtml(options) {
        return $.flash.create(
            {
                id: options.id || 'preview-fla',
                swf: options.url,
                width: options.width,
                height: options.height,
                wmode: 'transparent'
            }
        );
    }

    function getFlvHtml(options) {
        return $.flash.create(
            {
                id: options.id || 'preview-flv',
                swf: '../resource/video-preview-player.swf',
                width: options.width,
                height: options.height,
                wmode: 'transparent',
                flashvars: 'play_url=' + options.url
            }
        );
    }

    function getVideoHtml(options) {
        var video = document.createElement('VIDEO');
        $(video).html('该浏览器暂不支持此格式视频预览');
        $(video).attr('id', options.id || 'preview-video');
        $(video).attr('title', options.title);
        $(video).attr('src', options.url);
        $(video).attr('width', options.width);
        $(video).attr('height', options.height);

        return video;
    }

    return PreviewHelper;
});
