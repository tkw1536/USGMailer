var ComposeGUI = {};

ComposeGUI.initElements = function(){
  ComposeGUI.elements = {
    "subjectEmail": $("#subjectEmail"),

    "fromEmail": $("#fromEmail"),
    "templateEmail": $("#templateEmail"),

    "toEmail": $("#toEmail"),
    "ccEmail": $("#ccEmail"),
    "bccEmail": $("#bccEmail"),

    "textEmail": $("#textEmail"),
    "emailId": $("#emailId"),

    "form": $("form")
  };

  ComposeGUI.controls = {
    "toEmail": function(){return []; },
    "ccEmail": function(){return []; },
    "bccEmail": function(){return []; },
  };

  ComposeGUI._isAlive = false;
}


ComposeGUI.reset = function(){
  //deactivate the GUI
  ComposeGUI.deactivate();

  //Subject
  ComposeGUI.elements.subjectEmail.val("");

  //From
  ComposeGUI.elements.fromEmail.empty();

  //Template
  ComposeGUI.elements.templateEmail.empty();

  //To
  ComposeGUI.elements.toEmail.val("");

  //CC
  ComposeGUI.elements.ccEmail.val("");

  //BCC
  ComposeGUI.elements.bccEmail.val("");

  //Content
  ComposeGUI.elements.textEmail.val("");
}

ComposeGUI.set = function(data, meta){
  ComposeGUI.reset();

  //Subject
  ComposeGUI.elements.subjectEmail.val(data.subject);

  //From
  for(var i=0;i<data.meta.fromMails.length;i++){
    ComposeGUI.elements.fromEmail.append($("<option>").val(data.meta.fromMails[i]).text(data.meta.fromMails[i] + "@" + data.meta.mailSuffix))
  }

  //templates
  for(var i=0;i<data.meta.templates.length;i++){
    ComposeGUI.elements.templateEmail.append($("<option>").val(data.meta.templates[i].title).text(data.meta.templates[i].name))
  }
  ComposeGUI.elements.templateEmail.val(data.template).selectpicker();


  //To
  ComposeGUI.controls.toEmail = ComposeGUI.elements.toEmail.val(data.to.join(","));
  //CC
  ComposeGUI.controls.ccEmail = ComposeGUI.elements.ccEmail.val(data.cc.join(","));
  //BCC
  ComposeGUI.controls.bccEmail = ComposeGUI.elements.bccEmail.val(data.bcc.join(","));

  //Content
  ComposeGUI.elements.textEmail.val(data.text);

  //and enable the thing.
  ComposeGUI.activate();
}

ComposeGUI.activate = function(){
  if(!ComposeGUI._isAlive){
    ComposeGUI.elements.fromEmail.selectpicker();
    ComposeGUI.elements.templateEmail.selectpicker();

    ComposeGUI.controls.toEmail = ComposeGUI.createEmailField(ComposeGUI.controls.toEmail);
    ComposeGUI.controls.ccEmail = ComposeGUI.createEmailField(ComposeGUI.controls.ccEmail);
    ComposeGUI.controls.bccEmail = ComposeGUI.createEmailField(ComposeGUI.controls.bccEmail);

    ComposeGUI.elements.textEmail.Editor();
    ComposeGUI.elements.textEmail.Editor("setText", ComposeGUI.elements.textEmail.val());

    ComposeGUI.elements.form.on("submit.ComposeGUI", function(){
      ComposeGUI.deactivate();
      return false;
    });

    ComposeGUI._isAlive = true;
  }
}

ComposeGUI.deactivate = function(){
  if(ComposeGUI._isAlive){
    ComposeGUI.elements.fromEmail.selectpicker("hide").show();
    ComposeGUI.elements.templateEmail.selectpicker("hide").show();

    ComposeGUI.elements.toEmail.tokenfield("destroy").show();
    ComposeGUI.elements.ccEmail.tokenfield("destroy").show();
    ComposeGUI.elements.bccEmail.tokenfield("destroy").show();

    ComposeGUI.controls = {
      "toEmail": function(){return []; },
      "ccEmail": function(){return []; },
      "bccEmail": function(){return []; },
    };

    ComposeGUI.elements.textEmail.val(
      ComposeGUI.elements.textEmail.Editor("getText")
    ).show().data("editor").parent().remove();

    ComposeGUI.elements.form.off("submit.ComposeGUI");

    ComposeGUI._isAlive = false;
  }
}

ComposeGUI.get = function(){
  if(ComposeGUI._isAlive){
    return {
      "subject": ComposeGUI.elements.subjectEmail.val(),
      "id": ComposeGUI.elements.emailId.val(),

      "from": ComposeGUI.elements.fromEmail.val(),
      "template": ComposeGUI.elements.templateEmail.val(),

      "to": ComposeGUI.controls.toEmail(),
      "cc": ComposeGUI.controls.ccEmail(),
      "bcc": ComposeGUI.controls.ccEmail(),

      "text": ComposeGUI.elements.textEmail.Editor("getText")
    }
  } else {
    return {
      "subject": ComposeGUI.elements.subjectEmail.val(),
      "id": ComposeGUI.elements.emailId.val(),

      "from": ComposeGUI.elements.fromEmail.val(),
      "template": ComposeGUI.elements.templateEmail.val(),

      "to": ComposeGUI.controls.toEmail(),
      "cc": ComposeGUI.controls.ccEmail(),
      "bcc": ComposeGUI.controls.ccEmail(),

      "text": ComposeGUI.elements.textEmail.val()
    }
  }
}

ComposeGUI.getAll = function(callback){
  Composer.get_meta(function(meta){
    var data = ComposeGUI.get();
    data.meta = meta;
    callback(data);
  });
}

ComposeGUI.createEmailField = function(field){

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

ComposeGUI.reloadAll = function(){
  ComposeGUI.getAll(function(data){
    ComposeGUI.set(data);
  });
}

ComposeGUI.save = function(){
  var content = ComposeGUI.get();

  ComposeGUI.elements.form.serializeArray());

  Composer.save_draft(content.id, content, function(s){
    console.log("Saved with status", s);
  });
}

$(function(){

  //intialise the element thingys
  ComposeGUI.initElements();

  //and set things now
  ComposeGUI.reloadAll();

  $("#reload").click(function(){
    ComposeGUI.reloadAll();
    return false;
  });
})
