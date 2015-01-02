var SenderGUI = {};

SenderGUI.reload = function(){
  $("#mainarea").text("Loading things ... There will be stuff here. Just be patient. ");

  //Load the user name.
  Sender.whoami(function(user){
    $("#whoami").text(user);
  });


  Sender.get_me(function(data){
    Sender.get_meta(function(meta_data){
      //we have some info now.
      var mails = data.mails;
      var mail_suffix = "@"+meta_data.mail;
      var templates = meta_data.templates;
      var user = data.me;

      //variables
      var has_cc = false;


      //Create the form for sending mails ...
      var $Form = $("<form class='form-horizontal'>");

      //the subject
      var subjectEmail = $('<input type="text" class="form-control" id="subjectEmail" placeholder="Enter subject">');

      //The sender
      var fromEmail = $("<select name='fromEmail' id='fromEmail'>");
      for(var i=0;i<mails.length;i++){
        fromEmail.append($("<option>").val(mails[i]).text(mails[i] + mail_suffix))
      }
      fromEmail.val(user);

      //The recipient(s)
      var toEmail = $('<input type="text" class="form-control" name="subjectEmail" id="subjectEmail" placeholder="Enter emails and press tab to confirm. ">');
      var ccEmail = $('<input type="text" class="form-control" name="ccEmail" id="ccEmail" placeholder="Enter emails and press tab to confirm. ">');
      var bccEmail = $('<input type="text" class="form-control" name="bccEmail" id="bccEmail" placeholder="Enter emails and press tab to confirm. ">');

      //the template
      var templateMail = $("<select name='templateMail' id='templateMail'>");
      for(var i=0;i<templates.length;i++){
        templateMail.append($("<option>").val(templates[i].title).text(templates[i].name))
      };

      //the showCCs
      var showCCs = $("<button class='btn btn-default pull-right'>").text("Add CC / BCC");

      //the text e-mail
      var textEmail = $('<textarea id="textEmail"></textarea>');

      //the submit button
      var submitButton = $('<button type="button" class="btn btn-primary btn-lg">Send Mail</button>');

      //the preview button
      var previewButton = $('<button type="button" class="btn btn-default btn-lg">Preview</button>');

      //the draft button
      var draftButton = $('<button type="button" class="btn btn-default btn-lg">Load / Save Draft</button>');

      //Make the form
      $Form.append(
        $('<div class="form-group">').append(
          '<label for="subjectEmail" class="col-sm-2 control-label">Subject: </label>',
          $('<div class="col-sm-10">').append(subjectEmail)
        ),
        "<hr>",
        $('<div class="form-group">').append(
          '<label for="fromEmail" class="col-sm-2 control-label">From: </label>',
          $('<div class="col-sm-4">').append(fromEmail),
          '<label for="templateMail" class="col-sm-2 control-label">Template: </label>',
          $('<div class="col-sm-4">').append(templateMail)
        ),
        $('<div class="form-group">').append(
          '<label for="toEmail" class="col-sm-2 control-label">To: </label>',
          $('<div class="col-sm-8">').append(toEmail),
          $('<div class="col-sm-2">').append(showCCs)
        ),
        "<hr>",
        $('<div class="row">').append(
          $('<div class="col-lg-12 nopadding">').append(textEmail)
        ),
        "<hr>",
        $('<div class="row">').append(
          $('<div class="btn-group" role="group">').append(
            submitButton,
            previewButton,
            draftButton
          ),
          " You will see your finished mail again before it is submitted. "
        )
      ).appendTo($("#mainarea").empty());

      //Empty the main area
      $("#mainarea").empty().append($Form);


      //make the selects look nice
      fromEmail.selectpicker();
      templateMail.selectpicker();

      //make the recipients look nice
      var getToField = SenderGUI.createEmailField(toEmail);
      var getCCField = function(){return []; }
      var getBCCField = function(){return []; }

      //now for the editor
      textEmail.Editor();

      //show CC / BCC
      showCCs.click(function(){
        $(this).parent().parent()
        .after(
          $('<div class="form-group">').append(
            '<label for="ccEMail" class="col-sm-2 control-label">CC: </label>',
            $('<div class="col-sm-10">').append(ccEmail)
          ),
          $('<div class="form-group">').append(
            '<label for="bccEmail" class="col-sm-2 control-label">BCC: </label>',
            $('<div class="col-sm-10">').append(bccEmail)
          )
        );

        $(this)
        .parent()
        .prev().removeClass("col-sm-8").addClass("col-sm-10")
        .end().remove();


        //we have cc and bcc now
        getCCField = SenderGUI.createEmailField(ccEmail);
        getBCCField = SenderGUI.createEmailField(bccEmail);
        has_cc = true;

        return false;
      });

      var getResults = function(){
        return {
          "subject": subjectEmail.val(),

          "from": fromEmail.val(),
          "template": templateMail.val(),

          "to": getToField(),
          "cc": getCCField(),
          "bcc": getBCCField(),

          "content_html": textEmail.Editor("getText"),

          "has_cc": has_cc
        };
      }

      var setResults = function(data){

        subjectEmail.val(data["subject"]);

        fromEmail.val(data["from"]);
        templateMail.val(data["template"]);

        toEmail.tokenfield("setTokens", data["to"]);

        if(data["has_cc"]){
          //we need to expand the CCs
          showCCs.click();
          ccEmail.tokenfield("setTokens", data["cc"]);
          bccEmail.tokenfield("setTokens", data["bcc"]);
        }

        textEmail.Editor("setText", data["content_html"]);
      }
      try{
        //try to load things from the hash
        if(location.hash){
          var unescaped_data = JSON.parse(unescape(location.hash.substring(1)));
          setResults(unescaped_data);
        }
      } catch(e){}

      try{
          //set the current site to remove the hash
          history.pushState({}, window.title, "/");
      } catch(e){}

      //submit
      submitButton.click(function(){
        //set the right url of the current draft
        var escaped_results = escape(JSON.stringify(getResults()));

        //try and write the current entry into history.
        try{
          history.pushState({}, window.title, "/#"+escaped_results);
        } catch(e){}

        //make a temporary form
        var $tempForm = $("<form method='POST' action='/sender/submit/'>").append(
          $("<input type='hidden' name='data'>").val(unescape(escaped_results))
        );

        //and submit it.
        $tempForm.appendTo("body").submit();

        //ok, we do not want to submit the other form.
        return false;
      });

      //preview
      previewButton.click(function(){
        //set the right url of the current draft
        var escaped_results = escape(JSON.stringify(getResults()));

        //try and write the current entry into history.
        try{
          history.pushState({}, window.title, "/#"+escaped_results);
        } catch(e){}

        //make a temporary form
        var $tempForm = $("<form method='POST' action='/sender/preview/'>").append(
          $("<input type='hidden' name='data'>").val(unescape(escaped_results))
        );

        //and submit it.
        $tempForm.appendTo("body").submit();

        //ok, we do not want to submit the other form.
        return false;
      });

      //draft
      draftButton.click(function(){
        var escaped_results = escape(JSON.stringify(getResults()));

        var the_thing = prompt("Copy this text and save it to have a draft. Paste and press enter to load existing draft. Press cancel to do nothing. ", escaped_results);
        if(the_thing){
          try{
            //try to load things from the hash
            var unescaped_data = JSON.parse(unescape(the_thing));
            setResults(unescaped_data);
          } catch(e){
            alert("Could not load draft. ");
          }
        }

        return false;
      });
    })
  })
};

SenderGUI.createEmailField = function(field){

  //Über-difficult email validation
  var re = /^[a-zA-Z0-9._%+-]+\@([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$/

  $(field)
  .on('tokenfield:createtoken', function (e) {
    var data = e.attrs.value.split('|')
    e.attrs.value = data[1] || data[0]
    e.attrs.label = data[1] ? data[0] + ' (' + data[1] + ')' : data[0]
  })
  .on('tokenfield:createdtoken', function (e) {
    var valid = re.test(e.attrs.value)
    if (!valid) {
      $(e.relatedTarget).addClass('invalid');
    }
  })
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

  $("#reload").click(function(){
    SenderGUI.reload();
    return false;
  });

  SenderGUI.reload();
})
