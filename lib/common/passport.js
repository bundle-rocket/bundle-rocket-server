/**
 * @file 通用认证模块
 * @author leon(ludafa@outlook.com)
 */

var passport = require('koa-passport');

var user = {
    id: 1,
    username: 'test'
};

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    done(null, user);
});

var LocalStrategy = require('passport-local');

passport.use(new LocalStrategy((username, password, done) => {

    // retrieve user ...
    if (username === 'test' && password === 'test') {
        done(null, user);
    }
    else {
        done(null, false);
    }

}));

module.exports = passport;
