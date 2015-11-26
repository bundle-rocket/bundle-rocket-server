/**
 * @file web api
 * @author leon(ludafa@outlook.com)
 */

const router = require('koa-router')();
const swig = require('swig');
const path = require('path');
const {server} = require('../../conf');

swig.setDefaults({
    cache: 'memory'
});

router.get('/web/*', function *(next) {
    const pathname = path.join(__dirname, '../../public/index.swig');
    const {feRoot} = server;
    this.body = swig.renderFile(pathname, {feRoot});
});

module.exports = router;
