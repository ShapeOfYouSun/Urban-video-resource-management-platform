// generate random string
function RandomString(){

}

RandomString.prototype = {};

RandomString.prototype.init = function() {
    this._arr = ['0','1','2','3','4','5','6','7','8','9',
        'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
        'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
};

RandomString.prototype.generate = function(len) {
    let str = '', pos;
    for (let i = 0; i < len; i++) {
        pos = Math.round(Math.random() * (this._arr.length - 1));
        str += this._arr[pos];
    }
    return str;
};