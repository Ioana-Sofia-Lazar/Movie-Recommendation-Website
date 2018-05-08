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
// const rs = new RSAPI('192.168.1.4');
const rs = new RSAPI('192.168.1.6');

// routers
const testRouter = require('./routers/test.js');
const indexRouter = require('./routers/index.js');
const authRouter = require('./routers/auth.js');
const profileRouter = require('./routers/profile.js');
const watchlistRouter = require('./routers/watchlist.js');
const seenRouter = require('./routers/seen.js');
const searchRouter = require('./routers/search.js');
const recommendationsRouter = require('./routers/recommendations.js');
const movieRouter = require('./routers/movie.js');
const communityRouter = require('./routers/community.js');

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
app.use(testRouter(omdb, rs));
app.use(indexRouter());
app.use(authRouter(user));
app.use(profileRouter(dateformat, omdb, profile, watchlist, seen));
app.use(watchlistRouter(omdb, watchlist, seen));
app.use(seenRouter(omdb, seen));
app.use(searchRouter(omdb, rs, watchlist, seen));
app.use(recommendationsRouter(omdb, rs, seen));
app.use(movieRouter(omdb, rs, watchlist, seen));
app.use(communityRouter(profile, watchlist, seen));

// start the server
app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));