// extermal modules
const express    = require('express');
const bodyParser = require('body-parser');
const fetch      = require('node-fetch');
const dotenv     = require('dotenv').config();
const session    = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt     = require('bcrypt');

// DAO modules
const db        = require('./db.js');
const User      = require('./DAOs/User.js');
const Profile   = require('./DAOs/Profile.js');
const Seen      = require('./DAOs/Seen.js');
const Watchlist = require('./DAOs/Watchlist.js');

// API modules
const OMDb = require('./APIs/OMDb.js');

// app variables
const app = express();
const sessionStore = new MySQLStore({}, db);

// DAOs
const user      = new User(db);
const profile   = new Profile(db);
const seen      = new Seen(db);
const watchlist = new Watchlist(db);

// APIs
const omdb = new OMDb(process.env.OMDB_KEY);

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

app.use((req, res, next) => {
    console.log(JSON.stringify(req.session));
    next();
});

app.get('/test', async (req, res) => {
    let result = await omdb.getMovieById('tt1285016');
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
        res.redirect('/');
    } else {
        res.send('Invalid username or password');
    }
});

app.post('/logout', (req, res) => {
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
    let description = req.body.description;

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
    let result = 0;
    
    try {
        result = await user.register(info);
    } catch (err) {
        // TODO error page
        res.send(`An error occured: ${err}`);
        return;
    }

    if (result) {
        req.session.user_id = result;
        // TODO redirect to profile setup
        res.redirect('/');
    } else {
        // redirect back to register page
        res.send('Registration failed!');
    }
});

// index page 
app.get('/', (req, res) => {
    params.userLoggedIn = req.session.user_id;
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

