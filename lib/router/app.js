/**
 * @file app
 * @author leon(ludafa@outlook.com)
 */

const router = require('koa-router')();
const jwt = require('koa-jwt');
const {secret, key} = require('../../conf').jwt;
const App = require('../common/model/App');
const randomString = require('random-string');

// 这里是 jwt 的认证，如果没有带 jwt 的 access token 那么这货会丢异常
router.use(jwt({
    secret,
    key
}));

// 列出登录用户的 APP 列表
router.get('/app', function *() {

    const {id} = this.state[key];
    const {pageNum, pageSize} = this.query;

    try {

        const apps = yield App.list(id, pageNum, pageSize);

        this.body = apps;

    }
    catch (e) {
        this.status = 500;
        this.body = e.message;
        console.error(e.message, e.stack);
    }


});

// 获取 APP 的详细信息
router.get('/app/:name', function *() {

    const userId = this.state.jwt.id;
    const {name} = this.params;

    const app = yield App.getByName(name, userId);

    if (app) {
        this.body = JSON.stringify(app);
    }
    else {
        this.status = 404;
        this.body = 'Not Found';
    }

});

// 新建一个 APP
router.post('/app', function *() {

    const {id} = this.state[key];
    const {body = {}} = this.request;
    const appName = body.name;
    const secretKey = randomString({length: 30});
    let isExisted;
    let app;

    isExisted = yield App.getByName(appName, id);
    if (!isExisted) {
        app = yield App.add(id, appName, secretKey);
    }

    if (!app) {
        this.status = 422;
        this.body = 'Name Repetition';
        return;
    }

    this.body = app;

});

// 删除一个 APP
router.del('/app/:name', function *() {

    const {name} = this.params;
    const userId = this.state.jwt.id;
    let isExisted;
    let res;

    isExisted = yield App.getByName(name, userId);
    if (isExisted) {
        res = yield App.remove(name, userId);
    }

    if (!res) {
        this.status = 404;
        this.body = 'Not Found';
        return;
    }

    // 204表示不带实体的返回，通常用来表示删除数据成功
    this.status = 204;

});

module.exports = router;
