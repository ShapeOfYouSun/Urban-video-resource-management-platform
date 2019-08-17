// identifyWatcher: 监听用户身份以及登录信息 - role/token/passport
// index: 保存body加载的页面信息
// $router: 设置index的路由跳转信息
// roleRight: 保存角色菜单权限, 不可改
let identifyWatcher = null, index = {}, $router = null;
const roleComponentRight = {
    tourist: ['login'],
    user: ['login', 'fileManage', 'fileStream', 'taskManage', 'dataSearch', 'dataSubscribe', 'statistics', 'accountInfo', 'accountMsg'],
    organizer: ['login', 'fileManage', 'fileStream', 'taskManage', 'dataSearch', 'dataSubscribe', 'organizationManage', 'organizationPower', 'organizationEquipment', 'statistics', 'accountMsg'],
    operator: ['login', 'fileManage', 'fileStream', 'taskManage', 'userManage', 'userRegister', 'userLog', 'organizationManage', 'organizationEquipment', 'statistics', 'accountInfo'],
    admin: ['login', 'fileManage', 'fileStream', 'taskManage', 'userManage', 'userRegister', 'userLog', 'organizationManage', 'organizationEquipment', 'statistics'],
};

// 配置identifyWatcher的监听项
identifyWatcher = new Watcher();
identifyWatcher.init();
identifyWatcher.depend('role', function() { // role
    return window.sessionStorage.getItem('role');
}, function(newValue) {
    window.sessionStorage.setItem('role', newValue);
}).depend('token', function() { // token
    return window.sessionStorage.getItem('token');
}, function(newValue) {
    window.sessionStorage.setItem('token', newValue);
}).depend('passport', function() { // passport
    return window.sessionStorage.getItem('passport');
}, function(newValue) {
    window.sessionStorage.setItem('passport', newValue);
});

// 配置index的监听项
Object.defineProperties(index, {
    body: {
        get: function() {
            return window.$('#body').attr('data-body');
        },
        set: function(newValue) {
            let _load = function(path, complete) {
                $load.show();
                window.$('#body').load(path, function() {
                    complete.call(undefined);
                    $load.hide();
                });
            };
            let pageLoadFunction = {
                accountInfo: function() {
                    _load('component/accountInfo/accountInfo.html', function(){ console.log('😊 ~ accountInfo is loaded ~'); });
                },
                accountMsg: function() {
                    _load('component/accountMsg/accountMsg.html', function(){ console.log('😊 ~ accountMsg is loaded ~'); });
                },
                dataSearch: function() {
                    _load('component/dataSearch/dataSearch.html', function(){ console.log('😊 ~ dataSearch is loaded ~'); });
                },
                dataSubscribe: function() {
                    _load('component/dataSubscribe/dataSubscribe.html', function(){ console.log('😊 ~ dataSubscribe is loaded ~'); });
                },
                fileManage: function() {
                    _load('component/fileManage/fileManage.html', function(){ console.log('😊 ~ fileManage is loaded ~'); });
                },
                fileStream: function() {
                    _load('component/fileStream/fileStream.html', function(){ console.log('😊 ~ fileStream is loaded ~'); });
                },
                login: function() {
                    _load('component/login/login.html', function(){ console.log('😊 ~ login is loaded ~'); });
                },
                organizationManage: function() {
                    _load('component/organizationManage/organizationManage.html', function(){ console.log('😊 ~ organizationManage is loaded ~'); });
                },
                organizationPower: function() {
                    _load('component/organizationPower/organizationPower.html', function() { console.log('😊 ~ organizationPower is loaded ~'); });
                },
                organizationEquipment: function() {
                    _load('component/organizationEquipment/organizationEquipment.html', function() { console.log('😊 ~ organizationEquipment is loaded ~'); });
                },
                statistics: function() {
                    _load('component/statistics/statistics.html', function(){ console.log('😊 ~ statistics is loaded ~'); });
                },
                taskManage: function() {
                    _load('component/taskManage/taskManage.html', function(){ console.log('😊 ~ taskManage is loaded ~'); });
                },
                userLog: function() {
                    _load('component/userLog/userLog.html', function(){ console.log('😊 ~ userLog is loaded ~'); });
                },
                userManage: function() {
                    _load('component/userManage/userManage.html', function(){ console.log('😊 ~ userManage is loaded ~'); });
                },
                userRegister: function() {
                    _load('component/userRegister/userRegister.html', function(){ console.log('😊 ~ userManage is loaded ~'); });
                }
            };
            if (pageLoadFunction[newValue]) {
                pageLoadFunction[newValue].call(undefined);
                window.$('#body').attr('data-body', newValue);
            } else { throw new Error('Can not resolve the page variable: ' + newValue); }
        }
    }
});

// 配置$router的路由
let routerCallbackFactory = function(path) {
    return function() {
        if (identifyWatcher.get('token')) {
            if (roleComponentRight[identifyWatcher.get('role')].findIndex(function(element) {
                return element === path;
            }) !== -1) {
                index.body = path;
            } else {
                console.error('No Right to Visit Page `' + path + '` ~')
            }
        }
        else if (path === 'login') {
            index.body = 'login';
        } else {
            window.location.hash = 'login';
        }
    };
};
$router = new Router();
$router.init();
$router.routeArray([{
    path: '', callback: function() { $router.hashTo('login'); }
}, {
    path: 'accountInfo', callback: routerCallbackFactory('accountInfo'),
}, {
    path: 'accountMsg', callback: routerCallbackFactory('accountMsg'),
}, {
    path: 'dataSearch', callback: routerCallbackFactory('dataSearch'),
}, {
    path: 'dataSubscribe', callback: routerCallbackFactory('dataSubscribe'),
}, {
    path: 'fileManage', callback: routerCallbackFactory('fileManage'),
}, {
    path: 'fileStream', callback: routerCallbackFactory('fileStream'),
}, {
    path: 'login', callback: routerCallbackFactory('login'),
}, {
    path: 'organizationManage', callback: routerCallbackFactory('organizationManage'),
}, {
    path: 'organizationPower', callback: routerCallbackFactory('organizationPower'),
}, {
    path: 'organizationEquipment', callback: routerCallbackFactory('organizationEquipment'),
}, {
    path: 'statistics', callback: routerCallbackFactory('statistics'),
}, {
    path: 'taskManage', callback: routerCallbackFactory('taskManage'),
}, {
    path: 'userLog', callback: routerCallbackFactory('userLog'),
}, {
    path: 'userManage', callback: routerCallbackFactory('userManage'),
}, {
    path: 'userRegister', callback: routerCallbackFactory('userRegister'),
}]);

// Alert
const $alert = new Alert();
$alert.init();

// Load
const $load = new Load();
$load.init();

// Http
const $http = new HTTP();
$http.init();

// RandomString
const $randStr = new RandomString();
$randStr.init();

index.isValid = function(value) {
    return (value === undefined || value === null);
};

window.$(function() {
    // index page init
    window.$('#header').load('component/header/header.html', function() { console.log('😊 ~ header is 🆗'); });
    window.$('#footer').load('component/footer/footer.html', function() { console.log('😊 ~ footer is 🆗'); });
    // index页面加载时如果用户没有身份, 则身份为tourist
    if (identifyWatcher.get('role') === null) {
        identifyWatcher.set('role', 'tourist');
    }
});