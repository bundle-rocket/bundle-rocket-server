/**
 * @file App
 * @author leon(ludafa@outlook.com)
 */

const Sequelize = require('sequelize');
const db = require('./db.js');

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
    tableName: 'App'

});

module.exports = App;
