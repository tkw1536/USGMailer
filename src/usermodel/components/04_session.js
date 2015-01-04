var
  path = require("path");

module.exports = function(usermodel){
  usermodel.session = {};

  usermodel.session.hasSession = function(req, res, callback){
    if(req.session.user){
      //check if the user is still in the database
      usermodel.users.hasUser(req.session.user, callback);
    } else {
      callback(true, false);
    }
  }

  usermodel.session.login = function(req, res, callback){
    return usermodel.session.login._01(req, res, callback);
  }

  usermodel.session.login._01 = function(req, res, callback){
    var username = req.param("user");
    var password = req.param("password");

    usermodel.auth.checkPassword(username, password, function(success, message){
      if(success){
        var user = message;
        usermodel.session.login._02(user, req, res, callback);
      } else {
        callback(false, message);
      }
    });
  }

  usermodel.session.login._02 = function(user, req, res, callback){
    usermodel.users.hasUser(user, function(success, message){
      if(success && message){
        usermodel.session.login._04(user, req, res, callback);
      } else {
        usermodel.session.login._03(user, req, res, callback);
      }
    })
  };

  usermodel.session.login._03 = function(user, req, res, callback){
    usermodel.users.getUserNames(function(success, message){
      if(success && message.length == 0){
        usermodel.users.createUser(user, function(success, message){
          if(success){
            usermodel.session.login._04(user, req, res, callback);
          } else {
            callback(false, message);
          }
        })
      } else {
        callback(false, success?"User does not exist. ":message);
      }
    });
  }

  usermodel.session.login._04 = function(user, req, res, callback){
    req.session.user = user;
    callback(true);
  };

  usermodel.session.endSession = function(req, res, callback){
    req.session.regenerate(function(err){
      if(!err){
        callback(true);
      } else {
        try{
          delete req.session.user;
        } catch(e){}

        callback(true);
      }
    });
  }

  usermodel.session.needUser = function(req, res, next){
    usermodel.session.hasSession(req, res, function(success, message){
      if(success){
        if(message){
          next();
        } else {
          req.session.dest_path = req.originalUrl;
          res.redirect("/login");
        }
      } else {
        res.status(500);
        res.end();
      }
    })
  }

  usermodel.session.needAdmin = function(req, res, next){
    usermodel.session.needUser(req, res, function(){
      usermodel.users.getIsAdmin(req.session.user, function(success, message){
        if(success){
          if(message){
            next();
          } else {
            res.status(401);
            res.sendFile(path.join(__dirname, "..", "..", "..", "static", "401.html"));
          }
        } else {
          res.status(500);
          res.end();
        }
      });
    });
  }

}
