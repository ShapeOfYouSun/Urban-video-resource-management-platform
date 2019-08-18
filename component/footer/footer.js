// 未登录时的footer Chip
// 未登录时的footer chip的控制显示/隐藏的function - 当且仅当tourist: 显示, 其它情况下隐藏
const footerNoLoginFunction = function() {
    console.log('😜 ~ footerNoLoginFunction ~');
    return identifyWatcher.get('role') === 'tourist';
};

const footerNoLoginChip = new Chip('footerNoLoginChip', {
    template: '<div id="no-login-footer" c-bind="text:noLoginText|if:footerNoLoginFunction"></div>',
    beforeCreate: undefined,
    beforeMount: undefined,
    beforeRemove: undefined,
    beforeDestroy: undefined,
    watcher: identifyWatcher,
    data: {
        noLoginText: 'CopyRight DataLake All Right Reserved.2019',
        footerNoLoginFunction: footerNoLoginFunction,
    }
});

// 登录时的footer Chip
// 登陆时的footer Chip的控制显示/隐藏的function - user/organizer/operator/admin: 显示, tourist: 隐藏
const footerLoginFunction = function() {
    console.log('😜 ~ footerLoginFunction ~');
    return identifyWatcher.get('role') === 'user' ||
        identifyWatcher.get('role') === 'organizer' ||
        identifyWatcher.get('role') === 'operator' ||
        identifyWatcher.get('role') === 'admin';
};

const footerLoginChip = new Chip('footerLoginChip', {
    template: '<div id="login-footer" c-bind="if:footerLoginFunction">' +
        '<div class="footTop">' +
            '<div class="footMiddle">' +
                '<img src="static/image/logoFooter.png"/>' +
                '<span style="font-size: 20px;display: inline-block;height: 48px;line-height: 48px;color: #4abdf1;margin-left: 5px;">城市视频管理平台</span>' +
                '<div class="footText">' +
                    '<p class="lh footerLinkTitle mt1">联系我们</p>' +
                    '<p class="lh footLinkTitle1">总部：北京市石景山区阜石路165号中国华录大厦</p>' +
                    '<p class="lh footLinkTitle1">电话：（8610）52281111</p>' +
                    '<p class="lh footLinkTitle1">传真：（8610）52281188</p>' +
                    '<p class="lh footLinkTitle1">邮编：100043</p>' +
                '</div>' +
            '</div>' +
            '<div class="footRight">' +
                '<img class="footBg" src="static/image/logo03.png"/>' +
                '<img class="footScroe" src="static/image/QR Code.png"/>' +
            '</div>' +
        '</div>' +
        '<div class="footBottom"><p class="textBottom">Copyright © 2013-2017 ehualu.com All rights reserved　京ICP备05016422　京公网安备1101070200132</p></div>' +
    '</div>',
    beforeCreate: undefined,
    beforeMount: undefined,
    beforeRemove: undefined,
    beforeDestroy: undefined,
    watcher: identifyWatcher,
    data: {
        // 控制footerLoginChip显示与隐藏的函数
        footerLoginFunction: footerLoginFunction,
    }
});

footerNoLoginChip.init();
footerLoginChip.init();

window.$(function() {
    footerNoLoginChip.appendTo(window.$('#footer-container'));
    footerLoginChip.appendTo(window.$('#footer-container'));
});