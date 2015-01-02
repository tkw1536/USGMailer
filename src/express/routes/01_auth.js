var
  express = require("express"),
  auth = require("../../auth");

module.exports = function(app, session, path){
  console.log("Loading Routes: /login /logout");

  app.get("/login", function(req, res){
    session.checkAuth(req, res, function(loggedIn){
      if(loggedIn){
        //we are already logged in.
        //so send the user to the home page.
        res.redirect("/");
      } else {
        //the user should login now.
        res.sendFile(path("static", "auth", "login.html"));
      }
    });
  });

  //login POST
  app.post('/login', function (req, res) {
      var post = req.body;
      var user = post.user || "";
      var pass = post.password || "";
      auth(user, pass, function(success){
        if(success){
          req.session.user = user;
          var redirect_to = "/";

          //check if we have a redirect cookie.
          //if so redirect to it
          if(req.session.dest_path){
            redirect_to = req.session.dest_path;
            delete req.session.dest_path;
          }
          res.redirect(redirect_to);
        } else {
          res.sendFile(path("static", "auth", "fail.html"));
        }
      });
  });

  //LOGOUT
  app.get('/logout', function(req, res) {
      req.session.destroy(function(){
        try{
          delete req.session.user;
        } catch(e){}
        res.sendFile(path("static", "auth", "logout.html"));
      });
  });

}
