module.exports = function (dateformat, omdb, profile, watchlist, seen) {
    let router = require('express').Router();

    router.get('/profile', async (req, res) => {
        let params = {};

        if (!req.session.user_id) {
            res.redirect('/');
            return;
        }

        params.userLoggedIn = req.session.user_id;
        params.profilePage = "about";
        params.dateformat = dateformat;

        // by default view current user's profile
        // if userId query string is set, then view profile of user with that id
        let userId = req.session.user_id;
        params.viewingUserWithId = req.session.user_id;
        if (req.query.user) {
            userId = req.query.user;
            params.viewingUserWithId = req.query.user;
        }

        let result = 0;
        try {
            result = await profile.getProfileById(userId);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
        }

        if (result) {
            console.log('~user info~' + JSON.stringify(result));
            params.userInfo = result;
            res.render('profile', params);
        } else {
            res.render('error', { errorMessage: `An error occured while showing profile: ${err}` });
        }

    });

    router.get('/profile/watchlist', async (req, res) => {
        let params = {};

        if (!req.session.user_id) {
            res.redirect('/');
            return;
        }

        params.userLoggedIn = req.session.user_id;
        params.profilePage = "watchlist";

        // by default show watchlist for current user
        // if userId query string is set, then view watchlist of user with that id
        let userId = req.session.user_id;
        params.viewingUserWithId = req.session.user_id;
        if (req.query.user) {
            userId = req.query.user;
            params.viewingUserWithId = req.query.user;
        }

        let watchlistMovies = await watchlist.getListById(userId);
        let moviesData = [];
        for (var i = 0; i < watchlistMovies.length; i++) {
            let movieId = watchlistMovies[i]['movie_id'];
            let rawData = await omdb.getMovieById(movieId);
            moviesData.push(rawData);
        }
        params.moviesData = moviesData;

        res.render('profile', params);
    });

    router.get('/profile/seen', async (req, res) => {
        let params = {};

        if (!req.session.user_id) {
            res.redirect('/');
            return;
        }

        params.userLoggedIn = req.session.user_id;
        params.profilePage = "seen";

        // by default show seen movies for current user
        // if userId query string is set, then view seen movies of user with that id
        let userId = req.session.user_id;
        params.viewingUserWithId = req.session.user_id;
        if (req.query.user) {
            userId = req.query.user;
            params.viewingUserWithId = req.query.user;
        }

        let seenMovies = await seen.getListById(userId);
        let moviesData = [];
        for (var i = 0; i < seenMovies.length; i++) {
            let movieId = seenMovies[i]['movie_id'];
            let rawData = await omdb.getMovieById(movieId);
            // also send current user's rating for this movie
            let userRating = await seen.getRating(userId);
            console.log("~" + userRating);
            rawData.userRating = userRating;
            moviesData.push(rawData);
        }
        params.moviesData = moviesData;

        res.render('profile', params);
    });

    router.get('/editProfile', async (req, res) => {
        let params = {};

        if (!req.session.user_id) {
            res.redirect('/');
            return;
        }

        params.userLoggedIn = req.session.user_id;
        params.dateformat = dateformat;

        // current user's profile info
        let userId = req.session.user_id;

        let result = 0;
        try {
            result = await profile.getProfileById(userId);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
        }

        if (result) {
            params.userInfo = result;
            params.dob = dateformat(params.userInfo.dob, 'yyyy-mm-dd');
            res.render('edit-profile', params);
        } else {
            res.render('error', { errorMessage: `An error occured while showing profile: ${err}` });
        }
    });

    router.post('/saveProfileChanges', async (req, res) => {
        let params = {};

        if (!req.session.user_id) {
            res.redirect('/');
            return;
        }

        let userId = req.session.user_id;
        let result = 0;
        try {
            result = await profile.getProfileById(userId);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
        }

        if (result) {
            params.userInfo = result;
        } else {
            res.render('error', { errorMessage: `An error occured while showing profile: ${err}` });
        }

        params.userLoggedIn = req.session.user_id;
        params.dateformat = dateformat;

        let fname = req.body.fname;
        let lname = req.body.lname;
        let dob = req.body.dob;
        let gender = req.body.gender;
        let description = req.body.description;
        let photo = params.userInfo.photo;

        // profile photo
        if (req.files.photo) {
            let file = req.files.photo;
            photo = req.session.user_id + '.' + file.name.substr(file.name.lastIndexOf('.') + 1);
            let photoFullPath = './images/upload_images/' + photo;

            file.mv(photoFullPath, function (err) {

                if (err) return res.status(500).send(err);

            });
        }

        // processing
        let info = {
            user_id: req.session.user_id,
            fname: fname,
            lname: lname,
            dob: dob,
            gender: gender,
            description: description,
            photo: photo
        }
        console.log("~saveProfileChanges~ " + JSON.stringify(info));

        result = 0;
        try {
            result = await profile.updateProfile(info);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }
        // save changes
        if (result) {
            res.redirect('/profile');
        } else {
            // redirect back to register page
            res.redirect('/editProfile');
        }
    });

    return router;
};