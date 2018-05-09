module.exports = function (omdb, rs, watchlist, seen) {
    let router = require('express').Router();

    router.get('/viewMovie', async (req, res) => {
        let params = {
            userLoggedIn: req.session.user_id
        };
        let movieId = req.query.movieId;
        let movieData = await omdb.getMovieById(movieId);

        let info = {
            user_id: req.session.user_id,
            movie_id: movieId
        };

        // check if movie is in watchlist
        let result = false;
        try {
            result = await watchlist.userHasMovie(info);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }
        movieData.isInWatchlist = result;

        // check if movie is already seen
        result = false;
        try {
            result = await seen.userHasMovie(info);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }
        movieData.isInSeen = result;

        let similarIds = await rs.getSimilarMoviesById(movieId, 4);
        params.similarMoviesData = [];

        if (similarIds && similarIds.length > 0) {
            let promises = [];
            for (var i = 0; i < similarIds.length; i++) {
                let movieId = similarIds[i].id;

                if (movieId == 'tt0000000') {
                    continue;
                }

                promises.push(omdb.getMovieById(movieId));
            }
            params.similarMoviesData = await Promise.all(promises).catch(err => console.log(err));
        }

        params.movieData = movieData;
        res.render('view-movie', params);
    });

    return router;
};