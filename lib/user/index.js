/**
 * @file user
 * @author leon(ludafa@outlook.com)
 */

const router = require('koa-router')();
const User = require('../common/model/User.js');

const jwt = require('koa-jwt');
const {secret, duration} = require('../../conf').jwt;

router.post('/access-token', function *() {

    const {body = {}} = this.request;

    const {email, password} = body;

    const user = yield User.authenticate(email, password);

    if (!user) {
        this.status = 401;
        this.body = {
            status: 401,
            message: 'Email or password invalid'
        };
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

router.post('/users', function* () {

    const {body = {}} = this.request;

    const {name, email, password} = body;

    try {

        const user = yield User
            .build({
                name,
                email,
                password
            })
            .save();

        const {id} = user
            .get({
                plain: true
            });

        this.status = 200;

        this.body = {
            id,
            name,
            email
        };

    }
    catch (e) {
        this.status = 409;
        this.body = {
            status: 409,
            message: `Email[${email}] has been token`
        };
    }

});

module.exports = router;
