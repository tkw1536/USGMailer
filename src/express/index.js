var
    express = require("express"),
    session = require("express-session"),
    MongoStore = require("connect-mongo")(session),
    bodyParser = require("body-parser"),
    path = require("path"),
    dot = require("dot"),
    fs = require("fs"),

    usermodel = require("../usermodel"),
    config = require("../config.js");

var getPath = function(){
  var args = [__dirname, "..", ".."];
  for(var i=0;i<arguments.length;i++){
    args.push(arguments[i]);
  }

  return path.join.apply(path, args);
}

module.exports.loadRoutes = function(app){
  console.log("Loading routes ...");

  require("fs").readdirSync(path.join(__dirname, "routes")).forEach(function(file) {
    var route = file.substring(0, file.length - 3);

    process.stdout.write("Loading route '"+file+"' ...");

    require("./routes/" + file)(app, usermodel, getPath);

    console.log(" Done. ");
  });

  console.log("                   Done. ");
}

module.exports.init = function(args, next){

  //create the express js app
  var app = express();

  //create a session store
  var store = new MongoStore({
    db: usermodel.core.db
  });

  //and use the sessions now.
  app.use(session({
      secret: "idontcare",
      resave: true,
      saveUninitialized: false,
      store: store
  }));

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
    process.stdout.write("Starting server...");

    var server = app.listen(process.env.PORT || config.getConfig().port, function(){
        var host = server.address().address;
        var port = server.address().port;

        console.log(' Done, server listening at http://%s:%s', host, port);
    })

    //next();
  };

  if(args.keep_sessions){
    serverListen();
  } else {
    process.stdout.write("Clearing old session(s) ...")
    store.clear(function(err){
      if(!err){
        console.log(" Done. ");
        serverListen();
      } else {
        console.log(" Fail. ");
        console.error(err);
        process.exit(1);
      }
    });
  }
}
