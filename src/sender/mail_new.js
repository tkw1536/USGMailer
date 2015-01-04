var Mail = module.exports = function Mail(data){

  //store the raw structure
  this.raw = data;

  //verify the structure
  this.verifyStructure();

  //If we can not verify the mail we can forget it.
  if(!verifiedData){
    return;
  }

  //TODo: Set all the properties


};

Mail.fromRequest = function(req){
  //TODO: Get Data from REQUEST object
  var serialisedMail = {};
  return new Mail(serialisedMail);
};

Mail.prototype.verifyStructure = function(){

}

Mail.prototype.verifyContent = function(allowedEmails, allowedTemplates){
  //first clean the data.
  var cleanData = this.verifyStructure();
  

}


Mail.prototype.toJSON = function(){

}
