var
  express = require("express"),
  auth = require("../../auth"),
  config = require("../../config"),
  templates = require("../../sender/templates.js");

var get_meta = function(req, res, callback){
  var avs = templates.getAll();

  for(var i=0;i<avs.length;i++){
    avs[i] = avs[i].meta;
  }

  auth.getAllowedEmails(req.session.user, function(mails){
    callback({
      "fromMails": mails,
      "mailSuffix": config.getConfig().mail,
      "templates": avs
    });
  });
};

var newMail = function(req, res, callback){
  callback({
    "subject": "New mail",

    "from": req.session.user,
    "template": "simple",

    "to": [],
    "cc": [],
    "bcc": [],

    "text": "New mail!"
  });
}

module.exports = function(app, session, path){
  console.log("Loading Routes: / /backend");

  app.get("/backend/get_meta", session.needUser, function(req, res){
    get_meta(req, res, function(meta){
      res.jsonp(meta);
    });
  });

  //get top level
  app.get('/', session.needUser, function(req, res) {
    get_meta(req, res, function(meta){
      newMail(req, res, function(data){
        var data = data;
        data["meta"] = meta;
        res.render(path("static", "sender", "index.html"), data);
      });
    });

  });
}
