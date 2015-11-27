/**
 * @file 认证相关的 api 接口
 * @author leon(ludafa@outlook.com)
 */

const router = require('koa-router')();
const jwt = require('koa-jwt');
const User = require('../common/model/User');
const {secret, duration} = require('../../conf').jwt;

router.post('/login', function *() {

    const {body = {}} = this.request;

    const {email, password} = body;

    const user = yield User.authenticate(email, password);

    if (!user) {
        this.status = 401;
        this.body = 'authenticate failed';
        return;
    }

    const {id} = user;

    const token = jwt.sign(
        {id},
        secret,
        {expiresInSeconds: duration}
    );

    this.body = {token};

});

module.exports = router;
