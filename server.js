// extermal modules
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const dotenv = require('dotenv').config();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// app modules
const db = require('./db.js');
const User = require('./DAOs/User.js');

// app variables
const app = express();
const sessionStore = new MySQLStore({}, db);

// DAOs
const user = new User(db);

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
app.use(passport.initialize());
app.use(passport.session());

// passport config
passport.use(new LocalStrategy(
    function (username, password, done) {

        return done(null, user);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    // to do
    done(err, user);
});


var params = {
    userLoggedIn: true,
    movieInWatchlist: true,
    movieSeen: false,
    profilePage: "",
    genres: [
        {
            name: 'Comedy',
            photo: 'comedy.jpg'
        },
        {
            name: 'Drama',
            photo: 'comedy.jpg'
        },
        {
            name: 'Romance',
            photo: 'comedy.jpg'
        },
        {
            name: 'Action',
            photo: 'comedy.jpg'
        },
        {
            name: 'Thriller',
            photo: 'comedy.jpg'
        },
        {
            name: 'Sci-Fi',
            photo: 'comedy.jpg'
        },
        {
            name: 'Mistery',
            photo: 'comedy.jpg'
        },
        {
            name: 'Documentary',
            photo: 'comedy.jpg'
        },
        {
            name: 'Animated',
            photo: 'comedy.jpg'
        },
        {
            name: 'Horror',
            photo: 'comedy.jpg'
        },
        {
            name: 'Crime',
            photo: 'comedy.jpg'
        },
        {
            name: 'Fantasy',
            photo: 'comedy.jpg'
        }

    ],
    periods: [
        {
            name: '1970s',
            photo: 'comedy.jpg'
        }
    ]
};


// index page 
app.get('/', function (req, res) {
    res.render('index', params);
});

// recommendations
app.get('/recommendations', (req, res) => {
    res.render('recommendations', params);
});

// view movie details
app.get('/viewMovie', (req, res) => {
    res.render('view-movie', params);
});

// watchlist (can also be viewed outside profile page)
app.get('/watchlist', (req, res) => {
    res.render('watchlist', params);
});

// seen movies (can also be viewed outside profile page)
app.get('/seen', (req, res) => {
    res.render('seen', params);
});

// explore
app.get('/explore', (req, res) => {
    res.render('explore', params);
});

// search
app.get('/search', (req, res) => {
    res.render('search', params);
});

// community
app.get('/community', (req, res) => {
    res.render('community', params);
});

// movies by category (genre/time period)
app.get('/explore/byCategory', (req, res) => {
    res.render('by-category', params);
});

// profile
app.get('/profile', (req, res) => {
    params.profilePage = "about";
    res.render('profile', params);
});

app.get('/profile/watchlist', (req, res) => {
    params.profilePage = "watchlist";
    res.render('profile', params);
});

app.get('/profile/seen', (req, res) => {
    params.profilePage = "seen";
    res.render('profile', params);
});

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));

