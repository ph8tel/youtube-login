const router = require('express').Router();
const passport = require('passport');
var axios = require('axios')
var youtube = require('../youtubeLogic/youtube')
const User = require('../models/user-model');
const YAPI = process.env.YAPI || require('../config/keys').youTube.API_KEY
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
    let userData = await youtube.gimmeAll(req.user._id, YAPI)
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
    if (referer === 'http://getmyyoutubedata.herokuapp.com/') {
        res.render('youtubeVideos', responseObject)
    } else {
        res.redirect(`http://localhost:5000/${req.user.name}/${req.user._id}`)
    }
});

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.render('profile', { user: req.user });
});


module.exports = router;