module.exports = function (omdb, rs, watchlist, seen) {
    let router = require('express').Router();

    router.get('/searchSimilar', (req, res) => {
        let params = {
            userLoggedIn: req.session.user_id
        };
        res.render('search-similar', params);
    });

    router.get('/searchSimilar/:title', async (req, res) => {
        let params = {
            userLoggedIn: req.session.user_id
        };

        // title introduces by user
        let title = req.params.title;


        let imdbId = await omdb.getMovieByTitle(title);
        imdbId = imdbId.imdbID;
        let similarIds = await rs.getSimilarMoviesById(imdbId, 20);

        let promises = [];
        for (var i = 0; i < similarIds.length; i++) {
            let movieId = similarIds[i].id;

            if (movieId == 'tt0000000') {
                continue;
            }

            promises.push(omdb.getMovieById(movieId));
        }
        params.moviesData = await Promise.all(promises);
        params.title = title.charAt(0).toUpperCase() + title.slice(1);

        res.render('search-similar', params);
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
        res.render('view-movie', params);
    });

    return router;
};