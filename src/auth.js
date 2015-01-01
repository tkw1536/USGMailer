var
  MongoClient = require('mongodb').MongoClient
  config = require("../config.json");

var MongoDB;
MongoClient.connect(config.db, function(err, db) {
  if(!err) {
    MongoDB = db.collection("USGMailerAuth");
    console.log("Connected to database. ");
  } else {
    console.error("Could not connect to database. ");
    process.exit(1);
  }
});


var auth = function(user, pass, callback){
  auth.checkPassword(user, pass, function(s, user){
    if(!s){
      callback(false);
      return;
    }

    auth.getUser(user, function(data){
      if(!data){
        auth.createUser(user, function(err){
          callback(err, user);
        });
        return;
      } else {
        callback(true, user);
      }
    });
  })
}

auth.checkPassword = function(user, pass, callback){
  //check the password of a user
  //TODO: Authorise with LDAP here

  if(
      (user == "jack" && pass == "password") ||
      (user == "john" && pass == "password")
  ){
    //TODO: return password here.
    callback(true, user.toLowerCase());
  } else {
    callback(false);
  }
};

auth.createUser = function(user, callback){
  MongoDB.find({"isAdmin": true}, function(err, res){
    res.count(function(err, count){
      //count of existing admins
      var newUser = {
        "username": user,
        "isAdmin": count == 0,
        "allowedEmails": config.default_allowed_mails
      };

      //TODO: Create a user.
      MongoDB.insert(newUser, function(){
        callback(true, newUser);
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
}

auth.setUser = function(user, data){
  //sets a specific user
}

auth.deleteUser = function(user){
  //deletes a user
}

module.exports = auth;
