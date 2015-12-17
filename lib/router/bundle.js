/**
 * @file bundle
 * @author Sheeta(wuhayao@gmail.com)
 */

const router = require('koa-router')();
const jwt = require('koa-jwt');
const {secret, key} = require('../../conf').jwt;
const Bundle = require('../common/model/Bundle');

router.use(jwt({
    secret,
    key
}));

// 列出一个 APP 的 bundle 列表
router.get('/app/:appId/bundles', function *() {
    const {appId} = this.params;
    const {pageNum, pageSize} = this.query;
    const bundles = yield Bundle.list(appId, pageNum, pageSize);
    this.body = bundles;
});

module.exports = router;
