/**
 * @file command mv
 * @author leon(ludafa@outlook.com)
 */

const fs = require('fs');

module.exports = function (from, to) {

    return new Promise(function (resolve, reject) {
        fs.rename(from, to, function (error) {

            if (error) {
                reject(error);
                return;
            }

            resolve();

        });
    });

};
