module.exports = function (omdb, rs, seen) {
    let router = require('express').Router();

    router.get('/recommendations', async (req, res) => {
        if (!req.session.user_id) {
            res.redirect('/');
            return;
        }

        let params = {
            userLoggedIn: req.session.user_id
        };

        // get number of rated movies for current user
        let result = 0;
        try {
            result = await seen.getNumberOfRatings(params.userLoggedIn);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }
        params.numberOfRatings = result['number'];

        // if he has rated 15 movies already, get recommendations
        if (result['number'] >= 15) {
            let movieRecommendations = [];
            // todo get recommendations

            params.movieRecommendations = movieRecommendations;
        }

        res.render('recommendations', params);
    });

    return router;
};