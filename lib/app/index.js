/**
 * @file app
 * @author leon(ludafa@outlook.com)
 */

const AppModel = require('../common/model/App');
const BundleModel = require('../common/model/Bundle.js');
const logger = require('../logger.js');
const statuses = require('statuses');

const router = require('koa-router')({
    prefix: '/apps'
});

// 这里是 jwt 的认证，如果没有带 jwt 的 access token 那么这货会丢异常
router.use(require('../common/middleware/authorize.js'));

// 列出登录用户的 APP 列表
// router.get('/', function* () {

//     console.log('aaaa');

//     const {id} = this.state[key];
//     const {pageNum, pageSize} = this.query;

//     try {

//         const apps = yield App.list(id, pageNum, pageSize);

//         this.body = apps;

//     }
//     catch (e) {
//         this.status = 500;
//         this.body = e.message;
//     }

// });

// 获取 APP 的详细信息
router.get('/:name', function* () {

    const {name} = this.params;
    const {id} = this.state.user;

    try {

        const app = yield AppModel.getByName(name, id);

        if (!app) {
            this.status = 404;
            this.body = {
                message: statuses[404]
            };
            return;
        }

        const bundles = yield BundleModel.findAll({
            attributes: [
                ['created_at', 'createdAt'],
                'location',
                'shasum',
                'version'
            ],
            where: {
                appId: app.id
            }
        });

        const body = {
            ...app.get({plain: true}),
            versions: bundles.map(function (bundle) {
                return bundle.get({plain: true});
            }),
            time: bundles.reduce(function (result, bundle) {
                const {version, createdAt} = bundle.get({plain: true});
                result[version] = createdAt;
                return result;
            }, {})
        };

        this.status = 200;
        this.body = body;

        logger.verbose(`[app] [GET] /${name}`, body);

    }
    catch (error) {

        logger.error(`[app] [GET] ${error.message} ${error.stack}`);

        this.status = 500;
        this.body = {
            message: statuses[500]
        };

    }

});

// 新建一个 APP
router.post('/', function* () {

    const {id} = this.state.id;
    const {body = {}} = this.request;
    const appName = body.name;

    let isExisted;
    let app;

    isExisted = yield AppModel.getByName(appName, id);

    if (!isExisted) {
        app = yield AppModel.add(id, appName);
    }

    if (!app) {
        this.status = 422;
        this.body = 'Name Repetition';
        return;
    }

    this.body = app;

});

// 删除一个 APP
router.del('/:name', function* () {

    const {name} = this.params;
    const userId = this.state.jwt.id;

    let res;

    const isExisted = yield AppModel.getByName(name, userId);

    if (isExisted) {
        res = yield AppModel.remove(name, userId);
    }

    if (!res) {
        this.status = 404;
        this.body = 'Not Found';
        return;
    }

    // 204 表示不带实体的返回，通常用来表示删除数据成功
    this.status = 204;

});

router.patch('/:name/:version', function* () {

    const {name, version} = this.params;
    const userId = this.state.user.id;

    const app = yield AppModel.findOne({
        attributes: ['id'],
        where: {
            name, userId
        }
    });

    if (!app) {
        this.status = 404;
        this.body = {
            message: statuses[404]
        };
        return;
    }

    const bundle = yield BundleModel.findOne({
        attributes: [
            'id',
            'version',
            'location',
            'shasum',
            'state',
            ['created_at', 'createdAt']
        ],
        where: {
            version,
            appId: app.id
        }
    });

    if (!bundle) {
        this.status = 404;
        this.body = {
            message: statuses[404]
        };
        return;
    }

    if (bundle.state !== 'staging') {
        logger.verbose(`[bundle] [deploy] failed due to bundle already deployed or removed.`);
        this.status = 400;
        this.body = {
            message: `Bundle ${version} already deployed or removed`
        };
        return;
    }

    yield bundle.update({state: 'production'});

    this.status = 200;
    this.body = {bundle: bundle.get({plain: true})};

});

module.exports = router;
