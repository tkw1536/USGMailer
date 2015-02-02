var
  express = require("express"),
  config = require("../../config.js"),
  /*mail = require("../../sender/mail.js"),*/
  usermodel = require("../../usermodel"),
  templates = require("../../sender/templates.js");

module.exports = function(app, usermodel, path){

  var renderMainPage = function(req, res, error, no_error){
    usermodel.drafts.getDrafts(req.session.user, function(success, message){
      res.render(path("static", "sender", "index.html"), {
        "user": req.session.user,
        "message":success?error:message,
        "message_ok": no_error,
        "drafts": message});
    });
  }

  var renderPreviewPage = function(req, res, id){
    usermodel.drafts.getDraft(req.session.user, id, function(success, message){
      if(success){
        res.render(path("static", "sender", "preview.html"), {
          "id": id,
          "mailSuffix": config.getConfig()["mail"],
          "draft": message
        });
      } else {
        renderComposePage(req, res, id, "Unable to preview draft: "+message);
      }
    });
  }

  var renderComposePage = function(req, res, id, message_fail, message_ok){
    usermodel.users.getAllowedEmails(req.session.user, function(success, message){

      if(!success){
        //there was an error rendering the draft.
        renderMainPage(req, res, message);
        return;
      }

      var availableMails = message;

      usermodel.drafts.getDraft(req.session.user, id, function(success, message){
        if(success){
          res.render(path("static", "sender", "compose.html"), {
            "message": message_fail,
            "message_ok": message_ok,
            "meta": {
              "user": req.session.user,
              "id": id,
              "fromMails": availableMails,
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
    });
  }

  var getDraftObject = function(req){
    return {
      "subject": req.body.subjectEmail,

      "to": req.body.toEmail,
      "cc": req.body.ccEmail,
      "bcc": req.body.bccEmail,

      "from": req.body.fromEmail,
      "template": req.body.templateEmail,

      "content": req.body.contentEmail
    };
  }

  app.get("/new", usermodel.session.needUser, function(req, res){
    usermodel.drafts.createNewDraft(req.session.user, function(success, message){
      if(success){
        renderComposePage(req, res, message, undefined, "Created new draft. ");
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

  app.get("/preview/:id", usermodel.session.needUser, function(req, res){
    usermodel.drafts.getDraft(req.session.user, req.params.id, function(success, message){
      if(success){
        res.set('Content-Type', 'text/html');
        res.send(message.content_cooked);
      } else {
        res.status(404);
        renderMainPage(req, res, "That draft does not exist. ");
      }
    });
  });

  app.get("/ready/:id", usermodel.session.needUser, function(req, res){
    usermodel.drafts.hasDraft(req.session.user, req.params.id, function(success, message){
      if(success && message){
        renderPreviewPage(req, res, req.params.id);
      } else {
        res.status(404);
        renderMainPage(req, res, "That draft does not exist. ");
      }
    });
  });

  app.get("/send/:id", usermodel.session.needUser, function(req, res){
    usermodel.drafts.hasDraft(req.session.user, req.params.id, function(success, message){
      if(success && message){
        usermodel.drafts.sendMail(req.session.user, req.params.id, function(success, message){
          renderMainPage(req, res, success?undefined:message, success?"Mail sent. ":undefined);
        });
      } else {
        res.status(404);
        renderMainPage(req, res, "That draft does not exist. ");
      }
    });
  })

  app.post("/update/:id", usermodel.session.needUser, function(req, res){
    usermodel.drafts.hasDraft(req.session.user, req.params.id, function(success, message){
      if(success && message){
        var action = req.body.action;
        var draftObject = getDraftObject(req);

        if(action == "Save Draft" || action == ""){
          usermodel.drafts.setDraft(req.session.user, req.params.id, draftObject, function(success, message){
            renderComposePage(req, res, req.params.id, success?undefined:"Did not save draft: "+message, success?"Draft saved. ":undefined);
          });
        } else if(action == "Back"){
          usermodel.drafts.setDraft(req.session.user, req.params.id, draftObject, function(success, message){
            if(success){
              res.redirect("/");
            } else {
              renderComposePage(req, res, req.params.id, "Did not save draft: "+message);
            }
          });
        } else if(action == "Delete"){
          usermodel.drafts.deleteDraft(req.session.user, req.params.id, function(success, message){
            if(success){
              renderMainPage(req, res, "Draft deleted. ");
            } else {
              renderMainPage(req, res, "Did not delete draft: "+message);
            }
          });
        } else if(action == "Preview & Send"){
          usermodel.drafts.setDraft(req.session.user, req.params.id, draftObject, function(success, message){
            if(success){
              res.redirect("/ready/"+req.params.id);
            } else {
              renderComposePage(req, res, req.params.id, "Did not save draft: "+message);
            }
          });
        } else {
          renderComposePage(req, res, req.params.id, "Unknown or missing action. ");
        }
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
