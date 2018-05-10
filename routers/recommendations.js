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
        if (result['number'] >= 10) {
            let user_id = req.session.user_id;
            let ratings = await seen.getListById(user_id);

            ratings = ratings.map(r => ({
                imdb_id: r.movie_id,
                rating: r.rating
            }));

            let recommendations = await rs.getRecommendations(ratings);

            let promises = [];
            for (var i = 0; i < recommendations.length; i++) {
                let movieId = recommendations[i].id;
                promises.push(omdb.getMovieById(movieId));
            }

            params.movieRecommendations = await Promise.all(promises).catch(err => console.log(err));
        }

        res.render('recommendations', params);
    });

    return router;
};