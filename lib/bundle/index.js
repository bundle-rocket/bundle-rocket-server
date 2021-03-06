/**
 * @file bundle
 * @author Sheeta(wuhayao@gmail.com)
 */

const router = require('koa-router')();

const BundleModel = require('../common/model/Bundle');
const AppModel = require('../common/model/App.js');

const logger = require('../logger.js');
const semver = require('semver');
const User = require('../common/model/User.js');

router.use(function* (next) {

    try {
        yield next;
    }
    catch (error) {

        switch (error.status) {
            case 401:
                this.status = 401;
                this.body = {
                    message: 'Session expired'
                };
                break;
            default:
                throw error;
        }

    }

});


const send = require('koa-send');
const path = require('path');
const {hostname, port} = require('../../conf').server;
const mkdirp = require('../common/util/mkdirp.js');
const mv = require('../common/util/mv.js');

router.post(
    '/bundles',
    require('../common/middleware/authorize.js'),
    function* () {

        const userId = this.state.jwt.id;

        const {fields, files} = this.request.body;

        const {
            appName,
            bundleVersion,
            appVersion,
            shasum,
            message,
            main
        } = fields;

        const bundleFile = files.bundle;

        if (bundleFile.hash !== shasum) {
            this.status = 400;
            this.body = {
                status: 400,
                message: `bundle file hash mismatch`
            };
            return;
        }

        logger.verbose(`[bundle] [create]`, fields);

        try {

            let app = yield AppModel.findOne({
                attributes: ['id'],
                where: {
                    userId,
                    name: appName
                }
            });

            if (!app) {
                logger.verbose('[bundle] [CREATE] no app created, we are to create it first.');
                app = yield AppModel.add(userId, appName);
            }

            const appId = app.id;
            const currentMaxVersion = yield BundleModel.findMaxVersion(appId);

            logger.verbose(`[bundle] [create] current max version: `, currentMaxVersion || 'null');

            if (currentMaxVersion && !semver.lt(currentMaxVersion, bundleVersion)) {

                logger.info(
                    `[bundle] [create] failed: version conflict`,
                    `[current max version: ${currentMaxVersion}]`,
                    `[requested verion: ${bundleVersion}]`
                );

                this.status = 400;
                this.body = {
                    message: `Current max version is ${currentMaxVersion}, ${bundleVersion} is invalid.`
                };
                return;
            }

            const user = yield User.findOne({
                attributes: ['name'],
                where: {
                    id: userId
                }
            });

            yield mkdirp(path.join(__dirname, `../../bundles/${user.name}/${appName}/`));

            yield mv(
                bundleFile.path,
                path.join(
                    __dirname,
                    `../../bundles/${user.name}/${appName}/${appName}-${bundleVersion}.tar.gz`
                )
            );

            const bundle = {
                version: bundleVersion,
                appVersion,
                location: `http://${hostname}:${port}/bundles/${user.name}/${appName}/${appName}-${bundleVersion}.tar.gz`,
                appId,
                shasum,
                message,
                main,
                size: bundleFile.size
            };

            logger.verbose(`[bundle] [create] new bundle: `, bundle);

            yield BundleModel.create(bundle);

            this.status = 201;
            this.body = bundle;

        }
        catch (error) {
            logger.error('[bundle] [CREATE]', error);
        }

    }
);

router.get('/bundles/:userName/:appName/:bundleName', function* () {
    yield send(this, this.path, {root: path.join(__dirname, '../../')});
});

const ssanitizer = require('../common/util/semverSanitizer.js');

// 列出一个 APP 的 bundle 列表
router.get('/bundles', function* () {

    let {
        deploymentKey,
        appVersion = '1.0.0',
        bundleVersion = '1.0.0'
    } = this.query;

    appVersion = ssanitizer(appVersion);
    bundleVersion = ssanitizer(bundleVersion);

    logger.verbose(`[bundle] request available bundle: [appVersion ${appVersion}] [bundleVersion ${bundleVersion}]`);

    if (!deploymentKey) {
        this.status = 400;
        this.body = {
            message: 'Missing deployment key'
        };
        return;
    }

    const app = yield AppModel.findOne({
        attributes: ['id'],
        where: {
            deploymentKey
        }
    });

    if (!app) {
        this.status = 404;
        this.body = {
            message: 'App requested does not exist'
        };
        return;
    }

    let bundles = yield BundleModel.findAll({
        attributes: [
            'version',
            'appVersion',
            'location',
            'state',
            'shasum',
            'main'
        ],
        where: {
            appId: app.id
        }
    }).filter(function (bundle) {

        logger.verbose(bundle.version, bundle.state);

        const valid = semver.lte(bundle.appVersion, appVersion)
            && semver.gt(bundle.version, bundleVersion)
            && bundle.state === 'production';

        logger.verbose(`[bunlde] bundle [verion ${bundle.version}] [appVersion ${bundle.appVersion}]`);

        return valid;

    });

    bundles = bundles.sort(function (a, b) {
        const aVersion = a.version;
        const bVersion = b.version;
        return semver.eq(aVersion, bVersion) ? 0 : semver.gt(aVersion, bVersion) ? -1 : 1;
    });

    const bundle = bundles.length
        ? bundles[0].get({plain: true})
        : null;

    const result = {bundle};

    logger.verbose(''
        + '[bundle] check for update with '
        + 'appVersion ' + appVersion + ' '
        + 'bundleVersion ' + bundleVersion
    );

    logger.verbose((bundle ? `get a new availabel bundle: ${JSON.stringify(result)}` : 'no result'));

    this.status = 200;
    this.body = result;

    return;

});

module.exports = router;
