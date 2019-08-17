function Time(time) { // time为毫秒值
    this._time = time;
}

Time.prototype = {};

Time.prototype.init = function() {
    this._year = Math.floor(this._time/(365 * 24 * 60 * 60 * 1000));
    this._month = Math.floor(this._time/(30 * 24 * 60 * 60 * 1000)) - (this._year * 12);
    this._day = Math.floor(this._time/(24 * 60 * 60 * 1000)) - (this._year * 365) - (this._month * 30);
    this._hour = Math.floor(this._time/(60 * 60 * 1000)) - (this._year * 365 * 24) - (this._month * 30 * 24) - (this._day * 24);
    this._minute = Math.floor(this._time/(60 * 1000)) - (this._year * 365 * 24 * 60) - (this._month * 30 * 24 * 60) - (this._day * 24 * 60) - (this._hour * 60);
    this._second = Math.floor(this._time/(1000)) - (this._year * 365 * 24 * 60 * 60) - (this._month * 30 * 24 * 60 * 60) - (this._day * 24 * 60 * 60) - (this._hour * 60 * 60) - (this._minute * 60);
};

Time.prototype.year = function() { return this._year; };

Time.prototype.month = function() { return this._month; };

Time.prototype.day = function() { return this._day; };

Time.prototype.hour = function() { return this._hour; };

Time.prototype.minute = function() { return this._minute; };

Time.prototype.second = function() { return this._second; };
