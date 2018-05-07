// extermal modules
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const dotenv = require('dotenv').config();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');
const dateformat = require('dateformat');
const fileUpload = require('express-fileupload');

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

// routers
const testRouter = require('./routers/test.js');
const authRouter = require('./routers/auth.js');
const profileRouter = require('./routers/profile.js');
const watchlistRouter = require('./routers/watchlist.js');
const seenRouter = require('./routers/seen.js');
const searchRouter = require('./routers/search.js');

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
app.use(fileUpload());
app.use((req, res, next) => {
    console.log(JSON.stringify(req.session));
    next();
});

// app routes
app.use(testRouter(omdb));
app.use(authRouter(user));
app.use(profileRouter(dateformat, omdb, profile, watchlist, seen));
app.use(watchlistRouter(omdb, watchlist, seen));
app.use(seenRouter(omdb, seen));
app.use(searchRouter(omdb, watchlist, seen));

// index  
app.get('/', (req, res) => {
    let params = {
        userLoggedIn: req.session.user_id
    };
    res.render('index', params);
});

// recommendations
app.get('/recommendations', async (req, res) => {
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

// view movie details
app.get('/viewMovie', async (req, res) => {
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

    params.movieData = movieData;
    res.render('view-movie', params);
});

// community
app.get('/community', async (req, res) => {
    if (!req.session.user_id) {
        res.redirect('/');
        return;
    }

    let params = {
        userLoggedIn: req.session.user_id
    };

    let userProfiles = [];
    try {
        userProfiles = await profile.getMostActiveUserProfiles();
    } catch (err) {
        res.render('error', { errorMessage: `An error occured: ${err}` });
        return;
    }

    // get the number of movies in Seen and Watchlist for each user
    for (var i = 0; i < userProfiles.length; i++) {
        let userId = userProfiles[i]['user_id'];
        let watchlistArr = [];
        let seenArr = [];
        
        try {
            watchlistArr = await watchlist.getListById(userId);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }

        try {
            seenArr = await seen.getListById(userId);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }

        userProfiles[i]['watchlist_number'] = watchlistArr.length;
        userProfiles[i]['seen_number'] = seenArr.length;
    }

    params.userProfiles = userProfiles;

    res.render('community', params);
});

// explore
// app.get('/explore', (req, res) => {
//     res.render('explore', params);
// });

// // movies by category (genre/time period)
// app.get('/explore/byCategory', (req, res) => {
//     res.render('by-category', params);
// });

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));