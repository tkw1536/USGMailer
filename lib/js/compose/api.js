var Composer = function(url, args){
  //parse the arguments to the api function
  var args = args;
  args = Array.isArray(args)?args:[];

  return function(){
    //read the right parameters and store them as parameters for the api call
    var api_call = {};

    for(var i=0;i<args.length;i++){
      api_call[args[i]] = arguments[i];
    }

    var callback = arguments[args.length];

    $.ajax({
      url: url,
      jsonp: "callback",
      data: api_call,
      dataType: "jsonp",
      success: function(result){
        callbacK(result.success, result.message);
      }
    });
  }
}

Composer.get_meta = Composer("/compose/backend/get_meta", []);
Composer.save_draft = Composer("/compose/backend/store_draft", ["id", "draft"]);
