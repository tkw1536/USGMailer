var
  mail = require("../sender/mail.js"),
  uuid = require("node-uuid");

module.exports = function(usermodel, MongoDB){
  usermodel.getDrafts = function(user, callback){
    usermodel.getUser(user, function(data){
      if(!data){
        callback(false);
        return;
      }

      var drafts = data.drafts;
      var draftNames = [];

      for(var i=0;i<drafts.length;i++){
        draftNames.push(drafts[i].id);
      }

      callback(true, draftNames);
    });
  }

  usermodel.getDraftsFull = function(user, callback){
    usermodel.getUser(user, function(data){
      if(!data){
        callback(false);
        return;
      }

      callback(true, data.drafts);
    });
  }

  usermodel.getDraft = function(user, id, callback){
    usermodel.getUser(user, function(data){
      if(!data){
        callback(false);
        return;
      }

      var drafts = data.drafts;
      var draftNames = [];

      for(var i=0;i<drafts.length;i++){
        if(drafts[i].id == id){
          callback(true, drafts[i].data);
          return;
        }
      }

      callback(false);
    });
  }

  usermodel.setDraft = function(user, id, mData, callback){
    var mData = mData;
    usermodel.getUser(user, function(data){
      if(!data){
        callback(false);
        return;
      }

      mData = mail.verify(mData, [], callback);

      if(!mData){
        //we alread had the callback above
        return;
      }

      //get the drafts
      var drafts = data.drafts;
      var done = false;

      //try and store the draft
      for(var i=0;i<drafts.length;i++){
        if(drafts[i].id == id){
          drafts[i].data = mData;
          done = true;
          break;
        }
      }

      //we haven't found the draft => create a new one.
      if(!done){
        drafts.push({
          "id": id,
          "data": mData
        });
      }

      //store the new drafts
      usermodel.setUser(user, {"drafts": drafts}, function(err){
        callback(!err)
      });
    });
  }

  usermodel.deleteDraft = function(user, id, callback){
    usermodel.getUser(user, function(data){
      if(!data){
        callback(false);
        return;
      }

      var drafts = data.drafts;
      var done = false;

      for(var i=0;i<drafts.length;i++){
        if(drafts[i].id == id){
          done = true;
          drafts.splice(i, 1);
          break;
        }
      }

      if(!done){
        callback(false);
        return;
      }

      //store the new drafts
      usermodel.setUser(user, {"drafts": drafts}, function(err){
        callback(!err);
      });
    });
  }

  usermodel.setDrafts = function(user, callback){
    usermodel.getUser(user, function(data){
      if(!data){
        callback(false);
        return;
      }

      var drafts = data.drafts;
      var draftNames = [];

      for(var i=0;i<drafts.length;i++){
        draftNames.push(draft[i].id);
      }

      callback(true, draftNames);
    });
  }

  usermodel.createNewDraftId = function(){
    return uuid.v1()+"-"+uuid.v4();
  }
}
