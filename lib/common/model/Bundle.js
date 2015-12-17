/**
 * @file Bundle
 * @author leon(ludafa@outlook.com)
 */

const Sequelize = require('sequelize');
const db = require('./db.js');

const Bundle = db.define('Bundle', {

    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },

    version: {
        type: Sequelize.STRING,

        // 版本号与应用id联合唯一，也就是一个应用下的版本不能重复
        unique: 'VERSION_APP_COMPOSITE_INDEX',
        validate: {
            is: /^\d+\.\d+\.\d+$/
        }
    },

    // 这个货是用来标识对 native app 版本号要求的
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

    location: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isUrl: true
        }
    },

    appId: {
        type: Sequelize.UUID,
        field: 'foreign_key_app_id',
        unique: 'VERSION_APP_COMPOSITE_INDEX',
        references: {
            model: 'App',
            key: 'id'
        }
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
        }
    }

});

module.exports = Bundle;
