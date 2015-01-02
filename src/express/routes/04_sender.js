var
  express = require("express"),
  auth = require("../../auth"),
  config = require("../../config")
  templates = require("../../sender/templates.js");

module.exports = function(app, session, path){
  console.log("Loading Routes: /");

  app.get("/backend/get_me", session.needUser, function(req, res){
    auth.getAllowedEmails(req.session.user, function(s, r){
      res.jsonp({"mails": r, "me": req.session.user});
    });
  });

  app.get("/backend/get_meta", session.needUser, function(req, res){
    var avs = templates.getAll();

    for(var i=0;i<avs.length;i++){
      avs[i] = avs[i].meta;
    }

    res.jsonp({
      "mail": config.getConfig().mail,
      "templates": avs
    });

  });

  //get top level
  app.get('/', session.needUser, function(req, res) {
    res.sendFile(path("static", "sender", "index.html"));
  });
}
