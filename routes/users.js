var express = require('express');
var passport =require("passport");
var LocalStrategy = require("passport-local").Strategy;
var multer = require ("multer");
var router = express.Router();

var User = require ("../models/user");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/register', function(req, res, next) {
  res.render("register",{
  	"title" : "Register"
  });
});
router.get('/login', function(req, res, next) {
  res.render("login",{
  	"title":"Login"
  });
});
router.post("/register",multer({dest: '../uploads/'}).single("upl"),function(req, res, next){
	// Get Form Values
	var name = req.body.name;
	var email = req.body.email;
	var gender = req.body.gender;
	var work = req.body.work;
	var address = req.body.address;
	var phone =req.body.phone;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

// Check for image field
if( req.files && req.files.profileimage){
	console.log("Uploading files...");
	// file info
	var profileImageOriginalName = req.files.profileimage.originalname;
	var profileImageName = req.files.profileimage.name;
	var profileImageMime = req.files.profileimage.mimetype;
	var profileImagePath = req.files.profileimage.path;
	var profileImageExt = req.files.profileimage.extension;
	var profileImageSize = req.files.profileimage.size;
}else{
	// set a default image
	var profileImageName="noimage.png";
}
// form validation
req.checkBody("name","Name field is required").notEmpty();
req.checkBody("email","Email field is required").notEmpty();
req.checkBody("email","Email not valid").isEmail();
req.checkBody("gender","Gender is required").notEmpty();
req.checkBody("work","Designation is required").notEmpty();
req.checkBody("address","Address is required").notEmpty();
req.checkBody("phone","Must be numbers").isInt();
req.checkBody("username"," Username is required").notEmpty();
req.checkBody("password","password field is required").notEmpty();
req.checkBody("password2","password donot match").equals(req.body.password);

// check for errors
var errors =req.validationErrors();
if(errors){
	res.render("register",{
		errors: errors,
		name: name,
		email: email,
		gender:gender,
		work:work,
		address:address,
		phone:phone,
		username: username,
		password: password,
		password2: password2
	});

}else{
	var newUser =new User({
		name: name,
		email: email,
		gender:gender,
		work:work,
		address:address,
		phone:phone,
		username: username,
		password: password,
		profileimage: profileImageName
	});
	// create User
	User.createUser(newUser,function(err, user){
		if(err) throw err;
		console.log(user);
	});
	// Success Message
	req.flash("success_msg","you are now registered and may login");
	res.redirect("/users/login");
}
});
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new LocalStrategy(
	function(username,password,done){
		User.getUserByUsername(username,function(err,user){
			if(err) throw err;
			if(!user){
				console.log("Unknown User");
				return done(null,false,{message: "Unknown User"});
			}
			User.comparePassword(password,user.password,function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null,user);
				}
				else{
					console.log("Invalid Password");
					return done(null,false,{message:"Invalid Password"});
				}
			});
		});

	}
	));
router.post("/login",passport.authenticate("local",{successRedirect:"/",failureRedirect:"/users/login",failureFlash:"Invalid Username or password"}),function(req,res){
console.log("Authentication Successful");
req.flash("success_msg","you are logged in");
res.redirect("/");
});
router.get("/logout",function(req,res){
	req.logout();
	req.flash("success_msg","you have logged out");
	res.redirect("/users/login");
});
module.exports = router;
