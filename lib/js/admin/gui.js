/* GUI functions */
var AdminGUI = {};

AdminGUI.reload = function(){
  //reload the admin GUI
  AdminGUI._block
  .empty()
  .text("Updating, please wait ...");

  Admin.whoami(function(me){

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

          if(user.username == me){
            $("<td>").append("yes").appendTo($tr);
          } else {
            $("<td>").append(
              isAdmin?"yes":"no",
              $('<form class="form-inline" role="form" style="display:inline; ">').append(
                " ",
                '<button type="submit" class="btn btn-primary btn-xs">'+(isAdmin?"Remove Admin":"Make Admin")+'</button>'
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
          }

          var emailForm = $("<input type='text' class='form-control input-sm' placeholder='E-Mails'>").val(user.allowedEmails.join(", "));

          //allowedEmails
          $("<td>").append(
            $('<form class="form-inline" role="form" style="display:inline; ">').append(
              emailForm,
              " ",
              '<button type="submit" class="btn btn-primary btn-xs">Update</button>'
            ).submit(function(evt){

              var newMails = emailForm.val().split(",");

              for(var i=0;i<newMails.length;i++){
                newMails[i] = newMails[i].trim();
              }

              try{
                Admin.setUser(user.username, {"allowedEmails": newMails}, function(s){
                  if(!s){
                    alert("Could not update user, please try again later. ");
                  }
                  AdminGUI.reload();
                });
              } catch(e){
                console.log(e);
              }
              return false;
            })
          ).appendTo($tr);

          if(user.username == me){
            $tr.addClass("success");
            $("<td colspan='2'>").appendTo($tr);
            return;
          }

          //delete
          $("<td>").append(
            $('<form class="form-inline">').append(
              '<button type="submit" class="btn btn-danger btn-xs">Delete</button>'
            ).submit(function(){
              Admin.deleteUser(user.username, function(s){
                if(!s){
                  alert("Could not delete user, please try again later. ");
                }
                AdminGUI.reload();
              });
              return false;
            })
          ).appendTo($tr);

          $("<td>").append(
            $('<form class="form-inline" style="display: inline; ">').append(
              '<button type="submit" class="btn btn-default btn-xs">Impersonate</button>'
            ).submit(function(){
              Admin.impersonateUser(user.username, function(s){
                if(!s){
                  alert("Could not impersonate user. ");
                } else {
                  window.location.reload();
                }
              });
              return false;
            })
          ).appendTo($tr);
        })(users[i]);
      }

      var NewEntry = $("<input type='text' class='form-control input-sm' placeholder='E-Mail'>");

      var Form = $('<form class="form-inline">').append(
        NewEntry,
        " ",
        '<button type="submit" class="btn btn-primary btn-sm">Grant access</button>'
      ).submit(function(){
        var user = NewEntry.val().split("@")[0];
        Admin.createUser(user, function(s){
          if(!s){
            alert("Could not create user, please try again later. ");
          }
          AdminGUI.reload();
        });
        return false;
      });

      UserTable.append(
        $("<tr>").append(
          $("<td colspan='5'>").append(Form)
        )
      )


      //append all the elements
      AdminGUI._block
      .empty()
      .append(
        "<h2>Authorised Users</h2>",
        UserTable
      )
    });
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
