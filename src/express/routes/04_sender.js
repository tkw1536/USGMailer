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
          throw new Error("Missing sender adress. ");
        }

        //and that we are allowed to send from it.
        if(!suc || allowedMails.indexOf(data.from) == -1){
          throw new Error("Invalid sender adress. Please try again at a later time. ");
        }

        //ok, this is the sender.
        result["from"] = data.from + "@" + config.getConfig().mail;

        //check the to adresses
        if(!data.hasOwnProperty("to") || !Array.isArray(data.to)){
          throw new Error("Missing 'to' adresses. ");
        }

        //they all need to be emails
        for(var i=0;i<data.to.length;i++){
          if(!re.test(data.to[i])){
            throw new Error("Invalid recipient in 'to' field: "+data.to[i]);
          }
        }

        result["to"] = data.to;

        //check the cc adresses
        if(!data.hasOwnProperty("cc") || !Array.isArray(data.cc)){
          throw new Error("Missing 'cc' adresses. ");
        }

        //they all need to be emails
        for(var i=0;i<data.cc.length;i++){
          if(!re.test(data.cc[i])){
            throw new Error("Invalid recipient in 'cc' field: "+data.cc[i]);
          }
        }

        result["cc"] = data.cc;

        //check the bcc adresses
        if(!data.hasOwnProperty("bcc") || !Array.isArray(data.bcc)){
          throw new Error("Missing 'bcc' adresses. ");
        }

        //they all need to be emails
        for(var i=0;i<data.bcc.length;i++){
          if(!re.test(data.bcc[i])){
            throw new Error("Invalid recipient in 'bcc' field: "+data.bcc[i]);
          }
        }

        result["bcc"] = data.bcc;

        if(data.to.length + data.cc.length + data.bcc.length == 0){
          throw new Error("No recipients specefied. ");
        }


        //subject needs to be a string.
        if(!data.hasOwnProperty("subject") || typeof data.subject !== "string"){
          throw new Error("Missing subject! ");
        }

        result["subject"] = data.subject;

        //content html needs to be a string.
        if(!data.hasOwnProperty("content_html") || typeof data.content_html !== "string"){
          throw new Error("Missing message content. ");
        }

        result["content_raw"] = data.content_html;
      } catch(e){
        return callback(false, e);
      }

      //let us try the template
      try{
        var template_data = mail.expandTemplate(data.template, result.subject, result.from, result.to, result.cc, result.bcc, result.content_raw);
      } catch(e){
        return callback(false, e);
      }

      try{
        callback({"result": result, "template": template_data});
      } catch(e){
        callback(false, e);
      }
    });
  }

  //get top level
  app.post('/sender/preview', session.needUser, function(req, res) {
    prepareMail(req, res, function(data, error){
      if(data){
        console.dir(data);
        res.jsonp(data);
      } else {
        console.log(error.message);
        res.render(path("static", "sender", "sent_fail.html"), {"error": error.message});
      }
    });

  });
}
