var
  uuid = require("node-uuid");

module.exports = function(usermodel){
  usermodel.drafts = {};

  usermodel.drafts.getDraftIds = function(user, callback){
    usermodel.users.getDrafts(user, function(success, message){
      if(success){

        //extract the draft ids
        var draftsIds = [];
        for(var i=0;i<message.length;i++){
          draftsIds.push(message[i].id);
        }

        //and send them
        callback(true, draftIds)
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
            callback(true, message[i].data);
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
    usermodel.users.getDrafts(user, function(success, message){
      if(success){

        //extract the drafts
        var drafts = [];
        for(var i=0;i<message.length;i++){
          drafts.push(message[i].data);
        }

        //and send them
        callback(true, drafts)
      } else {
        callback(false, message);
      }
    })
  }

  usermodel.drafts.setDraft = function(user, id, draft, callback){
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
            "data": data
          });
        }

        //set the drafts
        usermodel.users.setDrafts(user, message, callback);
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

  usermodel.drafts.createNewDraftId = function(user, callback){
    //TODO: Make this id a bit smarter.
    //Maybe just have a counter and always check which ones already exist.
    callback(true, uuid.v1()+uuid.v4()); 
  }
}
