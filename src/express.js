var
    express = require("express"),
    session = require("express-session"),
    MongoStore = require('connect-mongo')(session);
    bodyParser = require('body-parser'),
    path = require("path"),

    config = require("../config.json"),
    auth = require("./auth");

//create the express js app
var app = express();

//create a session store
var store = new MongoStore({
  url: config.db
})

store.clear(function(err){
  console.log("Sessions system reset and ready!");
});

app.use(session({
    secret: "idontcare",
    resave: false,
    saveUninitialized: true,
    store: store
}))

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));

function checkAuth(req, res, next) {
    if (!req.session.user) {
        //not authorised to view this page
        res.redirect('/login');
        res.end();
    } else {
      auth.getUser(req.session.user, function(doc){
        if(!doc){
          //session was here but the user is no longer in the db
          //so redirect him to logout
          res.redirect('/logout');
          res.end();
        } else {
          next();
        }
      });
    }
}

// LOGIN ROUTE
app.get("/login", function(req, res){
    res.sendFile(path.join(__dirname, "..", "static", "login.html"));
});

app.post('/login', function (req, res) {
    var post = req.body;
    var user = post.user || "";
    var pass = post.password || "";
    auth(user, pass, function(success){
      if(success){
        req.session.user = user;
        res.redirect('/');
      } else {
        res.sendFile(path.join(__dirname, "..", "static", "fail.html"));
      }
    });
});

// LOGOUT ROUTE

app.get('/logout', function(req, res) {
    req.session.destroy(function(){
      try{
        delete req.session.user;
      } catch(e){}
      res.sendFile(path.join(__dirname, "..", "static", "logout.html"));
    });
});

// LIB ROUTE

app.use("/lib", express.static(path.join(__dirname, "..", "bower_components")));
app.use("/lib", express.static(path.join(__dirname, "..", "lib")));

//AND THIS IS IT
app.get('/', checkAuth, function (req, res) {
  // we are admin and can send mails
  auth.isAdmin(req.session.user, function(isAdmin){
    if(isAdmin){
      res.sendFile(path.join(__dirname, "..", "static", "welcome", "admin.html"));
    } else {
      res.sendFile(path.join(__dirname, "..", "static", "welcome", "normal.html"));
    }
  });


});


module.exports.app = app;
