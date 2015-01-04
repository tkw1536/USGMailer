var Composer = {};

Composer.get_meta = function(callback){
  $.ajax({
    url: "/compose/backend/get_meta",
    jsonp: "callback",
    data: {},
    dataType: "jsonp",
    success: function(data){
      callback(data);
    }
  });
}

Composer.save_draft = function(id, draft, callback){

  $.ajax({
    url: "/compose/backend/store_draft",
    jsonp: "callback",
    data: {
      "id": id,
      "data": draft
    },
    dataType: "jsonp",
    success: function(data){
      callback(data);
    }
  });
}
