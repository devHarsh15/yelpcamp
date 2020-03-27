var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var flash = require("connect-flash");
var methodOverride = require("method-override");
var passportLocalMongoose = require("passport-local-mongoose");
var Comment = require("./models/comment.js");
var seedDB = require("./seeds.js");
var Campground = require("./models/campground.js");
var User = require("./models/user.js");
// mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb+srv://harsh:harsh1525@yelpcamp-aqxfo.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static( __dirname + "/public"));
app.use(flash());
app.use(methodOverride("_method"));
// seedDB();
app.locals.moment = require("moment");
//passport config....//
app.use(require("express-session")({
    secret: "this is the secret",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.deleted = req.flash("deleted");
    res.locals.edited = req.flash("edited");
    res.locals.done = req.flash("done");
    next();
});

app.get("/", function(req, res){
    res.render("landing.ejs");
});

app.get("/campgrounds", function(req, res){
   Campground.find({}, function(err, all){
       if(err){
           console.log("Error occured!!!!!");
       } else{
            res.render("campgrounds.ejs",{camps:all});
       }
   })
});

app.post("/campgrounds", isLoggedIn, function(req,res){
    var name = req.body.name
    var image = req.body.image
    var description = req.body.description
    var price = req.body.price
    var author = {
        id: req.user._id,
        username: req.user.username,
    }
    var newEntry = {name: name, image: image, description: description, author: author, price: price}
    Campground.create(newEntry, function(err, resp){
        if(err){
            console.log("Error occured!");
        } else{
            console.log(resp);
            res.redirect("/campgrounds");
        }
    });
});

app.get("/campgrounds/new", isLoggedIn, function(req,res){
    res.render("new.ejs");
});

app.get("/campgrounds/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, ress){
        if(err){
            console.log("error at campground");
            console.log(err);
        } else{
            console.log(ress);
            res.render("show.ejs", {campground:ress});
        }
    });
});

//==========EDIT, DESTROY and UPDATE routes============================//
//EDIT route.............................
app.get("/campgrounds/:id/edit", checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else{
            res.render("edit.ejs", {campsss: foundCampground});
        }
    });
});
//UPDATE route............................
app.put("/campgrounds/:id", checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campsss, function(err, updatedCampground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else{
            req.flash("edited", "The campground has been updated.")
            res.redirect("/campgrounds/" + req.params.id)
        }
    });
});
//DESTROY route..........................
app.delete("/campgrounds/:id", checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err, remove){
        if(err){
            console.log(err);
        } else{
            req.flash("deleted", "The campground has been removed");
            res.redirect("/campgrounds");
        }
    });
});


//======================comments route========================//
app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else{
            res.render("newcomment.ejs", {campground: campground});
        }
    });
});
//........................................................
app.post("/campgrounds/:id/comments", isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + req.params.id)
                }
            });
        }
    });
});
//COMMENTS edit, update and destroy routes.................
app.get("/campgrounds/:id/comments/:comment_id/edit", checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, page){
        if(err){
            console.log(err);
        } else{
            res.render("editcomment.ejs", {camp_id: req.params.id, comment: page});
        }
    });
});
//.................................................
app.put("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else{
            req.flash("edited", "Comment has been updated.")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});
//..................................................
app.delete("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err, removeComment){
        if(err){
            console.log(err);
        } else{
            req.flash("deleted", "Comment deleted successfully");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//=============auth routes==================//
//Register form..................
app.get("/register", function(req,res){
    res.render("register.ejs");
});
app.post("/register", function(req,res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("/register");
        } else{
            passport.authenticate("local")(req, res, function(){
                req.flash("done", "Successfully signed up! Welcome to yelpcamp " + user.username);
                res.redirect("/campgrounds");
            });
        }
    });
});

//LOGIN feature............................
app.get("/login", function(req,res){
    res.render("login.ejs");
});
//login logic
app.post("/login", passport.authenticate("local",
     {
         successRedirect: "/campgrounds",
         failureRedirect: "/login",
     }), function(req,res){
});

//LOGOUT feature...................
app.get("/logout", function(req,res){
    req.logOut();
    req.flash("success", "Successfully logged out.");
    res.redirect("/campgrounds");
});
//=============================================//

//=================MIDDLEWARE===============//
//checking login
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please login first!");
    res.redirect("/login");
}
//..........................................//
//adding authorization
function checkCampgroundOwnership(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                res.redirect("/campgrounds");
            } else{
                //does user own the campground?
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                } else{
                    res.send("you dont have permission to do that!");
                }
            }
        });
    } else{
        res.send("you need to be logged in!");
    }
}
//comment authorization.................................
function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("/campgrounds");
            } else{
                //does user own the comment?
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else{
                    res.send("you dont have permission to do that!");
                }
            }
        });
    } else{
        res.send("you need to be logged in!");
    }
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has STARTED!!!!");
});