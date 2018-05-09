module.exports = function (profile, watchlist, seen) {
    let router = require('express').Router();

    // community
    router.get('/community', async (req, res) => {
        if (!req.session.user_id) {
            res.redirect('/');
            return;
        }

        let params = {
            userLoggedIn: req.session.user_id
        };

        let userProfiles = [];
        try {
            userProfiles = await profile.getMostActiveUserProfiles();
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }

        // get the number of movies in Seen and Watchlist for each user
        for (var i = 0; i < userProfiles.length; i++) {
            let userId = userProfiles[i]['user_id'];
            let watchlistArr = [];
            let seenArr = [];

            try {
                watchlistArr = await watchlist.getListById(userId);
            } catch (err) {
                res.render('error', { errorMessage: `An error occured: ${err}` });
                return;
            }

            try {
                seenArr = await seen.getListById(userId);
            } catch (err) {
                res.render('error', { errorMessage: `An error occured: ${err}` });
                return;
            }

            userProfiles[i]['watchlist_number'] = watchlistArr.length;
            userProfiles[i]['seen_number'] = seenArr.length;
        }

        params.userProfiles = userProfiles;

        res.render('community', params);
    });

    return router;
};