// extermal modules
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const dotenv = require('dotenv').config();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');
const dateformat = require('dateformat');

// DAO modules
const db = require('./db.js');
const User = require('./DAOs/User.js');
const Profile = require('./DAOs/Profile.js');
const Seen = require('./DAOs/Seen.js');
const Watchlist = require('./DAOs/Watchlist.js');

// API modules
const OMDb = require('./APIs/OMDb.js');
const RSAPI = require('./APIs/RSAPI.js');

// app variables
const app = express();
const sessionStore = new MySQLStore({}, db);

// DAOs
const user = new User(db);
const profile = new Profile(db);
const seen = new Seen(db);
const watchlist = new Watchlist(db);

// APIs
const omdb = new OMDb(process.env.OMDB_KEY);
const rs = new RSAPI('192.168.1.4');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', './pages');
app.use(express.static("."));

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.COOKIE_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

var params = {
    userLoggedIn: false,
    profilePage: "",
    dateformat: dateformat
};

app.use((req, res, next) => {
    console.log(JSON.stringify(req.session));
    next();
});

app.get('/test/:id', async (req, res) => {
    let imdb_id = req.params.id;
    let result = await rs.getSimilarMoviesById(imdb_id);
    res.send(result);
});

app.post('/login', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    // validation

    let creds = {
        email: email,
        password: password
    }

    let result = 0;
    try {
        result = await user.login(creds);
    } catch (err) {
        // TODO error page
        res.send(`An error occured: ${err}`);
        return;
    }

    if (result) {
        req.session.user_id = result;
        params.userLoggedIn = req.session.user_id;
        params.viewingUserWithId = req.session.user_id;
        res.redirect('/');
    } else {
        res.send('Invalid username or password');
    }
});

