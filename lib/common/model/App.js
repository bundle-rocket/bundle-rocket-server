/**
 * @file App
 * @author leon(ludafa@outlook.com)
 */

const Sequelize = require('sequelize');
const db = require('./db.js');
const randomString = require('random-string');

const App = db.define('App', {

    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },

    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [2, 100]
        }
    },

    userId: {

        type: Sequelize.UUID,

        references: {
            model: 'User',
            key: 'id'
        }

    },

    // 每个 app 一个 secret key
    // 使用这个 secret key，可以让程序可以来发布 bundle
    // 也就是说，有这个 secret key 的人(程序)，我们都认为它有权限发布 bundle，而不需要登录谁
    secretKey: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'secret_key'
    },

    // 每个 app 有一个 deployment key
    // deployment key 用来在 native app 中使用，以标识自己所属的 app
    deploymentKey: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'deployment_key'
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
    tableName: 'App',

    classMethods: {
        list: function (userId, pageNum, pageSize) {

            return this.findAll({
                where: {
                    userId
                },
                limit: pageSize,
                offset: pageSize * (pageNum - 1)
            });

        },
        add: function (userId, name, secretKey) {
            return this.create({
                name: name,
                userId: userId,
                secretKey: randomString({length: 30}),
                deploymentKey: randomString({length: 30})
            });
        },
        getById: function (id, userId) {
            return this.findOne({
                attributes: [
                    'id',
                    'name',
                    'secretKey',
                    ['created_at', 'createdAt']
                ],
                where: {
                    userId: userId,
                    id: id
                }
            });
        },
        getByName: function (name, userId) {
            return this.findOne({
                attributes: [
                    'id',
                    'name',
                    'secretKey',
                    'deploymentKey',
                    ['created_at', 'createdAt']
                ],
                where: {
                    userId: userId,
                    name: name
                }
            });
        },
        remove: function (name, userId) {
            return this.destroy({
                where: {
                    userId: userId,
                    name: name
                }
            }).then(() => {
                return true;
            }, () => {
                return false;
            });
        }
    }

});

module.exports = App;
