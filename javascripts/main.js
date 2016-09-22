(function () {
    var Util = (function () {
        var StorageGetter = function (key) {
            var parse = 'html5';
            return localStorage.getItem(parse + key);
        }

        var StorageSetter = function (key, value) {
            var parse = 'html5';
            return localStorage.setItem(parse + key, value);
        }
        var getJsonp = function (url, callback) {
            return $.jsonp({
                url: url,
                cache: true,
                callback: 'duokan_fiction_chapter',
                success: function (result) {

                    var data = $.base64.decode(result);
                    //decode完是一个json 数据
                    var json = decodeURIComponent(escape(data));

                    //将获得的json解码为字符串
                    callback(json);
                }
            })
        }

        return {
            getJsonp: getJsonp,
            StorageGetter: StorageGetter,
            StorageSetter: StorageSetter
        };
    })();
    var Dom = {
        top_nav: $('.top-nav'),
        bottom_nav: $('.bottom_nav'),
        pannel_nav: $('.pannel_nav'),
        Root_container: $('#fiction-container'),
        font_btn: $('#font-btn'),
        night_btn: $('#night-btn'),
        body: $('body')
    };
    var Doc = $(document);
    var Win = $(window);
    var readermodel;
    var readerUI;

    function main() {
        //todo 整个项目的入口
        readermodel = ReaderModel();
        readerUI = ReaderBaseFrame($('#fiction-container'));
        readermodel.init(function (data) {
            readerUI(data);
        });
        EventHandler();

    }


    var initBackground = Util.StorageGetter('bg_color');
    if (initBackground == null) {
        initBackground = '#e9dfc7';
    } else if (initBackground == '#283548') {
        Dom.night_btn.find('i').addClass('current');
    }
    Dom.body.css('background', initBackground);

    var initFontSize = Util.StorageGetter('font_size');
    initFontSize = parseInt(initFontSize);
    if (!initFontSize) {
        initFontSize = 14;
    }
    Dom.Root_container.css('font-size', initFontSize);

    function ReaderModel() {
        //todo 实现阅读器与相关数据的交互方法
        var Chapter_id;
        var Chapter_total;
        //初始化函数
        var init = function (UIcallback) {
            getFictionInfo(function () {
                getCurChapterContent(Chapter_id, function (data) {
                    //Todo
                    UIcallback && UIcallback(data);
                })
            })
        }
        var getFictionInfo = function (callback) {
            //获得小说信息的方法
            $.get('data/chapter.json', function (data) {
                //获得章节信息后的回调

                //获得第一个章节需要渲染页面
                Chapter_id = Util.StorageGetter('last_chapter_id');

                if (Chapter_id == null) {
                    Chapter_id = data.chapters[1].chapter_id;
                }
                Chapter_total = data.chapters.length;
                callback && callback(data);
            }, 'json')
        }

        var getCurChapterContent = function (chapter_id, callback) {
            //获得当前章节内容的方法
            $.get('data/data' + chapter_id + '.json', function (data) {
                if (data.result == 0) {
                    //判断当前服务器是否能正常发送数据
                    var url = data.jsonp;
                    Util.getJsonp(url, function (data) {
                        callback && callback(data);
                    });
                }

            }, 'json')
        }
        var preChapter = function (UIcallback) {
            //获得上一页数据
            Chapter_id = parseInt(Chapter_id, 10);
            if (Chapter_id == 0) {
                return;
            }
            Chapter_id -= 1;
            Util.StorageSetter('last_chapter_id', Chapter_id);
            getCurChapterContent(Chapter_id, UIcallback);

        }
        var nextChapter = function (UIcallback) {
            //获得下一页数据
            Chapter_id = parseInt(Chapter_id, 10);
            if (Chapter_id == Chapter_total) {
                return;
            }
            Chapter_id += 1;
            Util.StorageSetter('last_chapter_id', Chapter_id);
            getCurChapterContent(Chapter_id, UIcallback);
        }
        return {
            init: init,
            preChapter: preChapter,
            nextChapter: nextChapter
        }
    }

    function ReaderBaseFrame(container) {
        //todo 渲染基本的UI结构
        function parseChapterData(jsonData) {
            var jsonObj = JSON.parse(jsonData);
            var html = '<h4>' + jsonObj.t + '</h4>';
            for (var i = 0; i < jsonObj.p.length; i++) {
                html += '<p>' + jsonObj.p[i] + '</p>';
            }
            return html;
        }

        return function (data) {
            container.html(parseChapterData(data));

        }
    }

    function turnDay() {
        //todo 白天模式
        $('body').css('background-color', '#fff');
        initBackground = '#fff'
        SetBackGroundStorage(initBackground);
    }

    function turnNight() {
        //todo 夜间模式
        $('body').css('background-color', '#283548');
        initBackground = '#283548';
        SetBackGroundStorage(initBackground);
    }

    function hideBottonPannel() {
        //todo 隐藏底部面板
        Dom.pannel_nav.hide();
        Dom.bottom_nav.hide();
        Dom.font_btn.find('i').removeClass('current');
        if (Dom.night_btn.find('i').hasClass('current')) {
            Dom.night_btn.find('i').removeClass('current');
        }
    }

    function SetBackGroundStorage(initBackground) {
        Util.StorageSetter('bg_color', initBackground);
    }

    function EventHandler() {
        //todo 交互的事件绑定
        $('#menu-btn').click(function () {
            location.href = 'http://dushu.xiaomi.com/#page=book&id=1392089&source_id=275585&source=2';
        })

        $('#action_mid').click(function () {
            if (Dom.top_nav.css('display') == 'none') {
                Dom.top_nav.show();
                Dom.bottom_nav.show();

            } else {
                Dom.top_nav.hide();
                Dom.pannel_nav.hide();
                Dom.bottom_nav.hide();
                Dom.font_btn.find('i').removeClass('current');
            }
        });

        Win.scroll(function () {
            Dom.top_nav.hide();
            Dom.pannel_nav.hide();
            Dom.bottom_nav.hide();
            Dom.font_btn.find('i').removeClass('current');
        })

        Dom.font_btn.click(function () {
            if (Dom.pannel_nav.css('display') == 'none') {
                Dom.pannel_nav.show();
                Dom.font_btn.find('i').addClass('current');
            } else {
                hideBottonPannel();
            }

        })

        Dom.night_btn.click(function () {
            if (Dom.night_btn.find('i').hasClass('current')) {
                turnDay();
                Dom.night_btn.find('i').removeClass('current');
            } else {
                Dom.night_btn.find('i').addClass('current')
                turnNight();
            }

        })
        $('#large-font').click(function () {
            if (initFontSize > 20) {
                return;
            }
            initFontSize += 1;
            Dom.Root_container.css('font-size', initFontSize);
            Util.StorageSetter('font_size', initFontSize);
        })
        $('#small-font').click(function () {
            if (initFontSize < 12) {
                return;
            }
            initFontSize -= 1;
            Dom.Root_container.css('font-size', initFontSize);
            Util.StorageSetter('font_size', initFontSize);
        })
        $('.bk-container').eq(0).click(function () {
            turnDay();
            hideBottonPannel();
        })
        $('.bk-container').eq(1).click(function () {
            $('body').css('background-color', '#e9dfc7');
            initBackground = '#e9dfc7';
            SetBackGroundStorage(initBackground);
            hideBottonPannel();
        })
        $('.bk-container').eq(2).click(function () {
            $('body').css('background-color', '#a4a5a4');
            initBackground = '#a4a5a4';
            SetBackGroundStorage(initBackground);
            hideBottonPannel();
        })
        $('.bk-container').eq(3).click(function () {
            $('body').css('background-color', '#c3deb7');
            initBackground = '#c3deb7';
            SetBackGroundStorage(initBackground);
            hideBottonPannel();
        })
        $('.bk-container').eq(4).click(function () {
            turnNight();
            hideBottonPannel();
        })

        $('.pre-button').click(function () {
            //todo 获得章节数据并把数据拿出来渲染
            readermodel.preChapter(function (data) {
                readerUI(data);
            });

        })

        $('.next-button').click(function () {
            readermodel.nextChapter(function (data) {
                readerUI(data);
            });

        })
    }

    main();
})();
