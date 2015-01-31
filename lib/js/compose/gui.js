var ComposeGUI = {};

ComposeGUI.initElements = function(){
  ComposeGUI.elements = {
    "subjectEmail": $("#subjectEmail"),

    "fromEmail": $("#fromEmail"),
    "templateEmail": $("#templateEmail"),

    "toEmail": $("#toEmail"),
    "ccEmail": $("#ccEmail"),
    "bccEmail": $("#bccEmail"),

    "contentEmail": $("#contentEmail"),
    "emailId": $("#emailId"),

    "form": $("form")
  };

  ComposeGUI.controls = {
    "toEmail": function(){return []; },
    "ccEmail": function(){return []; },
    "bccEmail": function(){return []; },
  };
}

ComposeGUI.init = function(){
  //we are always under /compose/:id
  history.replaceState({}, "USG Mailer - Composer", "/compose/"+ComposeGUI.elements.emailId.val());

  //we want fancy selects
  ComposeGUI.elements.fromEmail.selectpicker();
  ComposeGUI.elements.templateEmail.selectpicker();

  //and fancy e-mail selectors.
  ComposeGUI.controls.toEmail = ComposeGUI.createEmailField(ComposeGUI.elements.toEmail);
  ComposeGUI.controls.ccEmail = ComposeGUI.createEmailField(ComposeGUI.elements.ccEmail);
  ComposeGUI.controls.bccEmail = ComposeGUI.createEmailField(ComposeGUI.elements.bccEmail);

  //and a fancy editor.
  ComposeGUI.elements.contentEmail.Editor();
  ComposeGUI.elements.contentEmail.Editor("setText", ComposeGUI.elements.contentEmail.val());

  //ok, we need to disable all this before submit.
  ComposeGUI.elements.form.on("submit.ComposeGUI", function(){
    ComposeGUI.deinit();
  });
}

ComposeGUI.deinit = function(){
  //no more selects.
  ComposeGUI.elements.fromEmail.selectpicker("hide").show();
  ComposeGUI.elements.templateEmail.selectpicker("hide").show();

  //todo: store the values and reset them here.
  ComposeGUI.elements.toEmail.tokenfield("destroy").show();
  ComposeGUI.elements.ccEmail.tokenfield("destroy").show();
  ComposeGUI.elements.bccEmail.tokenfield("destroy").show();

  //back to a simple <textarea>
  ComposeGUI.elements.contentEmail.val(
    ComposeGUI.elements.contentEmail.Editor("getText")
  ).show().data("editor").parent().remove();
}

ComposeGUI.createEmailField = function(field){

  //Über-difficult email validation
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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

$(function(){
  //load all the elements.
  ComposeGUI.initElements();

  //and init the gui.
  ComposeGUI.init();
})
