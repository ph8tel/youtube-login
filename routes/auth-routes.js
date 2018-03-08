const router = require('express').Router();
const passport = require('passport');
// const keys = process.env.keys || require('../config/keys');
var axios = require('axios')
var youtube = require('../youtubeLogic/youtube')
const User = require('../models/user-model');
var referer
    // auth login
router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
});

// auth logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// auth with google+
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));
// auth with youtube
router.get('/youtube',
    passport.authenticate('youtube'),
    (req, res) => {
        referer = req.header('Referer')
        console.log('ref is ', referer)
    }
);
// send back all of the
router.get('/youtube/callback', passport.authenticate('youtube'), async(req, res) => {
    let userComplete = req.user
    let userData = await youtube.gimmeAll(req.user._id, process.env.YAPI)
        // userData.user = req.user

    User.findOneAndUpdate({ _id: req.user._id }, { videos: userData.videos, comments: userData.comments }, { fields: 'data' }, function(err) {
        if (err) {
            console.log(err, 'err in update db')
        }
    })
    let responseObject = {
        data: userData.videos,
        comments: userData.comments,
        user: req.user
    }

    res.render('youtubeVideos', responseObject)

});

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.render('profile', { user: req.user });
});


module.exports = router;