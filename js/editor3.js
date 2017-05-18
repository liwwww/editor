;(function ($) {

    //"use strict";

    var uploadEditor = UE.getEditor("myUpload", {
        isShow: false,
        focus: false,
        enableAutoSave: false,
        autoSyncData: false,
        autoFloatEnabled: false,
        wordCount: false,
        sourceEditor: null,
        scaleEnabled: true,
        toolbars: [["insertimage", "attachment", "insertvideo"]]
    });

    var ue = UE.getEditor('editor', {
        toolbars: [
            [
                'undo', //恢复
                'redo', //重做
                '|',
                'fontsize', //字号
                '|',
                'blockquote', //引用
                'content_style',//css样式
                '|',
                'removeformat', //清除格式
                'formatmatch', //格式刷
                'link',//超链接
                'unlink', //取消链接
                'music', //音乐上传
                'insertimage',//图片上传
                'insertvideo', //视频上传
                'attachment' //文件上传

            ],
            [
                'bold', //加粗
                'italic', //斜体
                'underline', //下划线
                'strikethrough', //删除线
                'fontfamily', //字体
                '|',
                'indent', //首行缩进
                '|',
                'justifyleft', //居左对齐
                'justifyright', //居右对齐
                'justifycenter', //居中对齐
                'justifyjustify', //两端对齐
                '|',
                'rowspacingtop', //段前距
                'rowspacingbottom', //断后距
                'lineheight', //行间距
                '|',
                'insertorderedlist', //有序列表
                'insertunorderedlist', //无序列表
                '|',
                'imageleft', //左浮动
                'imageright', //右浮动
                'imagecenter', //居中
                'imagenone' //默认
            ]
        ],
        autoHeightEnabled: false,
        wordCount: false,
        elementPathEnabled: false,
        enableAutoSave: false,
        autoFloatEnabled: false,
        initialFrameWidth: 600,
        initialFrameHeight: 480
    });


    var PageList = function (element, p_option) {

        this.init(element, p_option);

    };

    var tools = {

        check: '',
        tipDiv: '',
        mask: '',

        isEmpty: function () {

            $('.control-window').remove();
            $('.white-hide').remove();

        },

        isTip: function (content, type, global) {

            var contentStr = content,
                typeStr = type,
                windowName = '.control-window',
                controlColor = '.control-color';

            var tipColor = 'error' === typeStr ? '#e14323' : '#43b548';

            this.tipDiv = ['<div class="control-window"><span class="control-color" style="border-top-left-radius: 4px;border-top-right-radius: 4px;top: 0;height: 12px;width: 100%;display: block;line-height: 12px;"></span><span>', contentStr, '</span><div class="control-floor"><span class="btn-default quxiao">',
                '<button class="btn yes-btn" id="yes-btn">是</button><button class="btn no-btn" id="no-btn">否</button>', '</span></div></div>'].join('');

            var gb = $('#' + global).offset();

            $('body').append(this.tipDiv);
            $(windowName).offset(function () {

                newWindow = new Object();
                newWindow.left = gb.left + 100;
                newWindow.top = gb.top + 50;
                return newWindow;

            });
            $(controlColor).css('background-color', tipColor);

        },

        isMask: function () {

            this.mask = '<div class="white-hide" ></div>';

            $('body').append(this.mask);
        },

        isCheck: function (content) {

            this.check = '<div class="tip-massage"><span>'+content+'</span></div>';
            $('body').append(this.check);

            setTimeout(function () {

                $('.tip-massage').fadeOut();
                $('.tip-massage').remove();

            },600);


        }


    }

    PageList.prototype = {

        init: function (element, p_option) {

            this.paramName = p_option.paramNmae || {};

            /*this.lsArrName = [];*/

            this.addItem = 'add-item';          // add-item按钮

            this.$element = $(element);

            this.numberArr = [];            //item编号储存所的数组

            this.inputArr = [];         // list-input的id值

            this.ckEmptyStr = true;         //必填项目是否为空判断

            /* this.inputTitle = [];*/

            /*this.btnAs = false;*/

            this.setOption(p_option);

        },

        ckEditor: function (a) {

        },

        /**
         * 设置配置
         */
        setOption: function (p_option) {

            var $this = this;

            this.p_option = $.extend({}, (this.p_option || $.fn.pageList.defaults), p_option);

            this.p_option.itemName = this.p_option.itemName + this.p_option.itemCode;

            this.sessionArr = $.fn.pageList.defaults.ckPage(p_option.sessionType);

            this.showPage(this.p_option);           // 渲染list-item

            this.showInput(this.p_option);          // 渲染list-input

            ue.ready(function () {

                $this.showContent();            //读取选中篇文章的内容

                $this.listen();          // 绑定操作监听事件

            });

            var binder = new DataBinder(0);         //注册双向绑定

            //加载完毕时默认选中头部还是尾部
            if (this.p_option.chooseNewPage) {

                $('.list-item:last').click();

            } else {

                $('.list-item:first').click();

            }
        },

        /**
         *
         *  加载输入列表
         *
         */
        showInput: function (p_option) {

            this.ckInput(p_option.inputList);

        },

        /**
         *
         * 加载选中文章的内容
         *
         */
        showContent: function (only) {

            var choose = $('.chooseItem')[0].id;            //选中框

            if(only) {

                for (var i = 0; i < this.inputArr.length; i++) {

                    if($('#'+this.inputArr[i])[0].tagName === 'SELECT') {

                        $('#' + this.inputArr[i] + 'option:first').prop('selected', 'selected');

                    }else if(this.inputArr[i] === 'editor') {

                        UE.getEditor('editor').setContent('');

                    }else {

                        $('#'+this.inputArr[i]).val('');

                    }
                }

            }else {
                var listArr = JSON.parse(this.sessionArr.getItem(choose));          //所选中的文章的内容（储存在sessionStorage）

                //遍历session
                $.each(listArr, function (k, v) {

                    if (k === 'editor') {

                        UE.getEditor('editor').setContent(v);

                    } else {

                        $('#' + k).val(v);            //对输入框写入内容

                    }

                });
            }

        },

        /**
         *
         * 加载文章列表的封面图片和标题内容
         *
         */
        showList: function (id,only) {

            var $this = this;

            if(only) {

                $('#' + id).find('.item-img img')[0].src = '';
                $('#' + id).find('.item-title a').text('');

            }else {
                var listArr = JSON.parse(this.sessionArr.getItem(id));          //加载指定id的session

                //遍历指定的id的session加载图片和标题
                $.each(listArr, function (k, v) {

                    if (k === 'img') {

                        $('#' + id).find('.item-img img')[0].src = v;

                    } else if (k === $this.ckBindId()) {

                        $('#' + id).find('.item-title a').text(v);

                    }

                });

            }

        },

        /**
         *
         * 储存选中文章的编辑内容
         *
         */
        ckContent: function () {

            var choose = $('.chooseItem')[0].id,            //选中文章的id
                arr = this.inputArr,            //所有输入框的id值
                showArr = {},           //储存文章内容的变量
                itemId = 'itemId',
                img = 'img';

            for (var i = 0; i < arr.length; i++) {

                if (arr[i] === 'editor') {
                    showArr[arr[i]] = UE.getEditor('editor').getContent();
                } else {

                    showArr[arr[i]] = $('#' + arr[i])[0].value;

                }

                if ($('.chooseItem').find('.item-img img')[0].src == undefined) {

                    showArr[img] = '';

                } else {

                    var imgSrc = $('.chooseItem').find('.item-img img')[0].src;

                    if (imgSrc !== window.location.href) {

                        showArr[img] = $('.chooseItem').find('.item-img img')[0].src;
                        console.log("没有上传图片");

                    } else {

                        showArr[img] = "";

                    }

                }

                var reg = new RegExp(this.p_option.itemName + '([\\d]+)');

                showArr[itemId] = parseInt(choose.match(reg)[1]);

            }

            this.sessionArr.setItem(choose, JSON.stringify(showArr));            //转成JSON字符串储存在session里
            tools.isCheck('保存成功');

        },

        /**
         *
         * 渲染输入框页面
         *
         */
        ckInput: function (inputList) {

            var id = 'id',
                name = 'name',
                type = 'type',
                option = 'option',
                html = '',          //输入框的html代码
                op_html = '',           //输入框为SELECT时的html代码
                htmlBtn = '',           //底部上传封面图片和保存的两个按钮
                classType = 'class',
                $this = this,
                item = this.p_option.itemInput;

            //遍历输入框id，并渲染页面
            $.each(inputList, function (k, v) {

                if (v[classType]) {

                    html = '<div class="content-list' + ' ' + v[classType] + '"><div class="list-title"><a>' + v[name] + '</a></div>';

                } else {

                    html = '<div class="content-list"><div class="list-title"><a>' + v[name] + '</a></div>';

                }

                $this.inputArr.push(v[id]);

                if (v[type] == 'select') {

                    var optionArr = JSON.stringify(v).match(/[^option]*([\d])/g);

                    /*if( v[classType] !=undefined ) {
                     html += '<div class="list-input'+' '+v[classType]+'"><'+ v[type] + ' id="' + v[id] +'"'+ '>';
                     }*/
                    html += '<div class="list-input"><' + v[type] + ' id="' + v[id] + '"' + '>';
                    for (var j = 0; j < optionArr.length; j++) {

                        op_html += '<option value=' + optionArr[j] + '>' + v[option + optionArr[j]] + '</option>';

                    }

                    op_html += '</' + v[type] + '>' + '</div></div>';
                    html += op_html;
                } else {

                    /*if( v[classType] !=undefined ) {
                     html += '<div class="list-input'+' '+v[classType]+'"><'+ v[type] + ' id="' + v[id] +'"'+ '>';
                     }*/
                    if (v[id] === $this.ckBindId()) {

                        html += '<div class="list-input"><' + v[type] + ' id="' + v[id] + '"' + 'data-bind-0="name">';

                    } else {

                        html += '<div class="list-input"><' + v[type] + ' id="' + v[id] + '"' + '>';

                    }

                }


                $('#' + item).append(html);
            });

            if($this.inputArr.indexOf('editor') < 0) {
                var addHtml = '<div class="list-input none"><' + 'script' + ' id="' + 'editor' + '"' + '>';
            }

            $('#' + item).append(addHtml);

            htmlBtn = '<div class="content-list"><div class="list-title">' +
                '<a>图片</a></div>' +
                '<div class="list-input"><span class="btn-default"><button class="btn" id="myUpload">上传图片</button>' +
                '<a class="none"><button class="btn" id="save-btn">保存当前</button></a>' +
                '<button class="btn none" id="issue-btn">发布</button></span></div></div>';

            $('#' + item).append(htmlBtn);
        },

        /**
         *
         * 点击发布，检查必填项是否全部填写
         *
         */
        ckEmpty: function (ckInputStr) {

            var editorSession = this.sessionArr,
                editorId = this.numberArr,
                editorItemName = this.p_option.itemName,
                editorInputStr = ckInputStr,
                str,
                input;

            if(ckInputStr) {
                loop:
                    for (var i = 0; i < editorId.length; i++) {

                        str = JSON.parse(editorSession.getItem(editorItemName + editorId[i]));

                        for (var j = 0; j < editorInputStr.length; j++) {

                            input = editorInputStr[j];
                            if (!str[input]) {

                                $('#' + editorItemName + editorId[i]).addClass('chooseItem').siblings().removeClass('chooseItem');
                                this.showContent();
                                $('#' + input)[0].focus();

                                this.ckEmptyStr = false;

                                break loop;
                            }
                        }

                        this.ckEmptyStr = true;

                    }
            }
        },

        /**
         *
         * 点击事件监听绑定
         *
         */
        listen: function () {

            this.$element.off("page-clicked");

            if (typeof (this.p_option.clickPage) === "function") {
                this.$element.bind("page-clicked", this.p_option.clickPage());
            }

            this.$element.bind("page-clicked", this.clickPage());
        },

        lastPage: '',

        /**
         *
         * 页面数量函数
         *
         */
        pageCount: function (listItem) {

            /*var lsStr = JSON.parse(localStorage.getItem(lsName+this.currentPage));*/

            var lsCount = 0,            // 数组中最大的Id值（暂时未使用）
                lsNumber,           //储存文章id的变量
                sortArr = [];           //排序文章

            //遍历session取出id值
            for (var i in this.sessionArr) {

                var reg = new RegExp(listItem + '([\\d]+)');

                try {

                    lsNumber = parseInt(i.match(reg)[1]);

                    if (!isNaN(lsNumber)) {

                        lsCount = (lsCount > lsNumber) ? lsCount : lsNumber;

                        sortArr.push(lsNumber);

                    }

                } catch (e) {
                    // 待抛出异常处理
                }

            }

            this.numberArr = sortArr.sort(function (a, b) {
                return a - b;
            });

            return this.numberArr.length;
        },

        /**
         *
         * 渲染添加文章的按钮并添加双向绑定
         *
         */
        showPage: function () {

            var i_name = this.p_option.itemName,
                pageCount = this.pageCount(i_name),         // 计算item的数量
                number = (this.p_option.maxPage < pageCount) ? this.p_option.maxPage : pageCount,        // 比较是否超出配置的item最大值
                addHtml = '<div class="add-item" id="add-item">' + '<a>+</a>' + '</div>';         // 添加按钮的html

            if (number) {

                //循环创建item
                for (var i = 0; i < number; i++) {

                    this.render(this.numberArr[i]);
                    this.showList(this.p_option.itemName + this.numberArr[i]);

                    if (!i) {

                        this.$element.find("div").first("div").addClass("first-item");
                        this.$element.find("div").first("div").addClass("chooseItem");
                        this.$element.find("div").first("div").find('a:first').attr('data-bind-0', 'name');         // 添加双向绑定

                        $('#' + this.ckBindId()).attr('data-bind-0', 'name');

                    }

                }
            } else {

                this.render(number);

                this.$element.find("div").first("div").addClass("chooseItem");          // 为第一条数据添加样式
                this.$element.find("div").first("div").addClass("first-item");

                // 如果没有数据，创建一条空数据
                this.numberArr.push(0);

            }

            this.$element.append(addHtml);          // 向div内添加html
        },

        /**
         *
         * item上下移动判断
         *
         */
        itemAction: function (id, action, itemFl) {

            var actionArr,          //动作类型
                contentStr = '是否删除文章',
                $this = this;

            console.log('id:' + id + ' action:' + action + ' itemFl' + itemFl);
            switch (action) {

                case 'up-item':

                    if (itemFl == 'first') {

                        console.log('不能向上移动');

                    } else {

                        var prevId = $('#' + id).prev('.list-item')[0].id;

                        actionArr = this.sessionArr.getItem(id);

                        this.sessionArr.setItem(id, this.sessionArr.getItem($('#' + id).prev('.list-item')[0].id));
                        this.sessionArr.setItem(prevId, actionArr);

                        this.showList(prevId);
                        this.showList(id);

                        $('#' + id).prev('.list-item').addClass("chooseItem").siblings().removeClass("chooseItem");

                        if ($('#' + id).prev('.list-item').prev('.list-item').length == 0) {

                            $('#' + id).prev('.list-item').addClass('first-item').siblings().removeClass("first-item");

                        }

                    }

                    $('#' + id).find('.item-cz').addClass("none");

                    break;

                case 'down-item':

                    if (itemFl == 'last') {

                        console.log('不能向下移动');

                    } else {

                        var nextId = $('#' + id).next('.list-item')[0].id;

                        actionArr = this.sessionArr.getItem(id);

                        this.sessionArr.setItem(id, this.sessionArr.getItem($('#' + id).next('.list-item')[0].id));
                        this.sessionArr.setItem(nextId, actionArr);

                        this.showList(nextId);
                        this.showList(id);

                        $('#' + id).next('.list-item').addClass("chooseItem").siblings().removeClass("chooseItem");

                    }

                    $('#' + id).find('.item-cz').addClass("none");

                    break;

                case 'delete-item':

                    var yes = 'yes-btn',
                        no = 'no-btn';

                    tools.isTip(contentStr, 'deleteMsg', id);
                    tools.isMask();

                    $('.control-window').bind("click", function (event) {

                        if (itemFl == 'first' && event.target.id === yes) {

                            $('#' + id).next('.list-item').addClass("chooseItem").siblings().removeClass("chooseItem");
                            $('#' + id).next('.list-item').addClass('first-item');
                            $('#' + id).remove();

                            $this.sessionArr.removeItem(id);
                            tools.isCheck('删除成功');
                            $this.showList(id);
                            $this.showContent();

                            tools.isEmpty();

                        } else if (itemFl == 'last' && event.target.id === yes) {

                            $('#' + id).prev('.list-item').addClass("chooseItem").siblings().removeClass("chooseItem");
                            $('#' + id).remove();

                            $this.sessionArr.removeItem(id);
                            tools.isCheck('删除成功');
                            $this.showList(id);
                            $this.showContent();
                            tools.isEmpty();

                        } else if (itemFl == 'normal' && event.target.id === yes) {

                            $('#' + id).prev('.list-item').addClass("chooseItem").siblings().removeClass("chooseItem");
                            $('#' + id).remove();

                            $this.sessionArr.removeItem(id);
                            tools.isCheck('删除成功');
                            $this.showList(id);
                            $this.showContent();
                            tools.isEmpty();

                        } else if (itemFl == 'only' && event.target.id === yes) {

                            $this.sessionArr.removeItem(id);
                            tools.isCheck('删除成功');
                            $this.showContent('only');
                            $this.showList(id,'only');
                            tools.isEmpty();

                        } else {
                            tools.isEmpty();
                        }

                    });
                    break;
            }

        },

        /**
         *
         * 绑定标题ID
         *
         */
        ckBindId: function () {

            if (typeof(this.p_option.bindId) == 'function') {

                return this.p_option.bindId();

            } else {

                return this.p_option.bindId;

            }

        },

        /**
         *
         * 添加文章函数
         *
         */
        clickPage: function () {

            var $this = this,
                itemId = this.$element.attr('id');

            this.$element.find('#add-item').on('click', function () {

                var add = $this.numberArr[$this.numberArr.length - 1] + 1;

                if ($this.numberArr.length < $this.p_option.maxPage) {

                    $this.render(add);          //添加item并渲染页面

                    for (var i = 0; i < $this.inputArr.length; i++) {

                        if ($('#' + $this.inputArr[i])[0].tagName === 'SELECT') {

                            $('#' + $this.inputArr[i] + 'option:first').prop("selected", 'selected');

                        } else if ($this.inputArr[i] === 'editor') {

                            UE.getEditor('editor').setContent("");

                        } else {

                            $('#' + $this.inputArr[i]).val('');

                        }
                    }

                    $this.numberArr.push(add);

                    $('#' + $this.p_option.itemName + add).click();

                } else {

                    console.log('>8');

                }

            });

            $('#' + itemId).on('click', '.list-item', function () {
                $('#save-btn').click(function () {
                    $this.ckContent();
                });
                $this.ckContent();          //保存数据
                $(this).addClass("chooseItem").siblings().removeClass("chooseItem");
                $this.showContent();            //读数据
                /*$(this).find('.item-cz').removeClass('none');*/
                $('.item-title').find('a:first').removeAttr('data-bind-0', 'name');          // 解除双向绑定
                $(this).find('.item-title').find('a:first').attr('data-bind-0', 'name');         // 添加双向绑定
                $('#' + $this.ckBindId()).attr('data-bind-0', 'name');           //双向绑定

                /*$('.chooseItem').find('.item-cz').removeClass('none');*/
                $('.chooseItem').mouseenter();

            });

            $('.left-list').on('mouseenter', '.chooseItem', function () {

                $(this).find('.item-cz').removeClass("none");

            }).on('mouseleave', '.chooseItem', function () {

                $(this).find('.item-cz').addClass("none");

            });

            $('#' + itemId).on('click', '.item-cz', function () {

                var id = $(this).parent('.list-item').attr('id'),
                    action = $(this).attr('id'),
                    itemFl;

                if ($(this).parent('.list-item').prev('.list-item').length == 0 && $(this).parent('.list-item').next('.list-item').length == 0) {

                    itemFl = 'only';

                } else if (!$(this).parent('.list-item').prev('.list-item').length) {

                    itemFl = 'first';

                } else if (!$(this).parent('.list-item').next('.list-item').length) {

                    itemFl = 'last';

                } else {

                    itemFl = 'normal';

                }
                $this.itemAction(id, action, itemFl);

                return false;
            });

            $("#myUpload").click(function () {
                var dialog = uploadEditor.getDialog("insertimage");
                dialog.title = '单图上传2';
                dialog.render();
                dialog.open();
            });

            $('input').blur(function () {
                $this.ckContent();
            });
            $('textarea').blur(function () {
                $this.ckContent();
            });
            $('#issue-btn').click(function () {
                $this.ckEmpty($this.p_option.checkInput);

            });

        },

        /**
         *
         * 页面渲染函数
         *
         */
        render: function (pageNumber) {

            var containerPage = '<div class="list-item" id=' + this.p_option.itemName + pageNumber + '>' +
                '<div class="item-title">' +
                '<a>标题</a>' +
                '</div>' +
                '<div class="item-img">' +
                '<img src="">' +
                '</div>' +
                '<div class="item-cz center none" id="delete-item">' +
                '<a  class="delete-item" >删除</a>' +
                '</div>' +
                '<div class="item-cz center none" id="up-item">' +
                '<a  class="up-item" >上移</a>' +
                '</div>' +
                '<div class="item-cz center none" id="down-item">' +
                '<a  class="down-item" >下移</a>' +
                '</div>' +
                '</div><!--list-item-->';

            if (this.$element.find('#add-item').length) {

                this.$element.find('#add-item').before(containerPage);
                this.$element.find(".list-item").last("div").addClass("chooseItem").siblings().removeClass("chooseItem");
                ++this.lastPage;

            } else {

                this.$element.append(containerPage);

            }

        },

    },

        $.fn.pageList = function (p_option) {

            var data = new PageList(this, p_option);


            // /待扩展
        };

    /**
     *
     * 默认配置
     *
     */
    $.fn.pageList.defaults = {

        itemName: 'list-editor-',           // 储存在session的名字

        maxPage: 8,                   // 最大页码

        chooseNewPage: false,        //

        sessionType: 1,             // 0:localStorage 1:sessionStorage

        clickPage: null,

        itemCode: 'A3306-',         // 特征码，防止session重复

        itemInput: 'editor-content',         //实例化input所在的div的id值

        checkInput: [],

        inputList: {

            "1": {"id": "postType", "name": "响应类型", "type": "select", "option1": "图文消息", "option2": "webview"},

            "2": {"id": "url", "name": "URL", "type": "input"},

            "3": {"id": "title", "name": "标题", "type": "input"},

            "4": {"id": "summary", "name": "摘要", "type": "textarea"}

        },

        bindId: function () {

            var inputTitle,
                _type = 'type',
                _id = 'id';

            $.each(this.inputList, function (k, v) {

                if (v[_type] == 'input') {

                    inputTitle = v[_id];

                    return false;

                }
            });
            return inputTitle;
        },

        ckPage: function (sessionType) {

            var _session = [];

            switch (sessionType) {

                case 0:
                    _session = sessionStorage;
                    return _session;

                case 1:
                    _session = localStorage;
                    return _session;

            }
        }
    };

    /**
     * 双向绑定
     * @param object_id
     * @returns {{callbacks: {}, on: pubSub.on, publish: pubSub.publish}}
     * @constructor
     */
    function DataBinder(object_id) {
        // Create a simple PubSub object
        var pubSub = {
                callbacks: {},

                on: function (msg, callback) {
                    this.callbacks[msg] = this.callbacks[msg] || [];
                    this.callbacks[msg].push(callback);
                },

                publish: function (msg) {
                    this.callbacks[msg] = this.callbacks[msg] || [];
                    for (var i = 0, len = this.callbacks[msg].length; i < len; i++) {
                        this.callbacks[msg][i].apply(this, arguments);
                    }
                }
            },

            data_attr = "data-bind-" + object_id,
            message = object_id + ":input",
            timeIn;

        /**
         * 对双向绑定的内容延迟50ms改变
         */
        changeHandler = function (evt) {
            var target = evt.target || evt.srcElement, // IE8 compatibility
                prop_name = target.getAttribute(data_attr);

            if (prop_name && prop_name !== "") {
                clearTimeout(timeIn);
                timeIn = setTimeout(function () {
                    pubSub.publish(message, prop_name, target.value);
                }, 50);

            }
        };

        // Listen to change events and proxy to PubSub
        if (document.addEventListener) {
            document.addEventListener("input", changeHandler, false);
        } else {
            // IE8 uses attachEvent instead of addEventListener
            document.attachEvent("oninput", changeHandler);
        }

        // PubSub propagates changes to all bound elements
        pubSub.on(message, function (evt, prop_name, new_val) {
            var elements = document.querySelectorAll("[" + data_attr + "=" + prop_name + "]"),
                tag_name;

            for (var i = 0, len = elements.length; i < len; i++) {
                tag_name = elements[i].tagName.toLowerCase();

                if (tag_name === "input" || tag_name === "textarea" || tag_name === "select") {
                    elements[i].value = new_val;
                } else {
                    elements[i].innerHTML = new_val;
                }
            }
        });

        return pubSub;
    }

    /**
     * 注册绑定id
     * @param uid
     * @returns {{attributes: {}, set: user.set, get: user.get, _binder: *}|*}
     * @constructor
     */
    function DBind(uid) {

        user = {
            // ...
            attributes: {},
            set: function (attr_name, val) {
                this.attributes[attr_name] = val;
                // Use the `publish` method
                binder.publish(uid + ":input", attr_name, val, this);
            },
            get: function (attr_name) {
                return this.attributes[attr_name];
            },

            _binder: binder
        };

        // Subscribe to the PubSub
        binder.on(uid + ":input", function (evt, attr_name, new_val, initiator) {
            if (initiator !== user) {
                user.set(attr_name, new_val);
            }
        });

        return user;
    }

    uploadEditor.ready(function () {
        uploadEditor.addListener('beforeinsertimage', function (t, arg) {
            //将地址赋值给相应的input,只去第一张图片的路径
            var imgs;

            for (var a in arg) {

                imgs += arg[a].src + ',';

            }

            $(".chooseItem").find('.item-img img')[0].src = arg[0].src;
            $('#save-btn').click();

        });

    });

    // 自定义按钮绑定触发多图上传和上传附件对话框事件


}(window.jQuery));