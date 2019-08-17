function Watcher() {
    this.dependencies = {};
    this.callback = {};
    this.dependencyNames = [];
}

Watcher.prototype = {};

Watcher.prototype.init = function() {

};

Watcher.prototype.get = function(name) {
    return this.dependencies[name];
};

Watcher.prototype.set = function(name, newValue) {
    this.dependencies[name] = newValue;
};

Watcher.prototype.depend = function(name, getter, setter) {
    let $this = this;
    this.dependencyNames.push(name);
    this.callback[name] = {};
    Object.defineProperty(this.dependencies, name, {
        get: function(){
            return getter.call(undefined);
        },
        set: function(newValue){
            setter.call(undefined, newValue);
            if ($this.callback[name]) {
                let tempCallback = $this.callback[name];
                for (let key in tempCallback) {
                    tempCallback.hasOwnProperty(key) && tempCallback[key].call(undefined);
                }
            }
        }
    });
    return this;
};

Watcher.prototype.watch = function(func, dependencies, callback) { // 参数func为本身, 即key: func, value: callback. 如果func"相同", 会产生覆盖
    let $this = this;
    dependencies.forEach(function(element) {
        $this.callback[element][func] = callback; // BUG: 这里会有一个bug, 如果func相同会覆盖
    });
};

Watcher.prototype.release = function(func) {
    for (let key in this.callback) {
        if (this.callback.hasOwnProperty(key)) {
            for (let name in this.callback[key]) {
                if (name === func && this.callback[key].hasOwnProperty(name)) {
                    delete this.callback[key][name];
                }
            }
        }
    }
};