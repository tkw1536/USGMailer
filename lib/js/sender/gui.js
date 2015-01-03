var SenderGUI = {};

SenderGUI.initElements = function(){
  SenderGUI.elements = {
    "subjectEmail": $("#subjectEmail"),

    "fromEmail": $("#fromEmail"),
    "templateMail": $("#templateMail"),

    "toEmail": $("#toEmail"),
    "ccEmail": $("#ccEmail"),
    "bccEmail": $("#bccEmail"),

    "textEmail": $("#textEmail")
  };

  SenderGUI.controls = {
    "toEmail": function(){return []; },
    "ccEmail": function(){return []; },
    "bccEmail": function(){return []; },
  };

  SenderGUI.elements.textEmail.Editor(); 

  SenderGUI._isAlive = false;

}


SenderGUI.reset = function(){
  //deactivate the GUI
  SenderGUI.deactivate();

  //Subject
  SenderGUI.elements.subjectEmail.val("");

  //From
  SenderGUI.elements.fromEmail.empty();

  //Template
  SenderGUI.elements.templateMail.empty();

  //To
  SenderGUI.elements.toEmail.val("");

  //CC
  try{
    if(SenderGUI._isAlive){
      SenderGUI.elements.ccEmail.tokenfield("destroy");
    }
  } catch(e){}
  SenderGUI.elements.ccEmail.val("");

  //BCC
  try{
    if(SenderGUI._isAlive){
      SenderGUI.elements.bccEmail.tokenfield("destroy");
    }
  } catch(e){}
  SenderGUI.elements.bccEmail.val("");

  //Content
  SenderGUI.elements.textEmail.Editor("setText", "");
}

SenderGUI.set = function(data, meta){
  SenderGUI.reset();

  //Subject
  SenderGUI.elements.subjectEmail.val(data.subject);

  //From
  for(var i=0;i<data.meta.fromMails.length;i++){
    SenderGUI.elements.fromEmail.append($("<option>").val(data.meta.fromMails[i]).text(data.meta.fromMails[i] + "@" + data.meta.mailSuffix))
  }

  //templates
  for(var i=0;i<data.meta.templates.length;i++){
    SenderGUI.elements.templateMail.append($("<option>").val(data.meta.templates[i].title).text(data.meta.templates[i].name))
  }
  SenderGUI.elements.templateMail.val(data.template).selectpicker();


  //To
  SenderGUI.controls.toEmail = SenderGUI.elements.toEmail.val(data.to.join(","));
  //CC
  SenderGUI.controls.ccEmail = SenderGUI.elements.ccEmail.val(data.cc.join(","));
  //BCC
  SenderGUI.controls.bccEmail = SenderGUI.elements.bccEmail.val(data.bcc.join(","));

  //Content
  SenderGUI.elements.textEmail.Editor("setText", data.text);

  //and enable the thing.
  SenderGUI.activate();
}

SenderGUI.activate = function(){
  if(!SenderGUI._isAlive){
    SenderGUI.elements.fromEmail.selectpicker();
    SenderGUI.elements.templateMail.selectpicker();

    SenderGUI.controls.toEmail = SenderGUI.createEmailField(SenderGUI.controls.toEmail);
    SenderGUI.controls.ccEmail = SenderGUI.createEmailField(SenderGUI.controls.ccEmail);
    SenderGUI.controls.bccEmail = SenderGUI.createEmailField(SenderGUI.controls.bccEmail);

    SenderGUI._isAlive = true;
  }
}

SenderGUI.deactivate = function(){
  if(SenderGUI._isAlive){
    SenderGUI.elements.fromEmail.selectpicker("remove");
    SenderGUI.elements.templateMail.selectpicker("remove");

    SenderGUI.elements.toEmail.tokenfield("destroy");
    SenderGUI.elements.ccEmail.tokenfield("destroy");
    SenderGUI.elements.bccEmail.tokenfield("destroy");

    SenderGUI.controls = {
      "toEmail": function(){return []; },
      "ccEmail": function(){return []; },
      "bccEmail": function(){return []; },
    };

    SenderGUI._isAlive = false;
  }
}

SenderGUI.get = function(){
  return {
    "subject": SenderGUI.elements.subjectEmail.val(),

    "from": SenderGUI.elements.fromEmail.val(),
    "template": SenderGUI.elements.templateMail.val(),

    "to": SenderGUI.controls.toEmail(),
    "cc": SenderGUI.controls.ccEmail(),
    "bcc": SenderGUI.controls.ccEmail(),

    "text": SenderGUI.elements.textEmail.Editor("getText")
  }
}

SenderGUI.getAll = function(callback){
  Sender.get_meta(function(meta){
    var data = SenderGUI.get();
    data.meta = meta;
    callback(data);
  });
}

SenderGUI.createEmailField = function(field){

  //Über-difficult email validation
  var re = /^[a-zA-Z0-9._%+-]+\@([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$/

  $(field)
  .off('tokenfield:createtoken')
  .on('tokenfield:createtoken', function (e) {
    var data = e.attrs.value.split('|')
    e.attrs.value = data[1] || data[0]
    e.attrs.label = data[1] ? data[0] + ' (' + data[1] + ')' : data[0]
  })
  .off('tokenfield:createdtoken')
  .on('tokenfield:createdtoken', function (e) {
    var valid = re.test(e.attrs.value)
    if (!valid) {
      $(e.relatedTarget).addClass('invalid');
    }
  })
  .off('tokenfield:edittoken')
  .on('tokenfield:edittoken', function (e) {
    if (e.attrs.label !== e.attrs.value) {
      var label = e.attrs.label.split(' (')
      e.attrs.value = label[0] + '|' + e.attrs.value
    }
  })
  .tokenfield();

  return function(){
    var mails = $(field).tokenfield('getTokens');
    var valid = [];
    for(var i=0;i<mails.length;i++){
      if(re.test(mails[i].value) && valid.indexOf(mails[i].value) == -1){
        valid.push(mails[i].value);
      }
    }

    return valid;
  }
}

SenderGUI.reloadAll = function(){
  SenderGUI.getAll(function(data){
    SenderGUI.set(data);
  });
}

$(function(){

  //intialise the element selects
  SenderGUI.initElements();

  //and set things now
  SenderGUI.reloadAll();


  $("#reload").click(function(){
    SenderGUI.reloadAll();
    return false;
  });
})
