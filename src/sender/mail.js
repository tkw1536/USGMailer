var
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    htmlToText = require('html-to-text'),
    templates = require("./templates");


var transporter = nodemailer.createTransport(smtpTransport({
    host: "exchange.jacobs-university.de", //TODO: Read config
    port: 25
}));


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
