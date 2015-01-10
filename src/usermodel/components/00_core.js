var
  MongoClient = require('mongodb').MongoClient,
  config = require("../../config");

var AuthCollectionName = "USGMailerAuth"; //name of the collection to use for model

module.exports = function(usermodel){
  usermodel.core = {
    "db": undefined,
    "connection": undefined
  };

  usermodel.core.init = function(args, next){
    return usermodel.core.init._01(this, args, next);
  };

  usermodel.core.init._01 = function(me, args, next){
    process.stdout.write("Connecting to database ...");

    //connect to the database
    usermodel.core.connectDB(function(success, message){
      if(success){
        console.log(" Done. ");
        usermodel.core.init._02(me, args, next);
      } else {
        console.log(" Fail. ");
        console.error(message);
        console.log("Unable to connect to database, exiting with status 1. ");
        process.exit(1);
      }
    });
  }

  usermodel.core.init._02 = function(me, args, next){
    if(args.clear_db){
      //Clear the database
      me.clear().push(function(args, next){
        process.stdout.write("Clearing database ...");

        usermodel.users.reset(function(success, message){
          if(success){
            console.log(" Done. ");
            next();
          } else {
            console.log(" FAIL. ");
            console.log(message);
            process.exit(1);
          }
        });
      });
    }

    if(args.grant_user){
      //TODO: Append grant_user
      console.log("grant_user unimplemented, exiting with status 1. ");
      process.exit(1);
      me.clear();
    }

    if(args.remove_user){
      //TODO: Append remove user
      console.log("remove_user unimplemented, exiting with status 1. ");
      process.exit(1);
      me.clear();
    }

    if(args.grant_admin){
      //TODO: Append grant admin
      console.log("grant_admin unimplemented, exiting with status 1. ");
      process.exit(1);
      me.clear();
    }

    next();
  }

  usermodel.core.connectDB = function(callback){
    MongoClient.connect(config.getConfig().db, function(err, db) {
      if(!err){
        usermodel.core.db = db;
        usermodel.core.connection = db.collection(AuthCollectionName);
        callback(true)
      } else {
        return callback(false, err);
      }
    });
  }

  usermodel.core.expose_json = function(api_function, args){
    //parse the arguments to the api function
    var args = args;
    args = Array.isArray(args)?args:[];

    return function(req, res){
      //read the right parameters and store them as parameters for the api call
      var api_call = [];

      for(var i=0;i<args.length;i++){
        api_call.push(req.param(args[i]));
      }

      //and have the right callback
      var api_callback = function(success, message){
        res.jsonp({"success": success, "message": message});
      };
      api_call.push(api_callback);

      //and make the call and catch errors
      try{
        return api_function.apply(usermodel, api_call);
      } catch(e){
        api_callback(false, e.toString());
      }
    }
  }

  usermodel.core.expose_post = function(api_function, next, args){
    //parse the arguments to the api function
    var args = args;
    args = Array.isArray(args)?args:[];

    return function(req, res){
      //read the right parameters and store them as parameters for the api call
      var api_call = [];

      for(var i=0;i<args.length;i++){
        api_call.push(req.param(args[i]));
      }

      //and have the right callback
      var api_callback = function(success, message){
        next(req, res, success, message);
      };
      api_call.push(api_callback);

      //and make the call and catch errors
      try{
        return api_function.apply(usermodel, api_call);
      } catch(e){
        api_callback(false, e.toString());
      }
    }
  }

  usermodel.core.expose_json_condition = function(api_function, condition, args){
      var exposed_json = usermodel.core.expose_json(api_function, args);

      return function(req, res){
        if(condition(req, res)){
          return exposed_json(req, res);
        } else {
          res.jsonp({"success": false, "message": "Security condition failed. "});
        }
      }
  }

  usermodel.core.expose_post_condition = function(api_function, next, condition, args){
    var exposed_post = usermodel.core.expose_post(api_function, next, args);

    return function(req, res){
      if(condition(req, res)){
        return exposed_post(req, res);
      } else {
        next(req, res, false, "Security condition failed. ");
      }
    }
  }

}
