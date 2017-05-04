'use strict';

exports.wrapper = function (callback) {
    return function (err, data, res) {
        callback = callback || function () { };
        if (err) {
            err = 'BimartAPI' + err;
            return callback(err, data, res);
        }
        if (data && data.respCode !== "000000") {
            err = new Error(data.errmsg);
            err.name = 'BimartAPIError:' + data.respCode;
            err.code = data.respCode;
            return callback(err, data, res);
        }
        callback(null, data, res);
    };
};