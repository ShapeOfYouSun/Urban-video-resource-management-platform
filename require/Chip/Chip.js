/**
 * c-bind="if:xxx"
 * c-bind="value:xxx"
 * c-bind="text:xxx"
 * c-bind="html:xxx"
 * c-bind="click:functionName"
 * c-bind="if:xxx|value:xxx" 多个以`|`隔开
 * (事件绑定稍后再说, 需要一个加一个吧, 😔)
 * @param name
 * @param config
 * @constructor
 */
function Chip(name, config) {
    this.name = name; // (*) chip的唯一标识, 可能会维护一个队列来保存那些可以复用的chip
    this.template = config.template; // string ~ required
    this.beforeCreate = config.beforeCreate && config.beforeCreate.bind(this);
    this.beforeMount = config.beforeMount && config.beforeMount.bind(this);
    this.beforeRemove = config.beforeRemove && config.beforeRemove.bind(this);
    this.beforeDestroy = config.beforeDestroy && config.beforeDestroy.bind(this);
    this.watcher = config.watcher; // 如果传递的绑定的值有为function, 则使用此watcher来进行监听, 否则当function返回值变化时, 不能同步更新页面状态
    this._tempData_ = config.data || {}; // Object
    this.$Elt = null;
    this.data = {};
}

// 指令处理函数
Chip.bindHandler = {
    if: function($elt, value){
        if (this._tempData_.hasOwnProperty(value)) { // 如果当前data中没有需要的value, 则if指令不生效
            let $this = this;
            Object.defineProperty($this.data, value, {
                get: function() {
                    return $elt.is(':visible');
                },
                set: function(newValue) {
                    let oldFunc = $elt.data('func');
                    if (oldFunc) { $this.watcher.release(oldFunc); } // 如果该元素之前if指令绑定的是函数, 则释放该函数的绑定
                    if (typeof newValue === 'function') { // 如果if指令新值为function, watcher会监听这个新function
                        $this.watcher.watch(newValue, $this.watcher.dependencyNames, function() {
                            let temp = newValue.call($elt);
                            temp ? $elt.show() : $elt.hide();
                        });
                        $elt.data('func', newValue); // 如果if指令新值为function, 会将这个function
                        let temp = newValue.call($elt); // 设置新值为function时不会触发watcher, 需要手动刷新
                        temp ? $elt.show() : $elt.hide();
                    } else {
                        !!newValue ? $elt.show() : $elt.hide();
                    }
                }
            });
            this.data[value] = this._tempData_[value];
        }
    },
    value: function($elt, value){
        if (this._tempData_.hasOwnProperty(value)) { // 传入的data中需要有当前value, value指令才会生效
            let $this = this;
            Object.defineProperty($this.data, value, {
                get: function() {
                    return $elt.val();
                },
                set: function(newValue) {
                    let oldFunc = $elt.data('func');
                    if (oldFunc) { $this.watcher.release(oldFunc); }
                    $elt.data('func', undefined);
                    if (typeof newValue === 'function') {
                        $this.watcher.watch(newValue, $this.watcher.dependencyNames, function() {
                            $elt.val(newValue.call($elt))
                        });
                        $elt.data('func', newValue);
                        $elt.val(newValue.call($elt));
                    } else {
                        $elt.val(newValue);
                    }
                }
            });
            this.data[value] = this._tempData_[value];
        }
    },
    text: function($elt, value){
        if (this._tempData_.hasOwnProperty(value)) { // 传入的data中需要有当前value, text指令才会生效
            let $this = this;
            Object.defineProperty($this.data, value, {
                get: function() {
                    return $elt.text();
                },
                set: function(newValue) {
                    let oldFunc = $elt.data('func');
                    if (oldFunc) { $this.watcher.release(oldFunc); }
                    $elt.data('func', undefined);
                    if (typeof newValue === 'function') {
                        $this.watcher.watch(newValue, $this.watcher.dependencyNames, function() {
                            $elt.text(newValue.call($elt))
                        });
                        $elt.data('func', newValue);
                        $elt.text(newValue.call($elt))
                    } else {
                        $elt.text(newValue);
                    }
                }
            });
            this.data[value] = this._tempData_[value];
        }
    },
    html: function($elt, value){
        if (this._tempData_.hasOwnProperty(value)) { // 传入的data中需要有当前value, html指令才会生效
            let $this = this;
            Object.defineProperty($this.data, value, {
                get: function() {
                    return $elt.html();
                },
                set: function(newValue) {
                    let oldFunc = $elt.data('func');
                    if (oldFunc) { $this.watcher.release(oldFunc); }
                    $elt.data('func', undefined);
                    if (typeof newValue === 'function') {
                        $this.watcher.watch(newValue, $this.watcher.dependencyNames, function() {
                            $elt.html(newValue.call($elt))
                        });
                        $elt.data('func', newValue);
                        $elt.html(newValue.call($elt))
                    } else {
                        $elt.html(newValue);
                    }
                }
            });
            this.data[value] = this._tempData_[value];
        }
    },
    click: function($elt, value){
        if (this._tempData_.hasOwnProperty(value)) {
            let $this = this;
            Object.defineProperty($this.data, value, {
                get: function() {
                    return $elt.onclick;
                },
                set: function(newValue) {
                    $elt.unbind('click').bind('click', newValue.bind($elt));
                }
            });
            this.data[value] = this._tempData_[value];
        }
    }
};

Chip.prototype = {};

// init一个Chip对象, 如果beforeCreate返回false, 则创建一个null对象, 可以使用$clip.isNull()来判断是否创建成功, 此方法会解析template中的伪属性
Chip.prototype.init = function() {
    let temp = true;
    if (this.beforeCreate) { temp = this.beforeCreate.call(this); }
    temp ? this.$Elt = window.$(this.template) : this.$Elt = null;
    if (!this.isNull()) {
        let $tempEltParent = window.$('<div></div>').append(this.$Elt), $this = this;
        $tempEltParent.find('[c-bind]').each(function(index, elt) {
            window.$(elt).attr('c-bind').split('|').forEach(function(element) {
                let cBindArray = element.split(':'), cBindKey = cBindArray[0], cBindValue = cBindArray[1];
                Chip.bindHandler[cBindKey] && Chip.bindHandler[cBindKey].call($this, window.$(elt), cBindValue);
            });
        });
    }
};

// 将当前Clip添加为一个jQuery对象的最后一个child, 如果beforeMount返回false, 则添加失败
Chip.prototype.appendTo = function($jQueryElt) {
    let temp = true;
    if (this.beforeMount) { temp = this.beforeMount.call(this); }
    temp && this.$Elt.appendTo($jQueryElt);
};

// 将当前Clip从DOM树中移除, 如果beforeRemove返回false, 则移除失败
Chip.prototype.remove = function() {
    let temp = true;
    if (this.beforeRemove) { temp = this.beforeRemove.call(this); }
    temp && this.$Elt.remove();
};

// 销毁当前Clip对象, 如果beforeDestroy返回false, 则销毁失败, 谨慎使用, 如果当前对象正在被使用, 不建议销毁
Chip.prototype.destroy = function() {
    let temp = true;
    if (this.beforeDestroy) { temp = this.beforeDestroy.call(this); }
    temp && (this.$Elt = null);
};

// 检测一个Clip对象是否为null
Chip.prototype.isNull = function() {
    return this.$Elt === null;
};

