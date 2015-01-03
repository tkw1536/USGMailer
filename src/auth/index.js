var
  MongoClient = require('mongodb').MongoClient,

  config = require("../config.js");

//the database
var MongoDB;

//have: authentication
var auth = function(user, pass, callback){
  auth.checkPassword(user, pass, function(s, user){
    if(!s){
      callback(false);
      return;
    }

    auth.getUser(user, function(data){
      if(!data){
        //check how many users we have
        auth.getUsers(function(res, data){
          if(!res){
            //we can't get users.
            //something went wrong.
            callback(false);
            console.log("Error, unable to check number of users!");
          } else if(data.length == 0){
            //we have 0 users.
            //so we create the new one.
            //he is automatically made admin.
            auth.createUser(user, function(err){
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

/**
* Intialises the authentication and db thing.
*/
auth.init = function(args, next){

  var me = this;

  MongoClient.connect(config.getConfig().db, function(err, db) {
    if(!err) {
      MongoDB = db.collection("USGMailerAuth");
      console.log("Connected to database at ", config.getConfig().db);

      if(args.clear_db){
        //we are supposed to clear the database
        me.theQuenue = [];
        me.push(function(args, next){
          auth.reset(function(err){
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
          auth.grant(args.grant_user, false, next);
        });
      }

      if(args.remove_user){

        //remove the user.
        me.theQuenue = [];
        me.push(function(args, next){
          console.log("Removing '"+args.remove_user+"' from database. ");
          auth.deleteUser(args.remove_user, next);
        });
      }

      if(args.grant_admin){

        var user = "";

        //grant the user admin
        me.theQuenue = [];
        me.push(function(args, next){
          console.log("Granting '"+args.grant_admin+"' admin access. ");
          auth.grant(args.grant_admin, true, next);
        });
      }

      next();
    } else {
      console.error("Could not connect to database. ");
      process.exit(1);
    }
  });

}

auth.checkPassword = function(user, pass, callback){
  //check the password of a user
  //TODO: Authorise with LDAP here

  if(
      (user == "jack" && pass == "password") ||
      (user == "john" && pass == "password")
  ){
    //TODO: return email here
    callback(true, user.toLowerCase());
  } else {
    callback(false);
  }
};

auth.grant = function(user, forceAdmin, callback){

  //force admin or not.
  var finalCallback = function(){
    if(forceAdmin){
      auth.setUser(user, {isAdmin: true}, callback);
    } else {
      return callback(true);
    }
  }

  //grant access to user.
  auth.getUser(user, function(data){
    if(!data){
      auth.createUser(user, finalCallback);
    } else {
      finalCallback();
    }
  })
}

auth.createUser = function(user, callback){
  //check if we already have that user


  auth.getUsers(function(res, data){
    if(!data){
      var data = [];
    }

    if(data.indexOf(user) != -1){
      //we already have this user.
      callback(false);
      return;
    }

    //so create the user.
    MongoDB.find({"isAdmin": true}, function(err, res){
      res.count(function(err, count){
        //count of existing admins
        var newUser = {
          "username": user,
          "isAdmin": count == 0,
          "allowedEmails": config.getConfig().default_allowed_mails
        };

        MongoDB.insert(newUser, function(){
          callback(true, newUser);
        });
      });
    });

  });
}

auth.getUser = function(user, callback){
  //get a single user
  MongoDB.findOne({"username": user}, function(err, doc){
    if(err){
      callback(false);
      return;
    } else {
      callback(doc);
    }

  });
};

auth.isAdmin = function(user, callback){
  //Checks if a user is admin
  auth.getUser(user, function(data){
    callback(data && data.isAdmin);
  });
}


auth.getUsers = function(callback){
  //get all user names
  MongoDB.find(function(err, doc){
    if(err){
      callback(false);
    } else {
      doc.toArray(function(err, data){
        if(err){
          callback(false);
        } else {
          var users = [];
          for(var i=0;i<data.length;i++){
            users.push(data[i].username);
          }
          callback(true, users);
        }
      })
    }
  });
}

auth.setUser = function(user, newData, callback){
  //sets a specific user

  auth.getUser(user, function(data){
    if(!data){
      callback(false);
    } else {
      delete data._id; //drop the id

      //set admin if boolean
      if(typeof newData.isAdmin == "boolean"){
        data.isAdmin = newData.isAdmin;
      }

      //set allowedEmails if an Array
      if(Array.isArray(newData.allowedEmails)){
        data.allowedEmails = newData.allowedEmails;
      }

      //everything else is ignored
      MongoDB.update({"username": user}, data, callback);
    }
  });
}

auth.getAllowedEmails = function(user, callback){
  auth.getUser(user, function(data){
    if(!data){
      callback([]);
      return;
    } else {
      var mails = data["allowedEmails"];
      var uMails = [user];

      for(var i=0;i<mails.length;i++){
        if(uMails.indexOf(mails[i]) == -1){
          uMails.push(mails[i]);
        }
      }

      callback(uMails);
    }
  });
}

auth.deleteUser = function(user, callback){
  //delete a user.
  MongoDB.remove({"username": user}, callback);
}

auth.reset = function(callback){
  //reset the entire databse
  MongoDB.remove({}, callback);
}

module.exports = auth;
