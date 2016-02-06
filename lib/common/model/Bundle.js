/**
 * @file Bundle
 * @author leon(ludafa@outlook.com)
 */

const Sequelize = require('sequelize');
const db = require('./db.js');
const semver = require('semver');

const Bundle = db.define('Bundle', {

    // primary key
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },

    // 版本包的版本。。。
    version: {
        type: Sequelize.STRING,

        // 版本号与应用id联合唯一，也就是一个应用下的版本不能重复
        unique: 'VERSION_APP_COMPOSITE_INDEX',
        validate: {
            is: /^\d+\.\d+\.\d+$/
        }
    },

    // 版本包可应用的最低 native app 版本
    // 有些 bundle 是需要 native app 提供本地功能的，不满足此要求的 bundle 不能派发
    appVersion: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '1.0.0',
        validate: {
            is: /^\d+\.\d+\.\d+$/
        },
        field: 'app_version'
    },

    // 线上可访问的版本包 URL 地址
    location: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isUrl: true
        }
    },

    // 外键 bundle -> app
    appId: {
        type: Sequelize.UUID,
        field: 'foreign_key_app_id',
        unique: 'VERSION_APP_COMPOSITE_INDEX',
        references: {
            model: 'App',
            key: 'id'
        }
    },

    // 版本包的 磁盘占用 大小
    size: {
        type: Sequelize.BIGINT.UNSIGNED,
        field: 'size',
        allowNull: false
    },

    // 版本包的 md5 值
    shasum: {
        type: Sequelize.STRING,
        field: 'shasum',
        allowNull: false
    },

    // 版本状态
    // 1. 缓存：此状态下的版本不会被推送给用户
    // 2：产品：此状态下的版本的会被推送给用户
    //
    // `br publish` 的版本是处于 `staging` 的状态
    // `br deploy <version` 将版本状态变更为 `production`
    state: {
        type: Sequelize.ENUM('staging', 'production'),
        field: 'state',
        allowNull: false,
        defaultValue: 'staging'
    },

    // 指定 react-native 的主模块
    main: {
        type: Sequelize.STRING,
        field: 'main',
        allowNull: false,
        defaultValue: 'main.jsbundle'
    },

    // 版本信息，可以用来提示用户更新的功能点
    message: {
        type: Sequelize.STRING,
        field: 'message',
        allowNull: false,
        defaultValue: ''
    }

}, {

    // disable the modification of tablenames; By default, sequelize will automatically
    // transform all passed model names (first parameter of define) into plural.
    // if you don't want that, set the following
    freezeTableName: true,

    // don't delete database entries but set the newly added attribute deletedAt
    // to the current date (when deletion was done). paranoid will only work if
    // timestamps are enabled
    paranoid: true,

    // don't use camelcase for automatically added attributes but underscore style
    // so updatedAt will be updated_at
    underscored: true,

    // define the table's name
    tableName: 'Bundle',

    classMethods: {

        list: function (appId, pageNum, pageSize) {
            return this.findAndCount({
                where: {
                    appId
                },
                limit: pageSize,
                offset: pageSize * (pageNum - 1)
            });
        },

        findMaxVersion(appId) {

            return this.findAll({
                attributes: ['version'],
                where: {
                    appId
                }
            }).then(function (records) {
                return records.length
                    ? records
                        .sort(function (a, b) {
                            return semver.gt(a.version, b.version);
                        })[0].version
                    : null;
            });

        },

        add(bundle) {
            return this.create(bundle);
        }

    }

});

module.exports = Bundle;
