/**
 * a linkage-select tool
 * */

function LinkageSelect(name, search, title, linkage, linkageFunc, itemConfig, initOptions, initValue, id, clazz, onSelect){
    this._name = name; // .layui-input-block的name属性
    this._search = search; // 是否需要添加检索功能, 一般为true
    this._title = title; // .layui-input-block的title属性
    this._linkage = linkage; // undefined
    this._linkageFunc = linkageFunc; // 联动下拉框中提供options的函数
    this._itemConfig = itemConfig || { value: 'value', text: 'text' }; // options中的字段名称
    this._initOptions = initOptions; // options中的字段值
    this._initValue = initValue; // 初始值
    this._id = id; // .layui-input-block的id
    this._clazz = clazz; // .layui-input-block的class
    this._onSelect = onSelect; // select的onSelect监听事件
}

LinkageSelect.prototype = {};

LinkageSelect.prototype.init = function() {
    this._filter = $randStr.generate(6);
};

// create a linkage select
LinkageSelect.prototype.create = function($elt) {
    let $this = this;
    this.$sc = window.$('<div></div>').addClass('layui-input-block').append(window.$('<select></select>')); // 下拉框select div
    if (!!this._name) { this.$sc.find('select').attr('name', this._name); }
    this.$sc.find('select').attr('lay-verify', '');
    if (!!this._search) { this.$sc.find('select').attr('lay-search', ''); this.$sc.find('select').append(window.$('<option></option>').attr('value', '').text('直接选择或搜索选择')); }
    if (!!this._title) { this.$sc.find('select').attr('title', this._title); }
    this.$sc.find('select').attr('lay-filter', this.$sc._filter);
    if (!!this._linkageFunc) { if (!this._initOptions || this._initOptions.length === 0) { this._initOptions = this._linkageFunc.call(this); } }
    if (!!this._initOptions) { this.options(this._initOptions); }
    if (!!this._initValue) { this.$sc.find('select').val(this._initValue); }
    if (!!this._id) { this.$sc.attr('id', this._id); }
    if (!!this._clazz) { this.$sc.addClass(this._clazz); }
    this.$sc.find('select').attr('lay-filter', this._filter);
    if ($elt) { this.appendTo($elt); }
    layui.use('form', function() {
        let form = layui.form;
        form.render();
        if (!!$this._onSelect) {
            form.on('select(' + $this._filter + ')', $this._onSelect);
        }
    });
};

// 变换select的选择项
LinkageSelect.prototype.options = function(options) {
    let $this = this;
    if (!!this._search) { this.$sc.find('select').html('<option value="">直接选择或搜索选择</option>'); }
    else { this.$sc.find('select').html(''); }
    options.forEach(function(currentValue) {
        $this.$sc.find('select').append(window.$('<option></option>').attr('value', currentValue[$this._itemConfig.value]).text(currentValue[$this._itemConfig.text]));
    });
    this._render();
};

// 重新渲染link age select
LinkageSelect.prototype._render = function() {
    layui.use('form', function() {
        let form = layui.form;
        form.render();
    });
};

LinkageSelect.prototype.appendTo = function($elt) {
    this.$sc.appendTo($elt);
    this._render(); // 绑定到页面后需要渲染
};

LinkageSelect.prototype.replace = function($elt) {
    $elt.replaceWith(this.$sc);
    this._render();
};

LinkageSelect.prototype.val = function(id) {
    this.$sc.find('select').val(id);
    this._render();
};