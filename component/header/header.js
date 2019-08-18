//# sourceUrl=http://dynamicScript.com/xxx.js
// 控制菜单显示/隐藏的function
// 整个菜单 - tourist ? 不显示 : 显示
const headerWholeMenu = function() {
    console.log('😜 ~ headerWholeMenu ~');
    return identifyWatcher.get('role') !== 'tourist';
};

// 数据服务 - organizer ? 显示 : 不显示
const headerMenuDataService = function() {
    console.log('😜 ~ headerMenuDataService ~');
    return identifyWatcher.get('role') === 'organizer';
};

// 用户管理 - operator/admin ? 显示 : 不显示
const headerMenuUserManage = function() {
    console.log('😜 ~ headerMenuUserManage ~');
    return identifyWatcher.get('role') === 'operator'
    || identifyWatcher.get('role') === 'admin';
};

// 机构数据权限 - organizer ? 显示 : 不显示
const headerMenuOrganizationPower = function() {
    console.log('😜 ~ headerMenuOrganizationPower ~');
    return identifyWatcher.get('role') === 'organizer';
};

// 机构数据权限divider - organizer ? 显示 : 不显示
const headerMenuOrganizationManageDivider1st = function() {
    console.log('😜 ~ headerMenuOrganizationManageDivider1st ~');
    return identifyWatcher.get('role') === 'organizer';
};

// header菜单Chip
const headerMenuChip = new Chip('headerMenu', {
    template: '<ul c-bind="if:headerWholeMenu">' +
        '<li>' + // 视频管理
            '<div class="dropdown">' +
                '<a class="btn btn-secondary dropdown-toggle" role="button" id="video-manage-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-file-video"></i>视频管理</a>' +
                '<div class="dropdown-menu" aria-labelledby="video-manage-menu">' +
                    '<a class="dropdown-item" href="#fileManage" c-bind="text:fileManage"></a>' + // 视频文件管理
                    '<div class="dropdown-divider"></div>' +
                    '<a class="dropdown-item" href="#fileStream" c-bind="text:streamManage"></a>' + // 视频流管理
                '</div>' +
            '</div>' +
        '</li>' +
        '<li>' + // 任务管理
            '<div class="dropdown">' +
                '<a class="btn btn-secondary" href="#taskManage" role="button" id="task-manage-menu"><i class="fas fa-tasks"></i>任务管理</a>' +
            '</div>' +
        '</li>' +
        '<li c-bind="if:headerMenuDataService">' + // 数据服务
            '<div class="dropdown">' +
                '<a class="btn btn-secondary dropdown-toggle" role="button" id="data-service-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-database"></i>数据服务</a>' +
                '<div class="dropdown-menu" aria-labelledby="data-service-menu">' +
                    '<a class="dropdown-item" href="#dataSearch" c-bind="text:dataSearch"></a>' + // 数据检索
                    '<div class="dropdown-divider"></div>' +
                    '<a class="dropdown-item" href="#dataSubscribe" c-bind="text:dataSubscribe"></a>' + // 数据订阅
                '</div>' +
            '</div>' +
        '</li>' +
        '<li c-bind="if:headerMenuUserManage">' + // 用户管理
            '<div class="dropdown">' +
                '<a class="btn btn-secondary dropdown-toggle" role="button" id="user-manage-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-user-friends"></i>用户管理</a>' +
                '<div class="dropdown-menu" aria-labelledby="user-manage-menu">' +
                    '<a class="dropdown-item" href="#userManage" c-bind="text:userList"></a>' + // 用户一览
                    '<div class="dropdown-divider"></div>' +
                    '<a class="dropdown-item" href="#userRegister" c-bind="text:userRegister"></a>' + // 用户注册
                    '<div class="dropdown-divider"></div>' +
                    '<a class="dropdown-item" href="#userLog" c-bind="text:userLog"></a>' + // 用户日志
                '</div>' +
            '</div>' +
        '</li>' +
        '<li>' + // 机构管理
            '<div class="dropdown">' +
                '<a class="btn btn-secondary dropdown-toggle" role="button" id="organization-manage-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-sitemap"></i>机构管理</a>' +
                '<div class="dropdown-menu" aria-labelledby="organization-manage-menu">' +
                    '<a class="dropdown-item" href="#organizationManage" c-bind="text:organizationManage"></a>' + // 机构信息
                    '<div class="dropdown-divider" c-bind="if:headerMenuOrganizationManageDivider1st"></div>' +
                    '<a class="dropdown-item" href="#organizationPower" c-bind="text:organizationPower|if:headerMenuOrganizationPower"></a>' + // 数据权限
                    '<div class="dropdown-divider"></div>' +
                    '<a class="dropdown-item" href="#organizationEquipment" c-bind="text:organizationEquipment"></a>' + // 设备管理
                '</div>' +
            '</div>' +
        '</li>' +
        '<li>' + // 统计情况
            '<div class="dropdown">' +
                '<a class="btn btn-secondary" href="#statistics" role="button" id="statistics-menu"><i class="fas fa-chart-line"></i>统计情况</a>' +
            '</div>' +
        '</li>' +
    '</ul>',
    beforeCreate: undefined,
    beforeMount: undefined,
    beforeRemove: undefined,
    beforeDestroy: undefined,
    watcher: identifyWatcher,
    data: {
        // 一级菜单, 包括个人中心
        videoManage: '视频管理',
        taskManage: '任务管理',
        dataService: '数据服务',
        userManage: '用户管理',
        statistics: '统计情况',
        userHub: '个人中心',
        // 二级菜单, 包括个人中心
        fileManage: '视频文件管理',
        streamManage: '视频流管理',
        dataSearch: '数据检索',
        dataSubscribe: '数据订阅',
        organizationManage: '机构信息',
        organizationPower: '数据权限',
        organizationEquipment: '设备管理',
        userList: '用户一览',
        userRegister: '用户注册',
        userLog: '用户日志',
        accountInfo: '我的资料',
        accountMsg: '我的消息',
        logOut: '退出登录',
        // 验证菜单元素是否展示的方法
        headerWholeMenu: headerWholeMenu,
        headerMenuDataService: headerMenuDataService,
        headerMenuUserManage: headerMenuUserManage,
        headerMenuOrganizationPower: headerMenuOrganizationPower,
        headerMenuOrganizationManageDivider1st: headerMenuOrganizationManageDivider1st,
    },
});

