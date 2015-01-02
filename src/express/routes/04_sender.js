var
  express = require("express"),
  templates = require("../../sender/templates.js"),
  mail = require("../../sender/mail.js"),
  auth = require("../../auth"),
  config = require("../../config");

  //Über-difficult email validation
  var re = /^[a-zA-Z0-9._%+-]+\@([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$/

module.exports = function(app, session, path){
  console.log("Loading Routes: /sender");

  //prepare to send the mail (i. e. validate the data)
  //callback with data or false
  var prepareMail = function(req, res, callback){

    try{
      var data = JSON.parse(req.param("data"));
    } catch(e){
      return callback(false);
    }

    auth.getAllowedEmails(req.session.user, function(suc, allowedMails){
      var result = {};

      try{

        //check we have a  from adress
        if(!data.hasOwnProperty("from") || typeof data.from !== "string"){
          throw new Error("ValidationFail");
        }

        //and that we are allowed to send from it.
        if(!suc || allowedMails.indexOf(data.from) == -1){
          throw new Error("ValidationFail");
        }

        //ok, this is the sender.
        result["from"] = data.from + "@" + config.getConfig().mail;

        //check the to adresses
        if(!data.hasOwnProperty("to") || !Array.isArray(data.to)){
          throw new Error("ValidationFail");
        }

        //they all need to be emails
        for(var i=0;i<data.to.length;i++){
          if(!re.test(data.to[i])){
            throw new Error("ValidationFail");
          }
        }

        result["to"] = data.to;

        //check the cc adresses
        if(!data.hasOwnProperty("cc") || !Array.isArray(data.cc)){
          throw new Error("ValidationFail");
        }

        //they all need to be emails
        for(var i=0;i<data.cc.length;i++){
          if(!re.test(data.cc[i])){
            throw new Error("ValidationFail");
          }
        }

        result["cc"] = data.cc;

        //check the bcc adresses
        if(!data.hasOwnProperty("bcc") || !Array.isArray(data.bcc)){
          throw new Error("ValidationFail");
        }

        //they all need to be emails
        for(var i=0;i<data.bcc.length;i++){
          if(!re.test(data.bcc[i])){
            throw new Error("ValidationFail");
          }
        }

        result["bcc"] = data.bcc;

        //subject needs to be a string.
        if(!data.hasOwnProperty("subject") || typeof data.subject !== "string"){
          throw new Error("ValidationFail");
        }

        result["subject"] = data.subject;

        //content html needs to be a string.
        if(!data.hasOwnProperty("content_html") || typeof data.content_html !== "string"){
          throw new Error("ValidationFail");
        }

        result["content_raw"] = data.content_html;
      } catch(e){
        return callback(false);
      }

      //let us try the template
      try{
        var template_data = mail.expandTemplate(data.template, result.subject, result.from, result.to, result.cc, result.bcc, result.content_raw);
      } catch(e){
        return callback(false);
      }

      try{
        callback({"result": result, "template": template_data});
      } catch(e){
        callback(false);
      }
    });
  }

  //get top level
  app.post('/sender/preview', session.needUser, function(req, res) {
    prepareMail(req, res, function(data){
      if(data){
        console.dir(data);
        res.jsonp(data);
      } else {
        res.sendFile(path("static", "sender", "sent_fail.html"));
      }
    });

  });
}
