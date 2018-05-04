module.exports = function (omdb, watchlist, seen) {
    let router = require('express').Router();

    router.get('/search', (req, res) => {
        let params = {
            userLoggedIn: req.session.user_id
        };
        res.render('search', params);
    });

    router.get('/search/:title', async (req, res) => {
        let params = {
            userLoggedIn: req.session.user_id
        };
        
        let title = req.params.title;
        let movieData = await omdb.getMovieByTitle(title);

        let info = {
            user_id: req.session.user_id,
            movie_id: movieData.imdbID
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

        params.movieData = movieData;
        res.render('search', params);
    });

    return router;
};