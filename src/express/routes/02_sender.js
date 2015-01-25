var
  express = require("express"),
  /*mail = require("../../sender/mail.js"),*/
  usermodel = require("../../usermodel"),
  templates = require("../../sender/templates.js");

module.exports = function(app, usermodel, path){

  var renderMainPage = function(req, res, error){
    usermodel.drafts.getDrafts(req.session.user, function(success, message){
      res.render(path("static", "sender", "index.html"), {"user": req.session.user, "message":success?error:message, "drafts": message});
    });
  }

  app.get("/new", usermodel.session.needUser, function(req, res){
    usermodel.drafts.createNewDraft(req.session.user, function(success, message){
      if(success){
        res.redirect("/edit/"+message);
      } else {
        renderMainPage(req, res, message);
      }
    })
  });

  app.get("/", usermodel.session.needUser, function(req, res){
    renderMainPage(req, res);
  });
}
