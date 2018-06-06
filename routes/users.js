var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/newsaggregator');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res) {
  var collection = db.get('users');
  console.log(req.query)
  collection.findOne({username: req.query.username, password: req.query.password}, function(err, users){
    	if (err) throw err;
    	console.log(users)
        res.json(users);
   });
});

router.post('/register', function(req, res){
	
	var name = req.body.user.name;
	var email = req.body.user.email;
	var username = req.body.user.username;
	var password = req.body.user.password;
	var password2 = req.body.user.password2;
	var error = 1;
	User.getUserByUsername(username, function(err, user){
		if(err) throw err;
		console.log("I AM IN")
		if(user == null){
			error = 0;
		}

		if(error == 0){
			if(req.body.user.modCode == '9999'){
				var newUser = new User({
					name: name,
					email:email,
					username: username,
					password: password,
					isMod: 1
				});
			} else {
				var newUser = new User({
					name: name,
					email:email,
					username: username,
					password: password,
					isMod: 0
				});
			}

			User.createUser(newUser, function(err, user){
				if(err) throw err;
				console.log(user);

				console.log("You are registered and can now login")
				res.send({msg: 'You are registered and can now login'});
			});
		} else {
			console.log("Use another username")
			res.send({msg: 'Username taken, please try again'});
		}
	});
	//	res.redirect('/#/login');
	
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {	
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/#/', failureRedirect:'/#/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	//req.flash('success_msg', 'You are logged out');

	res.redirect('/#/login');
});

module.exports = router;