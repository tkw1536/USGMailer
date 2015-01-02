var
  express = require("express");

module.exports = function(app, session, path){
  console.log("Loading Routes: /lib");

  //server libraries correctly
  //first use bower_components for this
  app.use("/lib", express.static(path("bower_components")));
  app.use("/lib", express.static(path("lib")));
}
