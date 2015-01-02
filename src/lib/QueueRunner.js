
/**
* A simple Queue implementation.
*/
var QueueRunner = function(args, on_error, on_finish){
  //store the quenue
  this.theQuenue = [];

  //the arguments
  this.args = args;

  //what happens on error
  this.on_error = on_error;

  //what happens on finish
  this.on_finish = on_finish;
};

//push something to the quenue
QueueRunner.prototype.push = function(){
  return Array.prototype.push.apply(this.theQuenue, arguments);
}

//run the next item from the quenue
QueueRunner.prototype.start = function(){
  //get the item
  var nextItem = this.theQuenue.shift();

  try{
    //try to call it.
    nextItem.call(this, this.args, QueueRunner.prototype.start.bind(this));
  } catch(e){

    //it it is undefined, we are done.
    if(typeof nextItem == "undefined"){
      return this.on_finish();
    } else {
      return this.on_error(e);
    }
  }
};

module.exports.QueueRunner = QueueRunner;
