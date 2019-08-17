function Alert() {}

Alert.prototype = {};

Alert.prototype.init = function() {
    this.$message = window.$('<div class="alert alert-primary" role="alert"></div>');
    this.$success = window.$('<div class="alert alert-success" role="alert"></div>');
    this.$warning = window.$('<div class="alert alert-warning" role="alert"></div>');
    this.$error = window.$('<div class="alert alert-danger" role="alert"></div>');
};

Alert.prototype._alert = function($elt) {
    $elt.attr('style', 'position: fixed;bottom: 18px;margin: 0;height: 50px;width: 300px;right: 28px;text-align: center;z-index:999999999').appendTo(window.$('body'));
    window.setTimeout(function() {
        $elt.fadeOut(function(){ $elt.remove(); });
    }, 800);
};

Alert.prototype.message = function(message) {
    this._alert(this.$message.html(message));
};

Alert.prototype.success = function(message) {
    this._alert(this.$success.html(message));
};

Alert.prototype.warning = function(message) {
    this._alert(this.$warning.html(message));
};

Alert.prototype.error = function(message) {
    this._alert(this.$error.html(message));
};