/**
* Copyright 2014 Baidu Inc. All rights reserved.
*
* @file bundle-rocket-server 主入口
* @author leon <ludafa@outlook.com>
*/

require('babel-core/register');

const koa = require('koa');
const conf = require('../conf');
const app = koa();

const port = conf.server.port;

const router = require('./router');

app.use(require('koa-logger')());
app.use(require('koa-bodyparser')());

app.use(function *(next) {

    try {
        yield next;
    }
    catch (error) {
        if (error.status === 401) {
            this.status = 401;
            this.body = 'authenticate failed.';
        }
        else {
            throw error;
        }
    }

});

router.mount(app);

app.use(require('./register').routes());

app.listen(port);

console.log(`bundle rocket server startup: http://localhost:${port}`);
