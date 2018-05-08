module.exports = function (omdb, seen) {
    let router = require('express').Router();

    // seen
    router.get('/addToSeen', async (req, res) => {
        let info = {
            user_id: req.session.user_id,
            movie_id: req.query.movieId,
        };

        // check if movie is already in Seen
        let result = false;
        try {
            result = await seen.userHasMovie(info);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
        }

        if (result) {
            // movie is already in Seen, so remove it
            result = 0;
            try {
                result = await seen.removeFromSeen(info);
            } catch (err) {
                res.render('error', { errorMessage: `An error occured: ${err}` });
            }
        } else {
            // before adding to seen check to see if movie is in watchlist and remove it if it is
            result = false;
            try {
                result = await watchlist.userHasMovie(info);
            } catch (err) {
                res.render('error', { errorMessage: `An error occured: ${err}` });
            }

            // if movie is in watchlist remove it
            result = 0;
            try {
                result = await watchlist.removeFromWatchlist(info);
            } catch (err) {
                res.render('error', { errorMessage: `An error occured: ${err}` });
            }

            // add to seen
            result = 0;
            try {
                info.rating = 0;
                result = await seen.addToSeen(info);
            } catch (err) {
                res.render('error', { errorMessage: `An error occured: ${err}` });
            }
        }

        // redirect user back
        backURL = req.header('Referer') || '/';
        res.redirect(backURL);

    });

    // seen movies (can also be viewed outside profile page)
    router.get('/seen', async (req, res) => {
        let params = {};

        if (!req.session.user_id) {
            res.redirect('/');
            return;
        }

        let seenMovies = await seen.getListById(req.session.user_id);
        let promises = [];

        for (var i = 0; i < seenMovies.length; i++) {
            let movieId = seenMovies[i]['movie_id'];
            promises.push(omdb.getMovieById(movieId));
        }

        params.userLoggedIn = req.session.user_id;
        params.moviesData = await Promise.all(promises).catch(err => console.log(err));
        
        for (var i = 0; i < params.moviesData.length; i++) {
            params.moviesData[i].userRating = seenMovies[i].rating;
        }

        res.render('seen', params);
    });

    router.post('/rateMovie', async (req, res) => {
        if (!req.session.user_id) {
            res.redirect('/');
            return;
        }
        
        let movieId = req.body.movieId;
        let rating = req.body.rating;
        let userId = req.session.user_id;

        try {
            await seen.rateMovie(userId, movieId, rating);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
        }

        backURL = req.header('Referer') || '/';
        res.redirect(backURL);
    });

    return router;
};