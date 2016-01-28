/**
 * @file 服务器入口
 * @author leon(ludafa@outlook.com)
 */

const koa = require('koa');
const conf = require('../conf');
const app = koa();

const port = conf.server.port;

app.use(require('koa-logger')());
app.use(require('koa-body')({
    formidable: {
        uploadDir: require('path').join(__dirname, '../uploads'),
        hash: 'md5'
    },
    multipart: true
}));

const logger = require('./logger.js');

app.use(function* (next) {

    try {
        yield next;
    }
    catch (error) {
        logger.error(`[uncaught error]`, error.stack || error.message);
        throw error;
    }

});

app.use(require('./user').routes());
app.use(require('./bundle').routes());
app.use(require('./app').routes());

app.listen(port);

app.onerror = function (error) {
    console.error('321321', error.stack);
};

console.log(`bundle rocket server startup: http://localhost:${port}`);
