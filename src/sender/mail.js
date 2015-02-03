var
  nodemailer = require('nodemailer'),
  /*smtpTransport = require('nodemailer-smtp-transport'),*/
  directTransport = require('nodemailer-direct-transport'),
  templates = require("./templates"),
  config = require("../config.js");

var transporter = nodemailer.createTransport(directTransport({
  debug: true
}));

module.exports = function(mail, callback){
  //console.log("Sending mail: ", mail);

  return transporter.sendMail({
    from: mail.from + "@" + config.getConfig()["mail"],
    to: mail.to,
    cc: mail.cc,
    bcc: mail.bcc,
    subject: mail.subject,
    text: mail.content_type=="text"?mail.content_cooked:mail.content_cooked_text,
    html: mail.content_type=="html"?mail.content_cooked:undefined,
    attachments: []
  }, function(err, info){
    //log the errors
    console.error.apply(this, arguments);
    callback(err?false:true, err?err:info);
  });
}
