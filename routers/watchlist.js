module.exports = function (omdb, watchlist, seen) {
    let router = require('express').Router();

    router.get('/watchlist', async (req, res) => {
        let params = {};

        if (!req.session.user_id) {
            res.redirect('/');
            return;
        }

        params.userLoggedIn = req.session.user_id;
        params.viewingUserWithId = req.session.user_id;
        let watchlistMovies = await watchlist.getListById(req.session.user_id);
        let promises = [];
        for (var i = 0; i < watchlistMovies.length; i++) {
            let movieId = watchlistMovies[i]['movie_id'];
            promises.push(omdb.getMovieById(movieId));
        }
        params.moviesData = await Promise.all(promises).catch(err => console.log(err));
        res.render('watchlist', params);
    });

    router.get('/fromWatchlistToSeen', async (req, res) => {
        let info = {
            user_id: req.session.user_id,
            movie_id: req.query.movieId
        };

        // remove from watchlist
        let result1 = 0;
        try {
            result1 = await watchlist.removeFromWatchlist(info);
        } catch (err) {
            // TODO error page
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }

        // add to seen
        info.rating = 0;
        let result2 = 0;
        try {
            result2 = await seen.addToSeen(info);
        } catch (err) {
            // TODO error page
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }

        if (result1 && result2) {
            // redirect user back
            backURL = req.header('Referer') || '/';
            res.redirect(backURL);
        } else {
            res.render('error', { errorMessage: `An error occured` });
        }

    });

    router.get('/addToWatchlist', async (req, res) => {
        let info = {
            user_id: req.session.user_id,
            movie_id: req.query.movieId
        };

        // check if movie is already in Watchlist
        let result = false;
        try {
            result = await watchlist.userHasMovie(info);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
        }

        if (result) {
            // movie is already in Watchlist, so remove it
            result = 0;
            try {
                result = await watchlist.removeFromWatchlist(info);
            } catch (err) {
                res.render('error', { errorMessage: `An error occured: ${err}` });
            }
        } else {
            // before adding to watchlist, check to see if movie is in seen and remove it if it is
            result = false;
            try {
                result = await seen.userHasMovie(info);
            } catch (err) {
                res.render('error', { errorMessage: `An error occured: ${err}` });
            }

            // if movie is in seen remove it
            result = 0;
            try {
                result = await seen.removeFromSeen(info);
            } catch (err) {
                res.render('error', { errorMessage: `An error occured: ${err}` });
            }

            // add to watchlist
            result = 0;
            try {
                result = await watchlist.addToWatchlist(info);
            } catch (err) {
                res.render('error', { errorMessage: `An error occured: ${err}` });
            }
        }

        // redirect user back
        backURL = req.header('Referer') || '/';
        res.redirect(backURL);

    });

    return router;
};