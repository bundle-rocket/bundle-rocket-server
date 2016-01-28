/**
 * @file mkdirp
 * @author leon(ludafa@outlook.com)
 */

const mkdirp = require('mkdirp');

module.exports = function (path) {

    return new Promise(function (resolve, reject) {

        mkdirp(path, function (error) {

            if (error) {
                reject(error);
                return;
            }

            resolve();

        });

    });

};
