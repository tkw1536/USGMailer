var
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    htmlToText = require('html-to-text'),
    templates = require("./templates");


var transporter = nodemailer.createTransport(smtpTransport({
    host: "exchange.jacobs-university.de", //TODO: Read config
    port: 25
}));

//Über-difficult email validation
var re = /^[a-zA-Z0-9._%+-]+\@([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$/


module.exports.sendMail = function(from, to, cc, bcc, subject, content, html_content, attachments, callback){
    if(typeof to !== "string"){
        var to = to.join(", ");
    } else {
        var to = to;
    }

    return transporter.sendMail({
        from: from,
        to: to,
        cc: cc,
        bcc: bcc,
        subject: subject,
        text: content,
        html: html_content,
        attachments: attachments
    }, callback);
}

module.exports.expandTemplate = function(template, subject, from, to, cc, bcc, htmlContent, attachments){
    var expandedTemplate = templates.getTemplateIfAvailable(template);

    if(!expandedTemplate){
        return callback(false, "Template not found! ");
    }

    if(!expandedTemplate.html){
        var textContent = expandedTemplate.text({content: htmlToText.fromString(htmlContent, {wordWrap: 130})});
        var htmlContent = undefined;
    } else {
        var htmlContent = expandedTemplate.html({content: htmlContent});

        if(!expandedTemplate.text){
          var textContent = htmlToText.fromString(htmlContent, {wordWrap: 130});
        } else {
          var textContent = expandedTemplate.text({content: htmlToText.fromString(htmlContent, {wordWrap: 130})});
        }
    }

    return {
      "text": textContent,
      "html": htmlContent
    }
}

module.exports.sendTemplate = function(template, subject, from, to, cc, bcc, htmlContent, attachments, callback){

  var data = module.exports.expandTemplate(template, subject, from, to, cc, bcc, htmlContent, attachments);

  return module.exports.sendMail(from, to, cc, bcc, subject, data["text"], data["html"], attachments, callback);
}

module.exports.verify = function(data, allowedMails, callback){
  var result = {};

  try{

    //check we have a  from adress
    if(!data.hasOwnProperty("from") || typeof data.from !== "string"){
      throw new Error("Missing sender adress. ");
    }

    if(allowedMails.length !== 0){

      //and that we are allowed to send from it.
      if(!suc || allowedMails.indexOf(data.from) == -1){
        throw new Error("Invalid sender adress. Please try again at a later time. ");
      }
    }


    //ok, this is the sender.
    result["from"] = data.from;

    //check the to adresses
    if(!data.hasOwnProperty("to") || !Array.isArray(data.to)){
      data.to = [];
    }

    //they all need to be emails
    for(var i=0;i<data.to.length;i++){
      if(!re.test(data.to[i])){
        data.to = [];
      }
    }

    result["to"] = data.to;

    //check the cc adresses
    if(!data.hasOwnProperty("cc") || !Array.isArray(data.cc)){
      data.cc = [];
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
      data.bcc = [];
    }

    //they all need to be emails
    for(var i=0;i<data.bcc.length;i++){
      if(!re.test(data.bcc[i])){
        throw new Error("Invalid recipient in 'bcc' field: "+data.bcc[i]);
      }
    }

    result["bcc"] = data.bcc;

    if(allowedMails.length !== 0){

      //verify that there is some recipient.
      //otherwise sending it will make no sense.
      if(data.to.length + data.cc.length + data.bcc.length == 0){
        throw new Error("No recipients specefied. ");
      }
    }

    //subject needs to be a string.
    if(!data.hasOwnProperty("subject") || typeof data.subject !== "string"){
      throw new Error("Missing subject! ");
    }

    result["subject"] = data.subject;

    //check for template
    if(!data.hasOwnProperty("template") || typeof data.template !== "string"){
      throw new Error("Missing template! ");
    }

    result["template"] = data.template;


    //content html needs to be a string.
    if(!data.hasOwnProperty("text") || typeof data.text !== "string"){
      throw new Error("Missing message content. ");
    }

    result["text"] = data.text;
  } catch(e){
    if(typeof callback == "function"){
      callback(false, e);
    }
    return false;
  }

  return result;
}

module.exports.tryExpandTemplate = function(data, allowedMails, callback){
  //verify the data
  var result = module.exports.verify(data, allowedMails, callback);

  //it did not verify, so we are done.
  if(!result){
    return;
  }

  //let us try the template
  try{
    var template_data = module.exports.expandTemplate(data.template, result.subject, result.from, result.to, result.cc, result.bcc, result.text);
  } catch(e){
    return callback(false, e);
  }

  try{
    callback({"result": result, "template": template_data});
  } catch(e){
    callback(false, e);
  }
}
