
    var cs_html;
    $('.cs_selection').on('click',function () {
        $(this).addClass('choose').siblings().removeClass('choose');
        cs_html = $(this)[0].innerHTML;
    });

    dialog.onok = function(){
        // 插入内容到编辑器
        editor.execCommand('inserthtml',cs_html);
    }


