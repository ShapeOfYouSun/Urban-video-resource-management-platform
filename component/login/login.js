window.$(function() {
    // login页面加载时, 如果sessionStorage中存有passport, 则利用该passport填充页面input username
    if (identifyWatcher.get('passport') !== null) {
        window.$('#input-username').val(identifyWatcher.get('passport'));
    }

    const page = {};

    Object.defineProperties(page, {
        passport: {
            get: function() {
                return window.$('#input-username').val();
            },
            set: function(newValue) {
                window.$('#input-username').val(newValue);
            }
        },
        password: {
            get: function() {
                return window.$('#input-password').val();
            },
            set: function(newValue) {
                window.$('#input-password').val(newValue);
            }
        }
    });

    // 登录按钮状态改变function: in-login/login
    function loginStatusConvert(type) {
        if (type === 'in-login') {
            window.$('#login-main-container button[type="submit"]').attr('disabled', true);
            window.$('#login-main-container button[type="submit"]').html(
                '<div class="spinner-border" role="status" style="width:1.2rem;height:1.2rem">' +
                '<span class="sr-only">Loading...</span>' +
                '</div><span>&nbsp;&nbsp;登录中...</span>'
            );
        } else {
            window.$('#login-main-container button[type="submit"]').removeAttr('disabled');
            window.$('#login-main-container button[type="submit"]').html('登录');
        }
    }

    // 密码输入框mouse down显示密码事件
    window.$('#password-viewer').unbind('mousedown').bind('mousedown', function(event) {
        event.preventDefault();
        event.stopPropagation();
        window.$('#password-viewer')
            .html('<i class="fas fa-eye"></i>');
        window.$('#input-password').attr('type', 'text');
    });

    // 密码输入框mouse up隐藏密码事件
    window.$('#password-viewer').unbind('mouseup').bind('mouseup', function(event) {
        event.preventDefault();
        event.stopPropagation();
        window.$('#password-viewer')
            .html('<i class="fas fa-eye-slash"></i>');
        window.$('#input-password').attr('type', 'password');
    });

    // 登录按钮事件
    window.$('form button[type="submit"]').unbind('click').bind('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (page.passport !== '' && page.password !== '') {
            $http.handle('login_in', {
                passport: page.passport,
                password: page.password
            }, function() { // before
                loginStatusConvert('in-login');
            }, function() { // complete
                loginStatusConvert('login');
            }, function(res) {
                let token = res.token, role = res.role;
                identifyWatcher.set('passport', page.passport);
                identifyWatcher.set('token', token);
                identifyWatcher.set('role', role);
                window.location.hash = 'fileManage';
            }, false);
        }
        else {
            if (page.passport === '') {
                window.$('#login-username').attr('class', 'invalid');
            }
            if (page.password === '') {
                window.$('#login-password').attr('class', 'invalid');
            }
        }
    });

    // 账号输入input property change事件
    window.$('#input-username').unbind('input propertychange').bind('input propertychange', function(event){
        event.preventDefault();
        event.stopPropagation();
        if (page.passport === '') {
            window.$('#login-username').attr('class', 'invalid');
        } else {
            window.$('#login-username').removeClass('invalid');
        }
    });

    // 密码输入input property change事件
    window.$('#input-password').unbind('input propertychange').bind('input propertychange', function(event){
        event.preventDefault();
        event.stopPropagation();
        if (page.password === '') {
            window.$('#login-password').attr('class', 'invalid');
        } else {
            window.$('#login-password').removeClass('invalid');
        }
    });
});