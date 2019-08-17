function StorageSize(size) { // size单位为byte
    this._size = size;
}

StorageSize.prototype = {};

StorageSize.prototype.init = function() {
    this._t = Math.floor(this._size/(1024 * 1024 * 1024 * 1024));
    this._g = Math.floor(this._size/(1024 * 1024 * 1024)) - (this._t * 1024);
    this._m = Math.floor(this._size/(1024 * 1024)) - (this._t * 1024 * 1024) - (this._g * 1024);
    this._k = Math.floor(this._size/(1024)) - (this._t * 1024 * 1024 * 1024) - (this._g * 1024 * 1024) - (this._m * 1024);
};

StorageSize.prototype.t = function() {
    return this._t;
};

StorageSize.prototype.g = function() {
    return this._g;
};

StorageSize.prototype.m = function() {
    return this._m;
};

StorageSize.prototype.k = function() {
    return this._k;
};