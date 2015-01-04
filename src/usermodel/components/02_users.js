var
  extend = require("extend");

module.exports = function(usermodel){
  usermodel.users = {}

  usermodel.users.getUserNames = function(callback){
    usermodel.core.connection.find({}, {"username": true}).toArray(function(err, results) {
      if(!err){
        //find the userNames
        var userNames = [];
        for(var i=0;i<results.length;i++){
          userNames.push(results[i]["username"]);
        }

        //and return them
        callback(true, userNames);
      } else {
        callback(false, error);
      }
    });
  }

  usermodel.users.getUser = function(user, callback){
    usermodel.core.connection.findOne({"username": user}, function(err, result){
      if(!err && result){
        delete result._id;
        callback(true, result);
      } else {
        callback(false, err || "User does not exist. ");
      }
    });
  }

  usermodel.users.getUsers = function(callback){
    usermodel.core.connection.find().toArray(function(err, results){
      if(!err){
        //delete the id property
        for(var i=0;i<results.length;i++){
          delete results[i]._id;
        }
        callback(true, results);
      } else {
        callback(false, err);
      }
    });
  }

  usermodel.users.hasUser = function(user, callback){
    usermodel.core.connection.findOne({"username": user}, function(err, result){
      if(!err){
        callback(true, result?true:false);
      } else {
        callback(false, err);
      }
    });
  }

  usermodel.users.createUser = function(user, callback){
    return usermodel.users.createUser._01(user, callback);
  }

  usermodel.users.createUser._01 = function(user, callback){
    usermodel.users.hasUser(user, function(success, message){
      if(success && !message){
        usermodel.users.createUser._02(user, callback);
      } else {
        callback(false, success?"User already exists":message)
      }
    });
  }

  usermodel.users.createUser._02 = function(user, callback){
    usermodel.core.connection.find({"isAdmin": true}).count(function(err, count){
      if(!err){
        usermodel.users.createUser._03(user, count == 0, callback);
      } else {
        callback(false, err);
      }
    });
  }

  usermodel.users.createUser._03 = function(user, makeAdmin, callback){
    var newUserData = {"username": user, "isAdmin": makeAdmin};

    usermodel.core.connection.insert(newUserData, function(err){
      if(!err){
        callback(true, newUserData);
      } else {
        callback(false, err);
      }
    });
  }

  usermodel.users.setUser = function(user, data, callback){
    usermodel.users.getUser(user, data, function(success, message){
      if(success){
        //extend the old user data.
        var newData = extend(message, data);
        usermodel.core.connection.update({"username": user}, newData, function(err){
          if(!err){
            callback(true, newData);
          } else {
            callback(false, err);
          }
        })
      } else {
        callback(false, message);
      }
    })
  };

  usermodel.users.deleteUser = function(user, callback){
    usermodel.users.hasUser(user, function(success, message){
      if(success && message){
        usermodel.core.connection.remove({"username": user}, function(err){
          if(!err){
            callback(true);
          } else {
            callback(false, err);
          }
        })
      } else {
        callback(false, success?"User does not exist":message)
      }
    });
  }

  usermodel.users.reset = function(callback){
    usermodel.core.connection.remove({}, function(err){
      if(!err){
        callback(true);
      } else {
        callback(false, err);
      }
    })
  }

  usermodel.users.getUserProperty = function(user, property, defaultValue, callback){
    usermodel.users.getUser(user, function(success, message){
      if(success){
        var data = message;
        if(data.hasOwnProperty(property)){
          callback(true, data[property]);
        } else {
          callback(true, defaultValue);
        }
      } else {
        callback(false, message)
      }
    })
  }

  usermodel.users.setUserProperty = function(user, property, value, callback){

    //data to store
    var data = {};
    data[property] = value;

    return usermodel.users.setUser(user, data, callback);
  }


  usermodel.users.getIsAdmin = function(user, callback){
    return usermodel.users.getUserProperty(user, "isAdmin", false, callback);
  }

  usermodel.users.setIsAdmin = function(user, isAdmin, callback){
    return usermodel.users.getUserProperty(user, "isAdmin", isAdmin, callback);
  }

  usermodel.users.getAllowedEmails = function(user, callback){
    return usermodel.users.getUserProperty(user, "allowedEmails", [], callback);
  }

  usermodel.users.setAllowedEmails = function(user, allowedEmails, callback){
    return usermodel.users.getUserProperty(user, "setAllowedEmails", allowedEmails, callback);
  }

  usermodel.users.getDrafts = function(user, callback){
    return usermodel.users.getUserProperty(user, "storedDrafts", [], callback);
  }

  usermodel.users.setDrafts = function(user, drafts, callback){
    return usermodel.users.getUserProperty(user, "storedDrafts", drafts, callback);
  }
}
