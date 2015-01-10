try{
  //we are always under /admin/
  history.replaceState({}, "Admin Interface", "/admin/");

  try{
    $(document.getElementsByName("allowedEmails")).each(function(){
      //create tokenfields
      var me = $(this);
      me.tokenfield().closest("form").on("submit", function(){
        //disable them just in time for form submission
        me.tokenfield("destroy");
      });
    });
  } catch(e){}
} catch(e){}
