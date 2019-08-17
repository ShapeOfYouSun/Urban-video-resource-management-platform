function Import(baseUrl) {
    this.baseUrl = baseUrl;
    this.configuration = {};
}

Import.prototype = {};

// public: 配置单个文件module和path
Import.prototype.config = function(module, path) {
    this.configuration[module] = path;
};

// public: 配置多个文件的module和path
Import.prototype.configArray = function(array) {
    let $this = this;
    array.forEach(function(value) { $this.config(value.module, value.path); })
};

// public: 导入某个已经配置的module
Import.prototype.import = function(module) {
    document.write('<script type="text/javascript" src="' + this.baseUrl + this.configuration[module] + '"></script>')
};

// public: import初始化函数
Import.prototype.init = function(module) {

};