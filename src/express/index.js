var
    express = require("express"),
    session = require("express-session"),
    MongoStore = require("connect-mongo")(session),
    bodyParser = require("body-parser"),
    path = require("path"),
    dot = require("dot"),
    fs = require("fs"),

    usermodel = require("../usermodel")
    config = require("../config.js");

var getPath = function(){
  var args = [__dirname, "..", ".."];
  for(var i=0;i<arguments.length;i++){
    args.push(arguments[i]);
  }

  return path.join.apply(path, args);
}

var authSession = {}

//check authorisation general
authSession.checkAuth = function(req, res, callback){
  //we do not have a user, so we are not logged in.
  if (!req.session.user) {
    callback(false);
  } else {
    //check if the user is still in the database.
    usermodel.getUser(req.session.user, function(doc){
      if(!doc){
        callback(false);
      } else {
        callback(true);
      }
    });
  }
}

//check when we need a user.
authSession.needUser = function(req, res, next){
  authSession.checkAuth(req, res, function(loggedIn){
    if(!loggedIn){
      //not authorised to view this page, store the path here.
      req.session.dest_path = req.path;
      res.redirect('/login');
      res.end();
    } else {
      //ok, go on.
      next();
    }
  });
};

//check when we need an admin
authSession.needAdmin = function(req, res, next) {
  return authSession.needUser(req, res, function(){
    usermodel.isAdmin(req.session.user, function(isAdmin){
      //we are an admin
      if(isAdmin){
        next();
      } else {
        res.status(401);
        res.sendFile(getPath("static", "401.html"));
      }
    });
  });
}




module.exports.loadRoutes = function(app){
  require("fs").readdirSync(path.join(__dirname, "routes")).forEach(function(file) {
    require("./routes/" + file)(app, authSession, getPath);
  });
}

module.exports.init = function(args, next){

  //create the express js app
  var app = express();

  //create a session store
  var store = new MongoStore({
    url: config.getConfig().db
  });

  //and use the sessions now.
  app.use(session({
      secret: "idontcare",
      resave: false,
      saveUninitialized: true,
      store: store
  }))

  //also allow for parsing of post things
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
      extended: true
  }));

  //render using dot
  app.engine('html', function(path, options, callback){
    try{
      var file = fs.readFileSync(path);
      var fn = dot.template(file.toString(), {
        varname: "model",
        evaluate:    /\{\{([\s\S]+?)\}\}/g,
        interpolate: /\{\{=([\s\S]+?)\}\}/g,
        encode:      /\{\{!([\s\S]+?)\}\}/g,
        use:         /\{\{#([\s\S]+?)\}\}/g,
        define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
        conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
        iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
      });

      callback(null, fn(options));
    } catch(e){
        callback(e.message, false);
    }

  });



  //Load all the routes.
  module.exports.loadRoutes(app);

  var serverListen = function(){
    console.log("Starting server. ");

    var server = app.listen(process.env.PORT || config.getConfig().port, function(){
        var host = server.address().address;
        var port = server.address().port;

        console.log('Server listening at http://%s:%s', host, port);
    })

    //next();
  };

  if(args.keep_sessions){
    serverListen();
  } else {
    store.clear(function(err){
      console.log("Cleared old session(s) from the database. ");
      serverListen();
    });
  }
}
