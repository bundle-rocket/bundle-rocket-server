/**
 * @file register action
 * @author leon(ludafa@outlook.com)
 */

const router = require('koa-router')();
const User = require('../common/model/User.js');
const crypto = require('crypto');

router.post('/register', function *() {

    const {body = {}} = this.request;


    const {name, email, password} = body;

    console.log(name, email, password);

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
        this.body = '您的邮箱已经被注册了，请换个邮箱试试';
        console.error(e.stack);
    }

});


module.exports = router;
