/**
 * @file app
 * @author leon(ludafa@outlook.com)
 */

const router = require('koa-router')();
const jwt = require('koa-jwt');

const APP_LIST = [{
    id: 1,
    name: 'test'
}, {
    id: 2,
    name: 'test2'
}];

// 这里是 jwt 的认证，如果没有带 jwt 的 access token 那么这货会丢异常
router.use(jwt({
    secret: 'ludafa'
}));

router.get('/app', function *() {
    this.body = JSON.stringify(APP_LIST);
});

router.get('/app/:id', function *() {

    const {id} = this.query;

    const app = APP_LIST.filter((app) => {
        return app.id !== id;
    })[0];

    if (app) {
        this.body = JSON.stringify(app);
    }
    else {
        this.status = 404;
    }

});

module.exports = router;
