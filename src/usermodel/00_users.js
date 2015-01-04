var
  config = require("../config.js")

module.exports = function(usermodel, MongoDB){

  usermodel.checkPassword = function(user, pass, callback){
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


  usermodel.getUsers = function(callback){
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

  usermodel.setUser = function(user, newData, callback){
    //sets a specific user

    usermodel.getUser(user, function(data){
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

        //store the drafts
        if(Array.isArray(newData.drafts)){
          data.drafts = newData.drafts;
        }

        //store the sent mails
        if(Array.isArray(newData.sentMails)){
          data.sentMails = newData.sentMails;
        }

        //everything else is ignored
        MongoDB.update({"username": user}, data, callback);
      }
    });
  }

  usermodel.createUser = function(user, callback){
    //check if we already have that user


    usermodel.getUsers(function(res, data){
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
            "allowedEmails": config.getConfig().default_allowed_mails,
            "drafts": []
          };

          MongoDB.insert(newUser, function(){
            callback(true, newUser);
          });
        });
      });

    });
  }

  usermodel.getUser = function(user, callback){
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

  usermodel.deleteUser = function(user, callback){
    //delete a user.
    MongoDB.remove({"username": user}, callback);
  }

  usermodel.grant = function(user, forceAdmin, callback){

    //force admin or not.
    var finalCallback = function(){
      if(forceAdmin){
        usermodel.setUser(user, {isAdmin: true}, callback);
      } else {
        return callback(true);
      }
    }

    //grant access to user.
    usermodel.getUser(user, function(data){
      if(!data){
        usermodel.createUser(user, finalCallback);
      } else {
        finalCallback();
      }
    })
  }

  usermodel.isAdmin = function(user, callback){
    //Checks if a user is admin
    usermodel.getUser(user, function(data){
      callback(data && data.isAdmin);
    });
  }

  usermodel.getAllowedEmails = function(user, callback){
    usermodel.getUser(user, function(data){
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

  usermodel.reset = function(callback){
    //reset the entire databse
    MongoDB.remove({}, callback);
  }

}
