var
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  htmlToText = require('html-to-text'),
  templates = require("./templates"),
  config = require("../config.js");

//create the transporter for the mail.
var transporter = nodemailer.createTransport(smtpTransport({
  host: config.getConfig()["mailer"]["domain"],
  port: config.getConfig()["mailer"]["port"]
}));

module.exports = function(mail, callback){
  console.log("Sending mail: ", mail); 

  return transporter.sendMail({
    from: mail.from + "@" + config.getConfig()["mail"],
    to: mail.to.join(", "),
    cc: mail.cc.join(", "),
    bcc: mail.bcc.join(", "),
    subject: mail.subject,
    text: mail.content_type=="text"?mail.content_cooked:undefined,
    html: mail.content_type=="html"?mail.content_cooked:undefined,
    attachments: []
  }, function(err, info){
    callback(err?false:true, err?err:info);
  });
}
