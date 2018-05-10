module.exports = function (omdb, rs, profile, watchlist, seen) {
    let router = require('express').Router();

    router.get('/test', async (req, res) => {
        let params = {
            userLoggedIn: req.session.user_id
        }
        let user_id = req.session.user_id;
        let ratings = await seen.getListById(user_id);

        ratings = ratings.map(r => ({
            imdb_id: r.movie_id,
            rating: r.rating
        }));
        
        let result = [];
        let recommendations = await rs.getRecommendations(ratings);

        let promises = [];
        for (var i = 0; i < recommendations.length; i++) {
            let movieId = recommendations[i].id;
            promises.push(omdb.getMovieById(movieId));
        }
        params.moviesData = await Promise.all(promises).catch(err => console.log(err));

        result = params.moviesData;
        res.send(result);
    });
    
    return router;
};