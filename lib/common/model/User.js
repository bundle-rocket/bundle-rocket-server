/**
 * @file User
 * @author leon(ludafa@outlook.com)
 */

const Sequelize = require('sequelize');
const db = require('./db.js');

const User = db.define('User', {

    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },

    name: {
        type: Sequelize.STRING,
        field: 'name',
        allowNull: false
    },

    email: {
        type: Sequelize.STRING,
        field: 'email',
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },

    password: {
        type: Sequelize.STRING,
        field: 'password',
        allowNull: false
    },

    origin: {
        type: Sequelize.STRING,
        field: 'origin',
        allowNull: false,
        defaultValue: 'self'
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
    tableName: 'User',

    classMethods: {
        authenticate: function (email, password) {
            return this.findAll({
                attributes: ['id', 'name'],
                where: {
                    email,
                    password
                }
            }).then((users) => {
                return users[0];
            });
        }
    }

});

module.exports = User;
