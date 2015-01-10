module.exports = function(usermodel){
  usermodel.admin = {};

  usermodel.admin.getUser = function(user, callback){
    return usermodel.admin.getUser._01(user, callback);
  }

  usermodel.admin.getUser._01 = function(user, callback){
    var result = {"username": user};

    usermodel.users.getIsAdmin(user, function(success, message){
      if(success){
        result["isAdmin"] = message;
        usermodel.admin.getUser._02(result, user, callback);
      } else {
        callback(false, message);
      }
    });
  }

  usermodel.admin.getUser._02 = function(result, user, callback){
    usermodel.users.getAllowedEmails(user, function(success, message){
      if(success){
        result["allowedEmails"] = message;
        callback(true, result);
      } else {
        callback(false, message);
      }
    })
  }

  usermodel.admin.getAll = function(callback){
    return usermodel.admin.getAll._01(callback);
  }

  usermodel.admin.getAll._01 = function(callback){
    usermodel.users.getUserNames(function(success, message){
      if(success){
        usermodel.admin.getAll._02(message, 0, callback)
      } else {
          callback(false, message);
      }
    });
  }

  usermodel.admin.getAll._02 = function(data, i, callback){
    if(i < data.length){
      usermodel.admin.getUser(data[i], function(success, message){
        if(success){
          data[i] = message;
          usermodel.admin.getAll._02(data, i+1, callback);
        } else {
          callback(false, message);
        }
      });
    } else {
      callback(true, data);
    }
  }
}
