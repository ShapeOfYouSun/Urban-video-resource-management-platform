function Load() {}

Load.prototype = {};

Load.prototype.init = function() {
    this.$cover = window.$('<div class="spinner-cover"></div>')
        .attr('style', 'position: fixed;width: 200%;height: 999999px;top: -5px;left: -5px;z-index: 100;background-color: rgba(0,0,0,0.3);');
    this.$load = window.$('<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>')
        .attr('style', 'position: fixed;top: calc(50% - 25px);left: calc(50% - 25px);height: 50px;width: 50px;');
};

Load.prototype.show = function() {
    this.$cover.appendTo(window.$('body'));
    this.$load.appendTo(window.$('body'));
};

Load.prototype.hide = function() {
    let $this = this;
    this.$load.fadeOut(function() { $this.$load.remove(); });
    this.$cover.fadeOut(function(){ $this.$cover.remove(); });
};