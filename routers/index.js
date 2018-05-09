module.exports = function () {
    let router = require('express').Router();

    router.get('/', (req, res) => {
        let params = {
            userLoggedIn: req.session.user_id
        };
        res.render('index', params);
    });

    return router;
};