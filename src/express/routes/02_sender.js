var
  express = require("express"),
  /*mail = require("../../sender/mail.js"),*/
  usermodel = require("../../usermodel"),
  templates = require("../../sender/templates.js");

module.exports = function(app, session, path){
  process.stdout.write(" [DISABLED]");
  return;

  var get_meta = function(req, res, callback){
    var avs = templates.getAll();

    for(var i=0;i<avs.length;i++){
      avs[i] = avs[i].meta;
    }

    usermodel.getAllowedEmails(req.session.user, function(mails){
      callback({
        "fromMails": mails,
        "mailSuffix": config.getConfig().mail,
        "templates": avs
      });
    });
  };

  var newMail = function(req, res){
    return {
      "subject": "New mail",
      "id": usermodel.createNewDraftId(),

      "from": req.session.user,
      "template": "simple",

      "to": [],
      "cc": [],
      "bcc": [],

      "text": "New mail!"
    };
  }


  //prepare to send the mail (i. e. validate the data)
  //callback with data or false
  var prepareMail = function(req, res, callback){

    try{
      var data = JSON.parse(req.param("data"));
    } catch(e){
      return callback(false);
    }

    usermodel.getAllowedEmails(req.session.user, function(suc, allowedMails){
      return mail.tryExpandTemplate(data, allowedMails, callback);
    });
  }

  app.get("/compose/backend/get_meta", session.needUser, function(req, res){
    get_meta(req, res, function(meta){
      res.jsonp(meta);
    });
  });

  var renderMain = function(req, res, message){
    usermodel.getDraftsFull(req.session.user, function(success, drafts){
      if(!success){
        res.render(path("static", "sender", "index.html"), {"drafts": [], "message": "Something went wrong! Please try again or contact the administrator. ", "user": req.session.user});
        return;
      }

      res.render(path("static", "sender", "index.html"), {"drafts": drafts, "message": message, "user": req.session.user});
    });
  }

  var renderCompose = function(req, res, id, message_ok, message_fail){
    usermodel.getDraft(req.session.user, id, function(success, draft){
      if(!success){
        renderMain(req, res, "That draft does not exist. ");
        return;
      }

      get_meta(req, res, function(meta){
        //store some additonal parameters.
        meta.id = id;
        meta.user = req.session.user;
        meta.message_ok = message_ok;
        meta.message_fail = message_fail;
        draft.meta = meta;

        res.render(path("static", "sender", "compose.html"), draft);
      });

    });
  }


  var parsePostDraft = function(req){

    var splitter = function(data){
      if(data == ""){
        return [];
      }

      data = data.split(",").join(";").split(";");
      for(var i=0;i<data.length;i++){
        data[i] = data[i].trim();
      }

      return data;
    }

    return {
      "subject": req.param("subjectEmail"),

      "from": req.param("fromEmail"),
      "template": req.param("templateEmail"),

      "to": splitter(req.param("toEmail")),
      "cc": splitter(req.param("ccEmail")),
      "bcc": splitter(req.param("bccEmail")),

      "text": req.param("textEmail"),
      "id": req.param("emailId")
    }
  }

  var saveDraft = function(user, id, data, callback){
    usermodel.getDrafts(user, function(s, drafts){
      if(!s || drafts.indexOf(id) == -1){
        callback(false);
      }

      usermodel.setDraft(user, id, data, function(success, message){
        callback(success, message);
      });
    });
  }

  app.get("/compose/", session.needUser, function(req, res){
    //create a new mail
    var mail = newMail(req, res);
    usermodel.setDraft(req.session.user, mail.id, mail, function(){
      res.redirect("/compose/"+mail.id);
    });
  });

  app.get("/compose/:id", session.needUser, function(req, res){
    var id = req.params.id;
    renderCompose(req, res, id);
  });

  app.post("/compose/:id", session.needUser, function(req, res){
    var action = req.param("action");

    var draft = parsePostDraft(req);
    console.log(draft);

    if(action == "Save Draft"){
      saveDraft(req.session.user, draft.id, draft, function(success){
        if(!success){
          renderCompose(req, res, draft.id, undefined, "Did not save draft");
        } else {
          renderCompose(req, res, draft.id, "Draft saved. ");
        }
      });
    } else {
      renderMain(req, res, "Unknown action. ");
    }
  });

  app.get("/compose/backend/store_draft", session.needUser, function(req, res){
    var id = req.param("id");
    var data = req.param("data");

    saveDraft(req.session.user, id, data, function(success, message){
      res.jsonp({"success": success, "message": message?message.message:undefined});
      res.end();
    });
  });

  app.get("/", session.needUser, function(req, res){
    renderMain(req, res);
  });

}
