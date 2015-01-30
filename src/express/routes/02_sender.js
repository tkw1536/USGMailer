var
  express = require("express"),
  config = require("../../config.js"),
  /*mail = require("../../sender/mail.js"),*/
  usermodel = require("../../usermodel"),
  templates = require("../../sender/templates.js");

module.exports = function(app, usermodel, path){

  var renderMainPage = function(req, res, error){
    usermodel.drafts.getDrafts(req.session.user, function(success, message){
      res.render(path("static", "sender", "index.html"), {"user": req.session.user, "message":success?error:message, "drafts": message});
    });
  }

  var renderComposePage = function(req, res, id, error){
    usermodel.drafts.getDraft(req.session.user, id, function(success, message){
      if(success){
        res.render(path("static", "sender", "compose.html"), {
          "message":error,
          "meta": {
            "user": req.session.user,
            "id": id,
            "fromMails": [req.session.user],
            "templates": templates.getAll(),
            "mailSuffix": config.getConfig()["mail"]
          },
          "draft": message
        });
      } else {
        // There was an error rendering the draft.
        renderMainPage(req, res, message);
      }
    });
  }

  app.get("/new", usermodel.session.needUser, function(req, res){
    usermodel.drafts.createNewDraft(req.session.user, function(success, message){
      if(success){
        res.redirect("/compose/"+message);
      } else {
        renderMainPage(req, res, message);
      }
    })
  });

  app.get("/compose/:id", usermodel.session.needUser, function(req, res){
    usermodel.drafts.hasDraft(req.session.user, req.params.id, function(success, message){
      if(success && message){
        renderComposePage(req, res, req.params.id);
      } else {
        res.status(404);
        renderMainPage(req, res, "That draft does not exist. ");
      }
    });
  });

  app.get("/", usermodel.session.needUser, function(req, res){
    renderMainPage(req, res);
  });
}
