const express = require('express');
const cookieSession = require('cookie-session');
const passport = require('passport');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const apiRoutes = require('./routes/api-routes');
const passportSetup = require('./passport/passport-setup');
const mongoose = require('mongoose');
const cookie = process.env.CKE || require('./config/keys').session.cookieKey
const mongo = process.env.MNG || require('./config/keys').mongodb.dbURI
const PORT = process.env.PORT || 4000;
const app = express();
//set static
app.use(express.static('static'))
    // set view engine
app.set('view engine', 'ejs');

// set up session cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [cookie]
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


// connect to mongodb
mongoose.connect(mongo, () => {
    console.log('connected to mongodb');
});

// set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/api', apiRoutes);


// create home route
app.get('/', (req, res) => {
    res.render('home', { user: req.user });
});
app.get('/test', (req, res) => {
        res.render('api-test', { user: false })
    })
    // app.get('/youtube', (req, res) => res.json(req))
app.listen(PORT, () => {
    console.log('app now listening for requests on port', PORT);
});