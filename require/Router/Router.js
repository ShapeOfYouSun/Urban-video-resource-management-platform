function Router() {
    this.routes = {};
    this.currentUrl = '';
}

Router.prototype = {};

// public: 配置单个route值以及该route对应的handler
Router.prototype.route = function(path, callback) {
    this.routes[path] = callback || function() { console.log('route-path', path); };
};

// public: 配置多个route及其对应的handler
Router.prototype.routeArray = function(array) {
    let $this = this;
    array.forEach(function(value) { $this.route(value.path, value.callback); });
};

// private: 解析当前hash并指定对应的处理函数
Router.prototype.updateView = function() {
    console.log('hash change trigger ~');
    this.currentUrl = location.hash.slice(1) || '';
    this.routes[this.currentUrl] && this.routes[this.currentUrl]();
};

// public: 为当前Window绑定load事件以及hashchange事件
Router.prototype.init = function() {
    window.addEventListener('load', this.updateView.bind(this), false);
    window.addEventListener('hashchange', this.updateView.bind(this), false);
};

// public: 切换当前hash到某个值
Router.prototype.hashTo = function(newHash) {
    let crtHash = window.location.hash.slice(1);
    console.log('🐱 ~ hash changes: "' + crtHash + '" -> "' + newHash + '"');
    (crtHash === newHash) ? EventUtil.triggerEvent(window, 'hashchange') : window.location.hash = newHash;
};