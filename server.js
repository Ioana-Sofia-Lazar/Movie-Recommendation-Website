// load
var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', './pages');
app.use(express.static("."));

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
app.get('/', function(req, res) {
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

app.listen(8000);