// 个人中心控制显示/隐藏的function
// 个人中心菜单 - tourist: 隐藏, admin/organizer/operator: 显示
const headerAccountWhole = function() {
    console.log('😜 ~ headerAccountWhole ~');
    return identifyWatcher.get('role') === 'organizer'
        || identifyWatcher.get('role') === 'operator'
        || identifyWatcher.get('role')=== 'admin';
};

// `我的资料`下拉菜单 - operator/organizer ? 显示 : 不显示
const headerAccountInfo = function() {
    console.log('😜 ~ headerAccountInfo ~');
    return identifyWatcher.get('role') === 'operator' || identifyWatcher.get('role') === 'organizer';
};

// `我的消息`下拉菜单 - admin/operator: 隐藏, organizer: 显示
const headerAccountMsg = function() {
    console.log('😜 ~ headerAccountMsg ~');
    return identifyWatcher.get('role') === 'organizer';
};

// 第一个下拉菜单分割线: dropdown-divider - operator/organizer ? 显示 : 不显示
const headerAccountDivider1st = function() {
    console.log('😜 ~ headerAccountDivider1st ~');
    return identifyWatcher.get('role') === 'operator' || identifyWatcher.get('role') === 'organizer';
};

// 第二个下拉菜单分隔线: dropdown-divider - organizer ? 显示 : 不显示
const headerAccountDivider2rd = function() {
    console.log('😜 ~ headerAccountDivider2rd ~');
    return identifyWatcher.get('role') === 'organizer';
};

// 个人中心Chip
const headerAccountChip = new Chip('headerAccount', {
    template: '<div class="dropdown" c-bind="if:headerAccountWhole">' + // 个人中心
        '<a class="btn btn-secondary dropdown-toggle" role="button" id="account-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-user-circle"></i>个人中心</a>' +
        '<div class="dropdown-menu" aria-labelledby="account-menu">' +
            '<a class="dropdown-item" href="#accountInfo" c-bind="text:accountInfo|if:headerAccountInfo"></a>' + // 我的资料
            '<div class="dropdown-divider" c-bind="if:headerAccountDivider1st"></div>' +
            '<a class="dropdown-item" href="#accountMsg" c-bind="text:accountMsg|if:headerAccountMsg"></a>' + // 我的消息
            '<div class="dropdown-divider" c-bind="if:headerAccountDivider2rd"></div>' +
            '<a class="dropdown-item" href="#login" c-bind="text:logOut"></a>' + // 退出登录
        '</div>' +
    '</div>',
    beforeCreate: undefined,
    beforeMount: undefined,
    beforeRemove: undefined,
    beforeDestroy: undefined,
    watcher: identifyWatcher,
    data: {
        // 个人中心菜单
        accountInfo: '我的资料',
        accountMsg: '我的消息',
        logOut: '退出登录',
        // 控制菜单显示/隐藏的function
        headerAccountWhole: headerAccountWhole,
        headerAccountInfo: headerAccountInfo,
        headerAccountMsg: headerAccountMsg,
        headerAccountDivider1st: headerAccountDivider1st,
        headerAccountDivider2rd: headerAccountDivider2rd,
    }
});

headerMenuChip.init();
headerAccountChip.init();

window.$(function() {
    headerMenuChip.appendTo(window.$('#header-container > .header-menu'));
    headerAccountChip.appendTo(window.$('#header-container > .header-account'));

    /**
     * upgrade-version: 如果有事件, 可以为菜单加一个active状态, 区别当前活跃的菜单和不活跃的菜单
     */

    // 退出登录绑定事件, 清除用户token, 将role设置为tourist
    window.$('a[href="#login"]').unbind('click').bind('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        $http.handle('login_out', {
            token: identifyWatcher.get('token')
        }, undefined, undefined, function(res) {
            identifyWatcher.set('token', null);
            identifyWatcher.set('role', 'tourist');
            window.location.hash = 'login';
        }, true);
    });
});