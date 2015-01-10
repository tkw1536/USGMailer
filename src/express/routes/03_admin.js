var
  express = require("express")
  usermodel = require("../../usermodel");

module.exports = function(app, usermodel, path){
  app.get("/admin", usermodel.session.needAdmin, function(req, res){
    usermodel.admin.getAll(function(success, message){
      res.render(path("static", "admin", "index.html"), {"message": success?undefined:message, "user": req.session.user, "users": success?message:[]});
    });
  });

  var renderAdminResult = function(message_success){
    return function(req, res, success, message){
      usermodel.admin.getAll(function(successInner, messageInner){
        if(success){
          res.render(path("static", "admin", "index.html"), {"message_ok": message_success, "message": successInner?undefined:messageInner, "user": req.session.user, "users": successInner?messageInner:[]});
        } else {
          res.render(path("static", "admin", "index.html"), {"message": message, "user": req.session.user, "users": successInner?messageInner:[]});
        }
      });
    };
  }

  //add a user
  app.post("/backend/admin/addUser", usermodel.session.needAdmin, usermodel.core.expose_post(usermodel.users.createUser, renderAdminResult("New user created. "), ["user"]));

  //remove a user, you can't delete yourself
  app.post("/backend/admin/removeUser", usermodel.session.needAdmin, usermodel.core.expose_post_condition(usermodel.users.deleteUser, renderAdminResult("User deleted. "), function(req, res){ return req.session.user !== req.param("user"); }, ["user"]));

  //set admin, you can't change yourself.
  app.post("/backend/admin/setIsAdmin", usermodel.session.needAdmin, usermodel.core.expose_post_condition(usermodel.users.setIsAdmin, renderAdminResult("Admin privileges updated. "), function(req, res){return req.session.user !== req.param("user");}, ["user", "isAdmin"]));

  //allowed Emails.
  app.post("/backend/admin/setAllowedEmails", usermodel.session.needAdmin, usermodel.core.expose_post(usermodel.users.setAllowedEmails, renderAdminResult("Allowed emails updated. "), ["user", "allowedEmails"]));
}
