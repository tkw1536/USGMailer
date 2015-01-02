var
  express = require("express");

module.exports = function(app, session, path){
  console.log("Loading Routes: /");

  //get top level
  app.get('/', session.needUser, function(req, res) {
    res.sendFile(path("static", "sender", "index.html"));
  });
}
