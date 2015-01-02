var Sender = {};

Sender.whoami = function(callback){
  $.ajax({
    url: "/backend/whoami",
    jsonp: "callback",
    data: {},
    dataType: "jsonp",
    success: function(data){
      callback(data.username);
    }
  });
}

Sender.get_me = function(callback){
  $.ajax({
    url: "/backend/get_me",
    jsonp: "callback",
    data: {},
    dataType: "jsonp",
    success: function(data){
      callback(data);
    }
  });
}

Sender.get_meta = function(callback){
  $.ajax({
    url: "/backend/get_meta",
    jsonp: "callback",
    data: {},
    dataType: "jsonp",
    success: function(data){
      callback(data);
    }
  });
}
