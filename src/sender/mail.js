var
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    htmlToText = require('html-to-text'),
    templates = require("./templates");


var transporter = nodemailer.createTransport(smtpTransport({
    host: "exchange.jacobs-university.de", //TODO: Read config
    port: 25
}));


module.exports.sendMail = function(from, to, subject, content, html_content, attachments, callback){
    if(typeof to !== "string"){
        var to = to.join(", ");
    } else {
        var to = to;
    }

    return transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        text: content,
        html: html_content
        attachments: attachments
    }, callback);
}

module.exports.expandTemplate = function(template, subject, from, to, htmlContent, attachments, callback){
    var expandedTemplate = templates.getTemplateIfAvailable(template);

    if(!expandedTemplate){
        return callback(false, "Template not found! ");
    }

    if(!expandedTemplate.html){
        var htmlContent = undefined;
    } else {
        var htmlContent = expandedTemplate.html({content: htmlContent});
    }

    var textContent = expandedTemplate.text({content: htmlToText.fromString(htmlContent, {wordWrap: 130})});

    return module.exports.sendMail(from, to, subject, textContent, htmlContent, attachments, callback);
}
