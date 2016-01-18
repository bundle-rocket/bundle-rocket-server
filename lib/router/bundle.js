/**
 * @file bundle
 * @author Sheeta(wuhayao@gmail.com)
 */

const router = require('koa-router')();
const jwt = require('koa-jwt');
const {secret, key} = require('../../conf').jwt;
const Bundle = require('../common/model/Bundle');
const parse = require('co-busboy');
const fs = require('fs');

router.use(jwt({
    secret,
    key
}));

// 获取一个 APP 的 bundle 列表
router.get('/app/:appId/bundles', function *() {
    const {appId} = this.params;
    const {pageNum, pageSize} = this.query;
    const bundles = yield Bundle.list(appId, pageNum, pageSize);
    this.body = bundles;
});

// 对上传 bundle 的请求进行处理
router.post('/app/:appId/bundles', function *() {
    if (!this.request.is('multipart/*')) {
        this.status = 415;
        this.body = 'Unsupported Media Type';
        return;
    }

    const userId = this.state.jwt.id;
    const {appId} = this.params;

    const parts = parse(this);
    let part;
    let param = {};
    let location;
    while (part = yield parts) {
        if (part.length) {
            param[part[0]] = part[1];
        }
        else {
            console.log(part);
            // TODO 保存上传的图片
            location = ''
                + './user_data/' + userId + '/' + appId + '/'
                + param.bundleVersion + '/' + part.filename;
            // part.pipe(fs.createWriteStream(location));
        }
    }
    // TODO 容错处理：appId 和 appVersion 是否存在、文件大小限制、版本号管理

    const bundle = yield Bundle.save(
        appId,
        param.appVersion,
        param.bundleVersion,
        location
    );

    this.body = bundle;
});

module.exports = router;
