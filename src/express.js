var
    express = require("express"),
    session = require("express-session"),
    MongoStore = require('connect-mongo')(session);
    bodyParser = require('body-parser'),
    path = require("path"),

    config = require("../config.json"),
    auth = require("./auth");

var staticPath = path.join(__dirname, "..", "static");

//create the express js app
var app = express();

//create a session store
var store = new MongoStore({
  url: config.db
})

//Clear existing sessions on startup
store.clear(function(err){
  console.log("Sessions system reset and ready!");
});

//and use the sessions now.
app.use(session({
    secret: "idontcare",
    resave: false,
    saveUninitialized: true,
    store: store
}))

//also allow for parsing of post things
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));


function isAuthorisedFull(req, res, callback){
  if (!req.session.user) {
    //we do not have a user, so we are not logged in.
    callback(false);
  } else {
    //check if the user is still in the database.
    auth.getUser(req.session.user, function(doc){
      if(!doc){
        callback(false);
      } else {
        callback(true);
      }
    });
  }
}

function checkAuth(req, res, next) {
  isAuthorisedFull(req, res, function(loggedIn){
    if(!loggedIn){
      //not authorised to view this page, store the path here.
      req.session.dest_path = req.path;
      res.redirect('/login');
      res.end();
    } else {
      //ok, go on.
      next();
    }
  })
}

function checkAdminAuth(req, res, next) {
  return checkAuth(req, res, function(){
    auth.isAdmin(req.session.user, function(isAdmin){
      //we are an admin
      if(isAdmin){
        next();
      } else {
        res.status(401);
        res.sendFile(path.join(staticPath, "401.html"));
      }
    });
  });
}

/*
* Auth routes
*/

//login GET
app.get("/login", function(req, res){
  isAuthorisedFull(req, res, function(loggedIn){
    if(loggedIn){
      //we are already logged in.
      //so send the user to the home page.
      res.redirect("/");
    } else {
      //the user should login now.
      res.sendFile(path.join(staticPath, "auth", "login.html"));
    }
  });
});

//login POST
app.post('/login', function (req, res) {
    var post = req.body;
    var user = post.user || "";
    var pass = post.password || "";
    auth(user, pass, function(success){
      if(success){
        req.session.user = user;
        var redirect_to = "/";

        //check if we have a redirect cookie.
        //if so redirect to it
        if(req.session.dest_path){
          redirect_to = req.session.dest_path;
          delete req.session.dest_path;
        }
        res.redirect(redirect_to);
      } else {
        res.sendFile(path.join(staticPath, "auth", "fail.html"));
      }
    });
});

//LOGOUT
app.get('/logout', function(req, res) {
    req.session.destroy(function(){
      try{
        delete req.session.user;
      } catch(e){}
      res.sendFile(path.join(staticPath, "auth", "logout.html"));
    });
});

//server libraries correctly
//first use bower_components for this
app.use("/lib", express.static(path.join(__dirname, "..", "bower_components")));
app.use("/lib", express.static(path.join(__dirname, "..", "lib")));

/*
* ADMIN
*/
//get the admin interface
app.get('/admin', checkAdminAuth, function (req, res) {
  res.sendFile(path.join(staticPath, "admin", "index.html"));
});

//Backend: Get Users
app.get("/admin/backend/get_users", checkAdminAuth, function(req, res){
  auth.getUsers(function(success, users){
    res.jsonp({"success": success, "users": users});
  });
});

//Backend: Get User
app.get("/admin/backend/get_user", checkAdminAuth, function(req, res){
  auth.getUser(req.param("user"), function(user){
    res.jsonp({"success": user?true:false, "user": user});
  });
});

//Backend: Set User
app.get("/admin/backend/set_user", checkAdminAuth, function(req, res){
  var toParam = req.param("to");

  //you can not de-admin yourself
  if(req.session.user == req.param("user") && toParam && toParam.isAdmin === false){
    res.jsonp({"success": false});
    return;
  }

  auth.setUser(req.param("user"), toParam, function(success){
    res.jsonp({"success": success});
  });
});

//Backend: Delete User
app.get("/admin/backend/delete_user", checkAdminAuth, function(req, res){
  //you can not delete you own user.
  if(req.session.user == req.param("user")){
    res.jsonp({"success": false});
    return;
  }

  auth.deleteUser(req.param("user"), function(err){
    res.jsonp({"success": !err});
  });
});

//Backend: Create User
app.get("/admin/backend/create_user", checkAdminAuth, function(req, res){
  auth.createUser(req.param("user"), function(success, newUser){
    res.jsonp({"success": success, "newUser": newUser});
  });
});

//get top level
app.get('/', checkAuth, function (req, res) {
  res.sendFile(path.join(staticPath, "sender", "index.html"));
});

//and finally a 404
app.use(function(req, res, next){
  res.status(404);
  res.sendFile(path.join(staticPath, "404.html"));
});


module.exports.app = app;
