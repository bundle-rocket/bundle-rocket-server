/**
 * @file 所有 api 的集合呀
 * @author leon(ludafa@outlook.com)
 */

const app = require('./app.js');
const authenticate = require('./authenticate.js');
const web = require('./web.js');

exports.mount = (server) => {

    [app, authenticate, web].reduce(
        function (server, router) {
            server.use(router.routes());
            server.use(router.allowedMethods());
            return server;
        },
        server
    );

};
