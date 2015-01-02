/* Admin Backend Functions */
var Admin = {};

Admin.getUsers = function(callback){
  $.ajax({
    url: "/admin/backend/get_users",
    jsonp: "callback",
    dataType: "jsonp",
    success: function(data){
      callback(data.success, data.users);
    }
  });
}

//get all the users
Admin.getAllUsers = function(callback){
  var results = [];

  Admin.getUsers(function(s,u){
    if(!s){
      callback(false);
    } else {
      var index = 0;

      var next = function(){
        if(index < u.length){
          Admin.getUser(u[index], function(s, d){
            index++;
            results.push(d);
            next();
          });
        } else {
          callback(true, results);
        }
      };

      next();
    }
  })
}

Admin.getUser = function(user, callback){
  $.ajax({
    url: "/admin/backend/get_user",
    jsonp: "callback",
    data: {
      "user": user
    },
    dataType: "jsonp",
    success: function(data){
      callback(data.success, data.user);
    }
  });
}

Admin.setUser = function(user, to, callback){
  $.ajax({
    url: "/admin/backend/set_user",
    jsonp: "callback",
    data: {
      "user": user,
      "to": to
    },
    dataType: "jsonp",
    success: function(data){
      callback(data.success);
    }
  });
}

Admin.deleteUser = function(user, callback){
  $.ajax({
    url: "/admin/backend/delete_user",
    jsonp: "callback",
    data: {
      "user": user,
    },
    dataType: "jsonp",
    success: function(data){
      callback(data.success);
    }
  });
}

Admin.createUser = function(user, callback){
  $.ajax({
    url: "/admin/backend/create_user",
    jsonp: "callback",
    data: {
      "user": user,
    },
    dataType: "jsonp",
    success: function(data){
      callback(data.success, data.newUser);
    }
  });
}
