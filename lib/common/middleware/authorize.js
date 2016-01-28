/**
 * @file authorize middleware
 * @author leon(ludafa@outlook.com)
 */

const compose = require('koa-compose');
const {secret, key} = require('../../../conf').jwt;
const jwt = require('koa-jwt')({secret, key});
const UserModel = require('../model/User.js');
const statuses = require('statuses');
const logger = require('../../logger.js');

function* log(next) {

    try {
        yield next;
    }
    catch (error) {

        if (error.status === 401) {
            logger.verbose(`[middleware:authorize] authorization failed`);
            this.status = 401;
            this.body = {
                message: statuses[401]
            };
            return;
        }

        throw error;

    }

}

function* user(next) {

    const {id} = this.state.jwt;

    logger.verbose(`[jwt] [fetch user]`, id);

    const user = yield UserModel.findOne({
        attributes: ['id', 'name', 'email'],
        where: {
            id
        }
    });

    if (!user) {

        logger.verbose(`[jwt] [fetch user] ${id} not exist`);

        this.status = 401;
        this.body = {
            message: 'User not exist'
        };

        return;
    }

    this.state.user = user.get({plain: true});

    yield next;

}

module.exports = compose([log, jwt, user]);
