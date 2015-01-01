
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

/* GUI functions */
var AdminGUI = {};

AdminGUI.reload = function(){
  //reload the admin GUI
  AdminGUI._block
  .empty()
  .text("Updating, please wait ...");

  Admin.getAllUsers(function(s, users){

    if(!s){
      AdminGUI._block
      .text("Failed to load users, please try again later. ");

      return;
    }

    var UserTable = $('<table class="table table-striped">').append(
      "<thead><tr><th>Username</th><th>Admin?</th><th>allowed Emails</th><th></th></tr></thead>"
    )

    for(var i=0;i<users.length;i++){
      (function(user){

        var $tr = $("<tr>").appendTo(UserTable);

        //username
        $("<td>").text(user.username).appendTo($tr);

        //isAdmin
        var isAdmin = user.isAdmin;

        $("<td>").append(
          isAdmin?"yes":"no",
          $('<form class="form-inline">').append(
            '<button type="submit" class="btn btn-primary">'+(isAdmin?"Remove Admin":"Make Admin")+'</button>'
          ).submit(function(){
            Admin.setUser(user.username, {"isAdmin": !isAdmin}, function(s){
              if(!s){
                alert("Could not update user, please try again later. ");
              }
              AdminGUI.reload();
            });
            return false;
          })
        ).appendTo($tr);

        //allowedEmails
        $("<td>").text(user.allowedEmails.join(",")).appendTo($tr);

        //delete
        $("<td>").append(
          $('<form class="form-inline">').append(
            '<button type="submit" class="btn btn-danger">Delete</button>'
          ).submit(function(){
            console.log(user.username);
            Admin.deleteUser(user.username, function(s){
              if(!s){
                alert("Could not delete user, please try again later. ");
              }
              AdminGUI.reload();
            });
            return false;
          })
        ).appendTo($tr);
      })(users[i]);
    }

    var NewEntry = $("<input type='text' class='form-control' placeholder='E-Mail'>");

    var Form = $('<form class="form-inline">').append(
      NewEntry,
      '<button type="submit" class="btn btn-primary">Grant access</button>'
    ).submit(function(){
      var user = NewEntry.val().split("@")[0];
      Admin.createUser(user, function(s){
        if(!s){
          alert("Could not create user, please try again later. ");
        }
        AdminGUI.reload();
      });
      return false;
    })


    //append all the elements
    AdminGUI._block
    .empty()
    .append(
      "<h2>Authorised Users</h2>",
      UserTable,
      "<br />",
      Form
    )
  });
}


$(function(){
  AdminGUI._block = $("#admin");

  $("#reload").click(function(){
    AdminGUI.reload();
    return false;
  });

  AdminGUI.reload();
});
