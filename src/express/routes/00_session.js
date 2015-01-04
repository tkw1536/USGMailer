var
  express = require("express");

module.exports = function(app, usermodel, path){
  app.get("/login", function(req, res){
    usermodel.session.hasSession(req, res, function(success, message){
      if(success){
        if(message){
          res.redirect("/");
        } else {
          res.render(path("static", "usermodel", "index.html"));
        }
      } else {
        res.status(500);
      }
    });
  });

  //login POST
  app.post('/login', function (req, res) {
    usermodel.session.login(req, res, function(success, message){
      if(success){
        var redirect_to = "/";

        //check if we have a redirect cookie.
        //if so redirect to it
        if(req.session.dest_path){
          redirect_to = req.session.dest_path;
          delete req.session.dest_path;
        }
        res.redirect(redirect_to);
      } else {
        res.render(path("static", "usermodel", "index.html"), {"message": "Login failed. "});
      }
    });
  });

  //LOGOUT
  app.get('/logout', function(req, res) {
      usermodel.session.endSession(req, res, function(success, message){
        if(success){
          res.redirect("/login");
        } else {
          res.status(500);
        }
      })
  });

  app.get('/backend/whoami', usermodel.session.needUser, function(req, res){
    res.jsonp({"success": true, "username": req.session.user});
  });

}
