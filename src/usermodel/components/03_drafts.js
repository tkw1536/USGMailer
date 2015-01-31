var
  uuid = require("node-uuid"),
  extend = require("extend"),
  templates = require("../../sender/templates.js");

var mailregEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = function(usermodel){
  usermodel.drafts = {};

  usermodel.drafts.getDraftIds = function(user, callback){
    usermodel.users.getDrafts(user, function(success, message){
      if(success){

        //extract the draft ids
        var draftIds = [];
        for(var i=0;i<message.length;i++){
          draftIds.push(message[i].id);
        }

        //and send them
        callback(true, draftIds);
      } else {
        callback(false, message);
      }
    })
  }

  usermodel.drafts.getDraft = function(user, id, callback){
    usermodel.users.getDrafts(user, function(success, message){
      if(success){

        //search for the draft and find it.
        for(var i=0;i<message.length;i++){
          if(message[i].id == id){
            usermodel.drafts.buildDraft(user, message[i].data, callback);
            return;
          }
        }

        //hmm, can't find it.
        callback(false, "Draft does not exist. ");
      } else {
        callback(false, message);
      }
    })
  }

  usermodel.drafts.getDrafts = function(user, callback){
    //extract the drafts
    var drafts = [];
    var rawDrafts = [];

    var step = function(i, length){
      if(i < length){
        usermodel.drafts.buildDraft(user, rawDrafts[i].data, function(success, message){
          if(success){
            drafts.push({id: rawDrafts[i].id, data: message});
            step(i+1, length);
          } else {
            callback(false, message);
          }
        });
      } else {
        callback(true, drafts);
      }
    }

    usermodel.users.getDrafts(user, function(success, message){
      if(success){
        rawDrafts = message;
        step(0, rawDrafts.length);
      } else {
        callback(false, message);
      }
    })
  }

  usermodel.drafts.setDraft = function(user, id, draft, callback){
    usermodel.drafts.buildDraft(user, draft, function(success, message){
      if(success){
        var draft = message;
        usermodel.users.getDrafts(user, function(success, message){
          if(success){

            var done = false;

            //search for the draft and insert it.
            for(var i=0;i<message.length;i++){
              if(message[i].id == id){
                message[i].data = draft;
                done = true;
                break;
              }
            }

            if(!done){
              message.push({
                "id": id,
                "data": draft
              });
            }

            //set the drafts
            usermodel.users.setDrafts(user, message, callback);
          } else {
            callback(false, message);
          }
        });
      } else {
        callback(false, message);
      }
    });
  }
  usermodel.drafts.hasDraft = function(user, id, callback){
    usermodel.users.getDrafts(user, function(success, message){
      if(success){
        //search for the draft and find it.
        for(var i=0;i<message.length;i++){
          if(message[i].id == id){
            callback(true, true);
            return;
          }
        }

        //hmm, can't find it.
        callback(true, false);
      } else {
        callback(false, message);
      }
    })
  }


  usermodel.drafts.deleteDraft = function(user, id, callback){
    usermodel.users.getDrafts(user, function(success, message){
      if(success){

        //search for the draft and delete it
        for(var i=0;i<message.length;i++){
          if(message[i].id == id){
            message.splice(i, 1);
            usermodel.users.setDrafts(user, message, callback);
            return;
          }
        }

        callback(false, "Draft does not exist. ");
      } else {
        callback(false, message);
      }
    });
  }

  usermodel.drafts.buildDraft = function(user, draft, callback){
    usermodel.users.getAllowedEmails(user, function(success, message){
      if(success){
        var availableEmails = message;
        usermodel.drafts.getAvailableTemplates(function(success, message){
          if(success){
            var cleanDraft = {};
            var availableTemplates = message;

            if(typeof draft !== "object"){
              callback(false, "Draft must be an object. ");
              return;
            }

            var done=false;

            ["to", "cc", "bcc"].map(function(to){
              if(done){
                return;
              }

              var toValue = draft[to];

              if(typeof toValue == "string"){
                if(toValue !== ""){
                  toValue = draft[to].split(" ");
                } else {
                  toValue = [];
                }
              } else if(!Array.isArray(toValue)){
                toValue = [];
              }

              for(var i=0;i<toValue.length;i++){
                if(!mailregEx.test(toValue[i])){
                  callback(false, "Invalid e-mail adress '"+toValue[i]+"'. ")
                  done = true;
                  return;
                }
              }

              //and set the cleanDraft
              cleanDraft[to] = toValue;
            });

            if(done){
              return;
            }

            //validate subject
            if(!draft.hasOwnProperty("subject") || typeof draft.subject !== "string"){
              cleanDraft.subject = "(New mail)";
            } else {
              cleanDraft.subject = draft.subject;
            }

            //check from
            if(!draft.hasOwnProperty("from") || typeof draft.from !== "string" || availableEmails.indexOf(draft.from) == -1){
              cleanDraft.from = user; //from myself.
            } else {
              cleanDraft.from = draft.from;
            }

            //check content
            if(!draft.hasOwnProperty("content") || typeof draft.content !== "string"){
              cleanDraft.content = "";
            } else {
              cleanDraft.content = draft.content;
            }

            //check template
            if(!draft.hasOwnProperty("template") || typeof draft.template !== "string" || availableTemplates.indexOf(draft.template) == -1){
              cleanDraft.template = availableTemplates[0];
            } else {
              cleanDraft.template = draft.template;
            }

            //message content-type, either text or html.
            if(!draft.hasOwnProperty("content_type") || typeof draft.content_type !== "string" || ["html", "text"].indexOf(draft.content_type) == -1){
              cleanDraft.content_type = "html"; //default content type is html.
            } else {
              cleanDraft.content_type = draft.content_type;
            }

            //Render the draft
            var theTemplate = templates.getTemplateIfAvailable(cleanDraft.template);
            var theDraft = theTemplate[cleanDraft.content_type] || theTemplate["text"] || theTemplate["html"];

            //render the draft
            try{
              cleanDraft.content_cooked = theDraft(JSON.parse(JSON.stringify(cleanDraft)));
            } catch(e){
              callback(false, "Unable to render template '"+cleanDraft.template+"': "+e.message);
              return;
            }

            //The end.
            callback(true, cleanDraft);
          } else {
            callback(false, message);
          }
        });
      } else {
        callback(false, message);
      }
    });
  }

  usermodel.drafts.getAvailableTemplates = function(callback){
    var templData = templates.getAll();
    var templateNames = [];

    for(var i=0;i<templData.length;i++){
      templateNames.push(templData[i].meta.title);
    }

    callback(true, templateNames);
  }

  usermodel.drafts.createNewDraft = function(user, callback){
    usermodel.drafts.createNewDraftId(user, function(success, message){
      var id = message;
      if(success){
        usermodel.drafts.setDraft(user, message, {}, function(success, message){
          if(success){
            callback(true, id);
          } else {
            callback(false, message);
          }
        });
      } else {
        callback(false, message);
      }
    });

  }

  usermodel.drafts.createNewDraftId = function(user, callback){
    usermodel.drafts.getDraftIds(user, function(success, message){
      if(success){
        var newId;
        while(message.indexOf(newId = uuid.v1()+uuid.v4()) != -1){
          //do nothing.
        }

        callback(true, newId);
      } else {
        callback(false, message)
      }
    });
  }
}
