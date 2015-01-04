var
  MongoClient = require('mongodb').MongoClient;

//the database
var MongoDB;

//model for the users in the db.
var usermodel = module.exports = function(user, pass, callback){
  usermodel.checkPassword(user, pass, function(s, user){
    if(!s){
      callback(false);
      return;
    }

    usermodel.getUser(user, function(data){
      if(!data){
        //check how many users we have
        usermodel.getUsers(function(res, data){
          if(!res){
            //we can't get users.
            //something went wrong.
            callback(false);
            console.log("Error, unable to check number of users!");
          } else if(data.length == 0){
            //we have 0 users.
            //so we create the new one.
            //he is automatically made admin.
            usermodel.createUser(user, function(err){
              callback(err, user);
            });
          } else {
            callback(false);
          }
        });

        return;
      } else {
        //already exists
        callback(true, user);
      }
    });
  })
};

usermodel.init = function(args, next){

  var me = this;

  MongoClient.connect(config.getConfig().db, function(err, db) {
    if(!err) {
      MongoDB = db.collection("USGMailerAuth");
      console.log("Connected to database at ", config.getConfig().db);

      //load the other compontens now
      usermodel.loadComponents();

      if(args.clear_db){
        //we are supposed to clear the database
        me.theQuenue = [];
        me.push(function(args, next){
          usermodel.reset(function(err){
            if(!err){
              console.log("Database reset. ");
            } else {
              console.error(e);
              console.log("Error resetting database, exiting with status 1. ");
              process.exit(1);
            }

            next();
          });
        });
      }

      if(args.grant_user){
        //grant the user access.
        me.theQuenue = [];
        me.push(function(args, next){
          console.log("Granting '"+args.grant_user+"' access. ");
          usermodel.grant(args.grant_user, false, next);
        });
      }

      if(args.remove_user){
        //remove the user.
        me.theQuenue = [];
        me.push(function(args, next){
          console.log("Removing '"+args.remove_user+"' from database. ");
          usermodel.deleteUser(args.remove_user, next);
        });
      }

      if(args.grant_admin){
        //grant the user admin
        me.theQuenue = [];
        me.push(function(args, next){
          console.log("Granting '"+args.grant_admin+"' admin access. ");
          usermodel.grant(args.grant_admin, true, next);
        });
      }

      next();
    } else {
      console.error("Could not connect to database. ");
      process.exit(1);
    }
  });

}

usermodel.loadComponents = function(){
  //Load the other components
  require("./00_users.js")(usermodel, MongoDB);
  require("./01_drafts.js")(usermodel, MongoDB);
}