app.get('/logout', (req, res) => {
    params.userLoggedIn = false;
    params.viewingUserWithId = false;
    if (req.session.user_id) {
        req.session.destroy();
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.post('/register', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let confirm_password = req.body.confirm_password;
    let fname = req.body.fname;
    let lname = req.body.lname;
    let dob = req.body.dob;
    let gender = req.body.gender;
    let description = "";

    // validation & processing

    let info = {
        email: email,
        password: password,
        fname: fname,
        lname: lname,
        dob: dob,
        gender: gender,
        description: description
    }
    console.log("~register~ " + JSON.stringify(info));
    let result = 0;

    // check if email is already in use
    try {
        result = await user.emailAlreadyInUse(email);
    } catch (err) {
        // TODO error page
        res.send(`An error occured: ${err}`);
        return;
    }
    console.log("~email in use~  ", result);
    if (result) {
        // already in use
        params.signUpError = "Email already in use.";
        params.filledInfo = info;
        res.redirect('/signUp');
    }

    try {
        result = await user.register(info);
    } catch (err) {
        // TODO error page
        res.send(`An error occured: ${err}`);
        return;
    }
    // try to register user
    if (result) {
        req.session.user_id = result;
        params.userLoggedIn = true;
        // TODO redirect to profile setup 
        res.redirect('/profile');
    } else {
        // redirect back to register page
        params.signUpError = "Registration failed.";
        params.filledInfo = info;
        res.redirect('/signUp');
    }
});

// index page 
app.get('/', (req, res) => {
    res.render('index', params);
});

// search page
app.get('/search/:title', async (req, res) => {
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

// recommendations
app.get('/recommendations', (req, res) => {
    if (!params.userLoggedIn) {
        res.redirect('/');
        return;
    }
    res.render('recommendations', params);
});

// view movie details
app.get('/viewMovie', async (req, res) => {
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

    params.movieData = movieData;
    res.render('view-movie', params);
});

// view movie details
app.get('/signUp', (req, res) => {
    res.render('sign-up', params);
});

// watchlist (can also be viewed outside profile page)
app.get('/watchlist', async (req, res) => {
    if (!params.userLoggedIn) {
        res.redirect('/');
        return;
    }
    let watchlistMovies = await watchlist.getListById(req.session.user_id);
    let moviesData = [];
    for (var i = 0; i < watchlistMovies.length; i++) {
        let movieId = watchlistMovies[i]['movie_id'];
        let rawData = await omdb.getMovieById(movieId);
        moviesData.push(rawData);
    }
    params.moviesData = moviesData;
    res.render('watchlist', params);
});

app.get('/fromWatchlistToSeen', async (req, res) => {
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
        res.send(`An error occured: ${err}`);
        return;
    }

    // add to seen
    info.rating = 0;
    let result2 = 0;
    try {
        result2 = await seen.addToSeen(info);
    } catch (err) {
        // TODO error page
        res.send(`An error occured: ${err}`);
        return;
    }

    if (result1 && result2) {
        // redirect user back
        backURL = req.header('Referer') || '/';
        res.redirect(backURL);
    } else {
        res.send(`An error occured: ${err}`);
    }

});

app.get('/addToWatchlist', async (req, res) => {
    let info = {
        user_id: req.session.user_id,
        movie_id: req.query.movieId
    };

    // check if movie is already in Watchlist
    let result = false;
    try {
        result = await watchlist.userHasMovie(info);
    } catch (err) {
        res.render('error', {errorMessage: `An error occured: ${err}`});
    }

    if (result) {
        // movie is already in Watchlist, so remove it
        result = 0;
        try {
            result = await watchlist.removeFromSeen(info);
        } catch (err) {
            res.render('error', {errorMessage: `An error occured: ${err}`});
        }
    } else {
        // before adding to watchlist, check to see if movie is in seen and remove it if it is
        result = false;
        try {
            result = await seen.userHasMovie(info);
        } catch (err) {
            res.render('error', {errorMessage: `An error occured: ${err}`});
        }

        // if movie is in seen remove it
        result = 0;
        try {
            result = await seen.removeFromSeen(info);
        } catch (err) {
            res.render('error', {errorMessage: `An error occured: ${err}`});
        }

        // add to watchlist
        result = 0;
        try {
            result = await watchlist.addToWatchlist(info);
        } catch (err) {
            res.render('error', {errorMessage: `An error occured: ${err}`});
        }
    }

    // redirect user back
    backURL = req.header('Referer') || '/';
    res.redirect(backURL);

});

app.get('/addToSeen', async (req, res) => {
    let info = {
        user_id: req.session.user_id,
        movie_id: req.query.movieId,
    };

    // check if movie is already in Seen
    let result = false;
    try {
        result = await seen.userHasMovie(info);
    } catch (err) {
        res.render('error', {errorMessage: `An error occured: ${err}`});
    }

    if (result) {
        // movie is already in Seen, so remove it
        result = 0;
        try {
            result = await seen.removeFromSeen(info);
        } catch (err) {
            res.render('error', {errorMessage: `An error occured: ${err}`});
        }
    } else {
        // before adding to seen check to see if movie is in watchlist and remove it if it is
        result = false;
        try {
            result = await watchlist.userHasMovie(info);
        } catch (err) {
            res.render('error', {errorMessage: `An error occured: ${err}`});
        }

        // if movie is in watchlist remove it
        result = 0;
        try {
            result = await watchlist.removeFromWatchlist(info);
        } catch (err) {
            res.render('error', {errorMessage: `An error occured: ${err}`});
        }

        // add to seen
        result = 0;
        try {
            info.rating = 0;
            result = await seen.addToSeen(info);
        } catch (err) {
            res.render('error', {errorMessage: `An error occured: ${err}`});
        }
    }

    // redirect user back
    backURL = req.header('Referer') || '/';
    res.redirect(backURL);

});

// seen movies (can also be viewed outside profile page)
app.get('/seen', async (req, res) => {
    if (!params.userLoggedIn) {
        res.redirect('/');
        return;
    }
    let seenMovies = await seen.getListById(req.session.user_id);
    let moviesData = [];
    for (var i = 0; i < seenMovies.length; i++) {
        let movieId = seenMovies[i]['movie_id'];
        let rawData = await omdb.getMovieById(movieId);
        // also send current user's rating for this movie
        let userRating = await seen.getRating(req.session.user_id);
        rawData.userRating = userRating;
        moviesData.push(rawData);
    }
    params.moviesData = moviesData;
    res.render('seen', params);
});

// explore
app.get('/explore', (req, res) => {
    res.render('explore', params);
});

// search
app.get('/search', (req, res) => {
    delete params.movieData;
    res.render('search', params);
});

// community
app.get('/community', (req, res) => {
    if (!params.userLoggedIn) {
        res.redirect('/');
        return;
    }
    res.render('community', params);
});

// movies by category (genre/time period)
app.get('/explore/byCategory', (req, res) => {
    res.render('by-category', params);
});

// profile
app.get('/profile', async (req, res) => {
    if (!params.userLoggedIn) {
        res.redirect('/');
        return;
    }
    params.profilePage = "about";
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
        res.render('error', {errorMessage: `An error occured: ${err}`});
    }

    if (result) {
        console.log('~user info~' + JSON.stringify(result));
        params.userInfo = result;
        res.render('profile', params);
    } else {
        res.render('error', {errorMessage: `An error occured while showing profile: ${err}`});
    }

});

app.get('/profile/watchlist', async (req, res) => {
    if (!params.userLoggedIn) {
        res.redirect('/');
        return;
    }
    
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

app.get('/profile/seen', async (req, res) => {
    if (!params.userLoggedIn) {
        res.redirect('/');
        return;
    }

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

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));

