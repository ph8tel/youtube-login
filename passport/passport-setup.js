const passport = require('passport');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const YoutubeV3Strategy = require('passport-youtube-v3').Strategy

// const keys = process.env.keys || require('../config/keys');
const User = require('../models/user-model');
const GUser = require('../models/google-model')
const GID = process.env.GIS || require('../config/keys').google.clientID
const GSEC = process.env.GSEC || require('../config/keys').google.clientSecret
const YID = process.env.YED || require('../config/keys').youTube.clientID
const YSEC = process.env.YSEC || require('../config/keys').youTube.clientSecret

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(

    new GoogleStrategy({
        // options for google strategy
        clientID: GID,
        clientSecret: GSEC,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our own db
        GUser.findOne({ googleId: profile.id }).then((currentUser) => {
            if (currentUser) {
                // already have this user
                console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new GUser({
                    googleId: profile.id,
                    username: profile.displayName,
                    thumbnail: profile._json.image.url
                }).save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    })
);
var config = {
    clientID: YID,
    clientSecret: YSEC,
    callbackURL: '/auth/youtube/callback'
};
passport.use(new YoutubeV3Strategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL
        // scope: ['https://www.googleapis.com/auth/youtube.readonly'],
        // authorizationParams: {
        //     access_type: 'offline'
        // }
}, (accessToken, refreshToken, profile, done) => {
    // check if user already exists in our own db
    User.findOne({ _id: profile.id }).then((currentUser) => {
        if (currentUser) {
            // already have this user
            currentUser.refresh_token = refreshToken;
            done(null, currentUser, refreshToken);
        } else {
            // if not, create user in our db
            var user = new User({
                _id: profile.id,
                access_token: accessToken,
                refresh_token: refreshToken,
                name: profile.displayName
            });
            user.save(function(err) {
                    if (err)
                        return done(err);
                    return done(null, user);
                }).then(newUser => console.log('created', newUser))
                .catch(err => console.log(err, 'here'))
        }
    });
}))