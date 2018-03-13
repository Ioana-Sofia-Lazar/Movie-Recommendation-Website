// load
var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', './pages');
app.use(express.static("."));

var params = {
    userLoggedIn: true,
    movieInWatchlist: true,
    movieSeen: false,
    profilePage: ""
};

// index page 
app.get('/', function(req, res) {
    res.render('index', params);
});

app.get('/recommendations', (req, res) => {
    res.render('recommendations', params);
});

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

