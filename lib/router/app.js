/**
 * @file app
 * @author leon(ludafa@outlook.com)
 */

const router = require('koa-router')();
const jwt = require('koa-jwt');
const {secret, key} = require('../../conf').jwt;
const App = require('../common/model/App');
const randomString = require('random-string');

const APP_LIST = [{
    id: 1,
    name: 'test'
}, {
    id: 2,
    name: 'test2'
}];

// 这里是 jwt 的认证，如果没有带 jwt 的 access token 那么这货会丢异常
router.use(jwt({
    secret,
    key
}));

router.get('/app', function *() {

    const {id} = this.state[key];

    try {

        const apps = yield App.list(id);

        this.body = apps;

    }
    catch (e) {
        this.status = 500;
        this.body = e.message;
        console.error(e.message, e.stack);
    }


});

router.get('/app/:id', function *() {

    const {id} = this.params;
    const userId = this.state.jwt.id;

    const app = yield App.get(id, userId);

    if (app) {
        this.body = JSON.stringify(app);
    }
    else {
        this.status = 404;
    }

});

router.post('/app', function *() {

    const {id} = this.state[key];
    const {body = {}} = this.request;
    const appName = body.name;
    const secretKey = randomString({length: 30});

    const app = yield App.add(id, appName, secretKey);

    if (!app) {
        this.status = 500;
        this.body = 'Internal Server Error';
        return;
    }

    this.body = app;

});

router.del('/app/:id', function *() {

    const {id} = this.params;
    const userId = this.state.jwt.id;

    const res = yield App.remove(id, userId);

    if (!res) {
        this.status = 500;
        this.body = 'Internal Server Error';
        return;
    }

    this.status = 204;

});

module.exports = router;
