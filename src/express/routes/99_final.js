module.exports = function(app, session, path){

  //and finally a 404
  app.use(function(req, res, next){
    res.status(404);
    res.sendFile(path("static", "404.html"));
  });

}
