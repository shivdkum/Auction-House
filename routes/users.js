'use strict';
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user.js');
var config = require('../config/main');
var passport = require('passport');
var jwt = require('jsonwebtoken');

/* GET ALL USERS */
router.get('/', function (req, res, next) {
    User.find(function (err, users) {
        if (err) return next(err);
        res.json(users);
    });
});

/* GET SINGLE USER BY ID */
router.get('/:id', function (req, res, next) {
    User.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* SAVE User */
router.post('/register', function (req, res, next) {
    if (!req.body.email || !req.body.password) {
        res.json({ success: false, message: 'Please Enter a valid email and password to register.' })
    } else {
        var newUser = new User({
            email: req.body.email,
            password: req.body.password,
            username: req.body.username,
            phone: req.body.phone,
        });
    }

    newUser.save(function (err) {
        if (err) {
            return res.json({ success: false, message: 'That email address already exists.' });
        }
        res.json({ success: true, message: 'Successfully created new user.' });
    });

   // user.create(req.body, function (err, post) {
   //     if (err) return next(err);
   //     res.json(post);
   // });
});

router.post('/authenticate', function (req, res) {
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) throw err;

            if (!user) {
                res.send({ success: false, message: 'Authentication failed. User not found.' });
            } else {
                // Check if password matches
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        // Create token if the password matched and no error was thrown
                        var token = jwt.sign(user.toJSON(), config.secret, {
                            expiresIn: 100800 // in seconds
                        });
                        res.json({ success: true, token: 'JWT ' + token });
                    } else {
                        res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
                    }
                });
            }
        });
});


router.get('/dashboard', passport.authenticate('jwt', { session: false }), function (req, res) {
    res.send('It worked! User id is: ' + req.user._id + '.');
});

/* UPDATE User */
router.put('/:id', function (req, res, next) {
    User.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

module.exports = router;
