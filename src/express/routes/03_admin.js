var
  express = require("express")
  usermodel = require("../../usermodel");

module.exports = function(app, session, path){
  console.log("Loading Routes: /admin");

  //get the admin interface
  app.get('/admin', session.needAdmin, function (req, res) {
    res.sendFile(path("static", "admin", "index.html"));
  });


  //Backend: Get Users
  app.get("/admin/backend/get_users", session.needAdmin, function(req, res){
    usermodel.getUsers(function(success, users){
      users.sort();
      res.jsonp({"success": success, "users": users});
    });
  });

  //Backend: Get User
  app.get("/admin/backend/get_user", session.needAdmin, function(req, res){
    usermodel.getUser(req.param("user"), function(user){
      res.jsonp({"success": user?true:false, "user": user});
    });
  });

  app.get("/admin/backend/impersonate_user", session.needAdmin, function(req, res){
    //flip session
    req.session.user = req.param("user");
    res.jsonp({"success": true})
  })

  //Backend: Set User
  app.get("/admin/backend/set_user", session.needAdmin, function(req, res){
    var toParam = req.param("to");

    if(toParam.hasOwnProperty("isAdmin") && typeof toParam.isAdmin === "string"){
      toParam.isAdmin = (toParam.isAdmin.toLowerCase() === "true");
    }

    //you can not de-admin yourself
    if(req.session.user == req.param("user") && toParam && toParam.isAdmin === false){
      res.jsonp({"success": false});
      return;
    }

    usermodel.setUser(req.param("user"), toParam, function(err){
      res.jsonp({"success": !err});
    });
  });

  //Backend: Delete User
  app.get("/admin/backend/delete_user", session.needAdmin, function(req, res){
    //you can not delete you own user.
    if(req.session.user == req.param("user")){
      res.jsonp({"success": false});
      return;
    }

    usermodel.deleteUser(req.param("user"), function(err){
      res.jsonp({"success": !err});
    });
  });

  //Backend: Create User
  app.get("/admin/backend/create_user", session.needAdmin, function(req, res){
    usermodel.createUser(req.param("user"), function(success, newUser){
      res.jsonp({"success": success, "newUser": newUser});
    });
  });

  //Backend: whoami
  app.get("/admin/backend/whoami", session.needAdmin, function(req, res){
    res.jsonp({"username": req.session.user});
  })

}
