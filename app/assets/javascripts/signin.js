(function() {
  var po = document.createElement('script');
  po.type = 'text/javascript'; po.async = true;
  po.src = 'http://plus.google.com/js/client:plusone.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);
})();

var helper = (function() {
  var authResult = undefined;
  var user_google_id = "";
  var taskListsCount = 0;
  var taskCompletedCount = 0;
  var taskPendingCount = 0;
  var taskTeamCompletedCount = 0;
  var taskTeamPendingCount = 0;

  return {
    /**
    * Hides the sign-in button and connects the server-side app after
    * the user successfully signs in.
    */
    onSignInCallback: function(authResult) {
      if (authResult['access_token']) {
        // The user is signed in
        this.authResult = authResult;
        helper.connectServer();
        // After loading the Google+ API, render the profile data from Google+.
        gapi.client.load('plus','v1',this.renderProfile);
      } else if (authResult['error']) {
        // The user is not signed in.
        console.log('There was an error: ' + authResult['error']);
        $('#authOps').hide('slow');
        $('#gConnect').show();
        $('#share-button').hide();
      }
      console.log('authResult', authResult);
    },
    /**
     * Retrieves and renders the authenticated user's Google+ profile.
     */
    renderProfile: function() {
      var request = gapi.client.plus.people.get( {'userId' : 'me'} );
      request.execute( function(profile) {
        console.log(profile);
        $.ajax({
          type: 'POST',
          url: '/signin/save_user',
          data: {id: profile.id, email: profile.emails[0].value},
          success: function(result) {
            console.log(result);
            helper.circles();
          }
        });
        $('#circle_user_id').val(profile.id);
        user_google_id = profile.id;
        $('#profile').empty();
        if (profile.error) {
          $('#profile').append(profile.error);
          return;
        }
        if (profile.gender == "male") {
          if (profile.cover && profile.cover.coverPhoto) {
            $('#profile').append(
              '<div class="col-md-12">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-male"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3>'+
                    '<p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p>'+
                    '<p><img src="' + profile.cover.coverPhoto.url + '"></p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          } else {
            $('#profile').append(
              '<div class="col-md-12">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-male"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3>'+
                    '<p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          }
        } else {
          if (profile.cover && profile.cover.coverPhoto) {
            $('#profile').append(
              '<div class="col-md-12">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-female"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3>'+
                    '<p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p>'+
                    '<p><img src="' + profile.cover.coverPhoto.url + '"></p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          } else {
            $('#profile').append(
              '<div class="col-md-12">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-female"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3>'+
                    '<p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          }
        }
      });
      $('#authOps').show('slow');
      $('#gConnect').hide();
      $('#share-button').show();
    },
    /**
     * Calls the server endpoint to disconnect the app for the user.
     */
    disconnectServer: function() {
      // Revoke the server tokens
      $.ajax({
        type: 'POST',
        url: '/signin/disconnect',
        async: false,
        success: function(result) {
          console.log('revoke response: ' + result);
          $('#authOps').hide();
          $('#gConnect').show();
          $('#share-button').hide();
        },
        error: function(e) {
          console.log(e);
        }
      });
    },
    /**
     * Calls the server endpoint to connect the app for the user.
     */
    connectServer: function() {
      console.log(this.authResult.code);
      $.ajax({
        type: 'POST',
        url: '/signin/connect?state=' + $("#state").text(),
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          // helper.people();
          helper.calendar();
          helper.files();
          helper.task_lists();
          helper.activities();
          // helper.circles();
          helper.circleMembers();
        },
        processData: false,
        data: this.authResult.code + ',' + this.authResult.id_token + ',' + this.authResult.access_token
      });
    },
    /**
     * Calls the server endpoint to get the list of people in user's circle.
     */
    people: function() {
      $.ajax({
        type: 'GET',
        url: '/peoples',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendCircled(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the list of events in calendar.
     */
    calendar: function() {
      $.ajax({
        type: 'GET',
        url: '/calendars/primary/events',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendCalendar(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the list of files in google drive.
     */
    files: function() {
      $.ajax({
        type: 'GET',
        url: '/files',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendDrive(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the task lists.
     */
    task_lists: function() {
      $.ajax({
        type: 'GET',
        url: '/task_lists',
        contentType: 'application/octet-stream; charset=utf-8',
        async: false,
        success: function(result) {
          console.log(result);
          helper.appendTaskLists(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the list of tasks.
     */
    tasks: function(taskListId) {
      $.ajax({
        type: 'GET',
        url: '/task_lists/' + taskListId + '/tasks',
        contentType: 'application/octet-stream; charset=utf-8',
        async: false,
        success: function(result) {
          console.log(result);
          helper.appendTasks(result, taskListId);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the list of Activities.
     */
    activities: function() {
      $.ajax({
        type: 'GET',
        url: '/activities',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendActivity(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the list of Circles.
     */
    circles: function() {
      $.ajax({
        type: 'GET',
        url: '/circles',
        dataType: 'json',
        contentType: 'application/json',
        data: {user_google_id: user_google_id},
        success: function(result) {
          console.log(result);
          helper.appendCircles(result);
        }
      });
    },
    /**
     * Calls the server endpoint to get the list of Circles.
     */
    circleMembers: function() {
      $.ajax({
        type: 'GET',
        url: '/peoples/circle_peoples',
        dataType: 'json',
        contentType: 'application/json',
        data: {id: $("#circle_id").text()},
        success: function(result) {
          console.log(result);
          helper.getCircleMembers(result);
        }
      });
    },
    /**
     * get circle members from DB.
     */
    getCircleMembers: function(members) {
      var circleMembersCount = 0;
      $('#circleMembers').empty();
      for (var m in members) {
        circleMembersCount++;
        $('#circleMembers').show();
        member = members[m];
        $.ajax({
          type: 'GET',
          url: '/peoples/'+member.google_id,
          dataType: 'json',
          contentType: 'application/json',
          success: function(result) {
            console.log(result);
            helper.appendCircleMembers(result);
          }
        });
      }
      if(circleMembersCount == 0){
        $('#noCircleMembers').show();
      }
    },
    /**
     * Displays circle members retrieved from DB.
     */
    appendCircleMembers: function(member) {
      if(member.gender == "male") {
        $('#circleMembers').append(
          '<div class="col-md-6">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-male"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3><a href="' + member.url + '" target="_blank">' + member.displayName + '</a></h3>'+
                '<p><a href="' + member.url + '" target="_blank"><img src="' + member.image.url + '"></a></p>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
      } else if(member.gender == "female") {
        $('#circleMembers').append(
          '<div class="col-md-6">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-female"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3><a href="' + member.url + '" target="_blank">' + member.displayName + '</a></h3>'+
                '<p><a href="' + member.url + '" target="_blank"><img src="' + member.image.url + '"></a></p>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
      } else {
        $('#circleMembers').append(
          '<div class="col-md-6">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-users"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3><a href="' + member.url + '" target="_blank">' + member.displayName + '</a></h3>'+
                '<p><a href="' + member.url + '" target="_blank"><img src="' + member.image.url + '"></a></p>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
      }
    },
    /**
     * Displays visible People retrieved from server.
     */
    appendCircled: function(people) {
      $('#visiblePeople').empty();
      for (var personIndex in people.items) {
        person = people.items[personIndex];
        $('#visiblePeople').append(
          '<div class="col-md-6">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-users"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3><a href="' + person.url + '" target="_blank">' + person.displayName + '</a></h3>'+
                '<p><a href="' + person.url + '" target="_blank"><img src="' + person.image.url + '"></a></p>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
      }
    },
    /**
     * Displays circles retrieved from DB.
     */
    appendCircles: function(circles) {
      var circleCount = 0;
      $('#circle').empty();
      for (var c in circles) {
        circleCount++;
        $('#circle').show();
        circle = circles[c];
        $('#circle').append(
          '<div class="col-md-6">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-support"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3><a href="/circles/' + circle.id + '">' + circle.display_name + '</a></h3>'+
                '<p>' + circle.description + '</p>'+
                '<p>'+
                  ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/circles/' + circle.id + '/destroy">Delete</a>'+
                  ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/circles/' + circle.id + '/edit">Update</a>'+
                '</p>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
      }
      if(circleCount==0){
        $('#noCircle').show();
      }
    },
    /**
     * Displays available Calendar Event retrieved from server.
     */
    appendCalendar: function(events) {
      var calendarCount = 0;
      var teamCalendarCount = 0;
      $('#calendarEvent').empty();
      $('#calendarTeamEvents').empty();
      for (var eventIndex in events.items) {
        event = events.items[eventIndex];
        if(event.extendedProperties && event.extendedProperties.private.circle_id == $("#circle_id").text()) {
          teamCalendarCount++;
          $('#calendarTeamEvents').show();
          if(event.hangoutLink) {
            $('#calendarTeamEvents').append(
              '<div class="col-md-6">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-calendar"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a></h3>'+
                    '<p>' + event.description + '</p>'+
                    '<p>'+
                      ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '/destroy">Delete</a>'+
                      ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '">Update</a>'+
                      ' <a class="btn btn-primary" href="' + event.hangoutLink + '" target="_blank">Hangout</a>'+
                    '</p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          } else {
            $('#calendarTeamEvents').append(
              '<div class="col-md-6">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-calendar"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a></h3>'+
                    '<p>' + event.description + '</p>'+
                    '<p>'+
                      ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '/destroy">Delete</a>'+
                      ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '">Update</a>'+
                    '</p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          }
        } else {
          calendarCount++;
          $('#calendarEvent').show();
          if(event.hangoutLink) {
            $('#calendarEvent').append(
              '<div class="col-md-6">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-calendar"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a></h3>'+
                    '<p>' + event.description + '</p>'+
                    '<p>'+
                      ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '/destroy">Delete</a>'+
                      ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '">Update</a>'+
                      ' <a class="btn btn-primary" href="' + event.hangoutLink + '" target="_blank">Hangout</a>'+
                    '</p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          } else {
            $('#calendarEvent').append(
              '<div class="col-md-6">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-calendar"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a></h3>'+
                    '<p>' + event.description + '</p>'+
                    '<p>'+
                      ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '/destroy">Delete</a>'+
                      ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '">Update</a>'+
                    '</p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          }
        }
      }
      if(calendarCount == 0){
        $('#noCalendarEvent').show();
      }
      if(teamCalendarCount==0){
        $('#noCalendarTeamEvents').show();
      }
    },
    /**
     * Displays available files in drive retrieved from server.
     */
    appendDrive: function(drive) {
      var fileCount = 0;
      var teamFileCount = 0;
      $('#driveFiles').empty();
      $('#driveTeamFiles').empty();
      var count = 0;
      for (var itemIndex in drive.items) {
        item = drive.items[itemIndex];
        if(!item.explicitlyTrashed) {
          count++;
          if(item.properties && item.properties[0].value == $("#circle_id").text()) {
            teamFileCount++;
            $('#driveTeamFiles').show();
            if(item.thumbnailLink) {
              if(count%4 == 0) {
                $('#driveFiles').append('<div class="row">');
              }
              $('#driveTeamFiles').append(
                '<div class="col-md-3">'+
                  '<div class="feature-box-style2">'+
                    '<div class="feature-box-title">'+
                      '<i class="fa fa-file"></i>'+
                    '</div>'+
                    '<div class="feature-box-containt">'+
                      '<p>Owner: ' + item.ownerNames[0] + '</p>'+
                      '<h3>'+
                        '<a href="' + item.alternateLink + '" target="_blank">' + item.title + '</a>'+
                        '<ul class="project-details">'+
                          '<li title="" data-rel="tooltip" data-placement="top" data-original-title="Type">'+
                            '<img src="' + item.thumbnailLink + '" alt="screen" style="width: 100px;height: 75px;"/>'+
                          '</li>'+
                        '</ul>'+
                      '</h3>'+
                      '<p>'+
                        ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/destroy">Delete</a>'+
                        ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/copy">Copy</a>'+
                        ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/comments/show">Comments</a>'+
                      '</p>'+
                      '<div id="export-links-' + item.id + '"></div>'+
                      '<div class="common-share"><div class="g-plus" data-action="share" data-height="24" data-href="' + item.alternateLink + '"></div></div>'+
                      '<script type="text/javascript">gapi.plus.go();</script>'+
                      '<p style="margin-bottom: 10px;">'+
                        ' <a class="btn btn-sm btn-primary" href="https://drive.google.com/file/d/' + item.id + '/edit?usp=sharing" target="_blank"><i class="fa fa-google-plus"></i> Share with users</a>'+
                      '</p>'+
                    '</div>'+
                  '</div>'+
                '</div>'
              );
              if(item.exportLinks){
                var st = "#export-links-"+item.id
                $(st).html(
                  'Export: '
                );
                Object.keys(item.exportLinks).forEach(function(key) {
                  $(st).append(
                    '<a class="capitalize" href="' + item.exportLinks[key] + '" target="_blank">' + item.exportLinks[key].substring(item.exportLinks[key].lastIndexOf("=")+1,item.exportLinks[key].length) + '</a> '
                  );
                });
              }
              if(count%4 != 0) {
                $('#driveFiles').append('</div>');
              }
            } else {
              if(count%4 == 0) {
                $('#driveFiles').append('<div class="row">');
              }
              $('#driveTeamFiles').append(
                '<div class="col-md-3">'+
                  '<div class="feature-box-style2">'+
                    '<div class="feature-box-title">'+
                      '<i class="fa fa-file"></i>'+
                    '</div>'+
                    '<div class="feature-box-containt">'+
                      '<p>Owner: '+ item.ownerNames[0] + '</p>'+
                      '<h3>'+
                        '<a href="' + item.alternateLink + '" target="_blank">' + item.title + '</a>'+
                        '<ul class="project-details">'+
                          '<li title="" data-rel="tooltip" data-placement="top" data-original-title="Type">'+
                            '<img src="' + item.iconLink + '" alt="screen"/>'+
                          '</li>'+
                        '</ul>'+
                      '</h3>'+
                      '<p>'+
                        ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/destroy">Delete</a>'+
                        ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/copy">Copy</a>'+
                        ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/comments/show">Comments</a>'+
                      '</p>'+
                      '<div id="export-links-' + item.id + '"></div>'+
                      '<div class="common-share"><div class="g-plus" data-action="share" data-height="24" data-href="' + item.alternateLink + '"></div></div>'+
                      '<script type="text/javascript">gapi.plus.go();</script>'+
                      '<p style="margin-bottom: 10px;">'+
                        ' <a class="btn btn-sm btn-primary" href="https://drive.google.com/file/d/' + item.id + '/edit?usp=sharing" target="_blank"><i class="fa fa-google-plus"></i> Share with users</a>'+
                      '</p>'+
                    '</div>'+
                  '</div>'+
                '</div>'
              );
              if(item.exportLinks){
                var st = "#export-links-"+item.id
                $(st).html(
                  'Export: '
                );
                Object.keys(item.exportLinks).forEach(function(key) {
                  $(st).append(
                    '<a class="capitalize" href="' + item.exportLinks[key] + '" target="_blank">' + item.exportLinks[key].substring(item.exportLinks[key].lastIndexOf("=")+1,item.exportLinks[key].length) + '</a> '
                  );
                });
              }
              if(count%4 != 0) {
                $('#driveFiles').append('</div>');
              }
            }
          } else {
            fileCount++;
            $('#driveFiles').show();
            if(item.thumbnailLink) {
              if(count%4 == 0) {
                $('#driveFiles').append('<div class="row">');
              }
              $('#driveFiles').append(
                '<div class="col-md-3">'+
                  '<div class="feature-box-style2">'+
                    '<div class="feature-box-title">'+
                      '<i class="fa fa-file"></i>'+
                    '</div>'+
                    '<div class="feature-box-containt">'+
                      '<p>Owner: '+ item.ownerNames[0] + '</p>'+
                      '<h3>'+
                        '<a href="' + item.alternateLink + '" target="_blank">' + item.title + '</a>'+
                        '<ul class="project-details">'+
                          '<li title="" data-rel="tooltip" data-placement="top" data-original-title="Type">'+
                            '<img src="' + item.thumbnailLink + '" alt="screen" style="width: 100px;height: 75px;"/>'+
                          '</li>'+
                        '</ul>'+
                      '</h3>'+
                      '<p>'+
                        ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/destroy">Delete</a>'+
                        ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/copy">Copy</a>'+
                        ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/comments/show">Comments</a>'+
                      '</p>'+
                      '<div id="export-links-' + item.id + '"></div>'+
                      '<div class="common-share"><div class="g-plus" data-action="share" data-height="24" data-href="' + item.alternateLink + '"></div></div>'+
                      '<script type="text/javascript">gapi.plus.go();</script>'+
                      '<p style="margin-bottom: 10px;">'+
                        ' <a class="btn btn-sm btn-primary" href="https://drive.google.com/file/d/' + item.id + '/edit?usp=sharing" target="_blank"><i class="fa fa-google-plus"></i> Share with users</a>'+
                      '</p>'+
                    '</div>'+
                  '</div>'+
                '</div>'
              );
              if(item.exportLinks){
                var st = "#export-links-"+item.id
                $(st).html(
                  'Export: '
                );
                Object.keys(item.exportLinks).forEach(function(key) {
                  $(st).append(
                    '<a class="capitalize" href="' + item.exportLinks[key] + '" target="_blank">' + item.exportLinks[key].substring(item.exportLinks[key].lastIndexOf("=")+1,item.exportLinks[key].length) + '</a> '
                  );
                });
              }
              if(count%4 != 0) {
                $('#driveFiles').append('</div>');
              }
            } else {
              if(count%4 == 0) {
                $('#driveFiles').append('<div class="row">');
              }
              $('#driveFiles').append(
                '<div class="col-md-3">'+
                  '<div class="feature-box-style2">'+
                    '<div class="feature-box-title">'+
                      '<i class="fa fa-file"></i>'+
                    '</div>'+
                    '<div class="feature-box-containt">'+
                      '<p>Owner: '+ item.ownerNames[0] + '</p>'+
                      '<h3>'+
                        '<a href="' + item.alternateLink + '" target="_blank">' + item.title + '</a>'+
                        '<ul class="project-details">'+
                          '<li title="" data-rel="tooltip" data-placement="top" data-original-title="Type">'+
                            '<img src="' + item.iconLink + '" alt="screen"/>'+
                          '</li>'+
                        '</ul>'+
                      '</h3>'+
                      '<p>'+
                        ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/destroy">Delete</a>'+
                        ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/copy">Copy</a>'+
                        ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/comments/show">Comments</a>'+
                      '</p>'+
                      '<div id="export-links-' + item.id + '"></div>'+
                      '<div class="common-share"><div class="g-plus" data-action="share" data-height="24" data-href="' + item.alternateLink + '"></div></div>'+
                      '<script type="text/javascript">gapi.plus.go();</script>'+
                      '<p style="margin-bottom: 10px;">'+
                        ' <a class="btn btn-sm btn-primary" href="https://drive.google.com/file/d/' + item.id + '/edit?usp=sharing" target="_blank"><i class="fa fa-google-plus"></i> Share with users</a>'+
                      '</p>'+
                    '</div>'+
                  '</div>'+
                '</div>'
              );
              if(item.exportLinks){
                var st = "#export-links-"+item.id
                $(st).html(
                  'Export: '
                );
                Object.keys(item.exportLinks).forEach(function(key) {
                  $(st).append(
                    '<a class="capitalize" href="' + item.exportLinks[key] + '" target="_blank">' + item.exportLinks[key].substring(item.exportLinks[key].lastIndexOf("=")+1,item.exportLinks[key].length) + '</a> '
                  );
                });
              }
              if(count%4 != 0) {
                $('#driveFiles').append('</div>');
              }
            }
          }
        }
      }
      if(fileCount == 0){
        $('#noDriveFiles').show();
      }
      if(teamFileCount == 0){
        $('#noDriveTeamFiles').show();
      }
    },
    /**
     * Displays available Task Lists retrieved from server.
     */
    appendTaskLists: function(taskLists) {
      for (var taskListIndex in taskLists.items) {
        taskListsCount++;
        $('#taskLists').show();
        taskList = taskLists.items[taskListIndex];
        $('#task_list_id').val(taskList.id);
        $('#taskLists').append(
          '<div class="col-md-6">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-tasks"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3>' + taskList.title + ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskList.id + '/tasks/new">Create Task</a></h3>'+
                '<p>'+
                  ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskList.id + '/destroy">Delete</a>'+
                  ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskList.id + '">Update</a>'+
                '</p>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
        helper.tasks(taskList.id);
      }
      if(taskListsCount == 0){
        $('#noTaskLists').show();
      }
      if(taskCompletedCount == 0 && taskPendingCount == 0){
        $('#noTasks').show();
      }
      if(taskTeamCompletedCount == 0 && taskTeamPendingCount == 0){
        $('#noTeamTasks').show();
      }
    },
    /**
     * Displays available Tasks in Task List retrieved from server.
     */
    appendTasks: function(tasks, taskListId) {
      for (var taskIndex in tasks.items) {
        task = tasks.items[taskIndex];
        if(task.title.lastIndexOf("[") >= 0) {
          if(task.title.substring(task.title.lastIndexOf("[")+1, task.title.lastIndexOf("]")) == $("#circle_id").text()) {
            if (task.status == "completed" && task.completed) {
              taskTeamCompletedCount++;
              $('#teamCompletedTasks').show();
              $('#teamTasksCompleted').append(
                '<p>'+ '- Title: ' + task.title.substring(0, task.title.lastIndexOf("[")) + ', Notes: ' + task.notes + ', Completed at: ' + task.completed.substring(0,10) + '</p>'+
                '<p>'+
                  ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
                '</p>'
              );
            } else if(task.status == "needsAction" && task.due) {
              taskTeamPendingCount++;
              $('#teamPendingTasks').show();
              $('#teamTasksPending').append(
                '<p>'+ '- Title: ' + task.title.substring(0, task.title.lastIndexOf("[")) + ', Notes: ' + task.notes + ', Due Date: ' + task.due.substring(0, 10) + '</p>'+
                '<p>'+
                  ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/complete">Complete</a>'+
                '</p>'
              );
            }
          }
          if (task.status == "completed" && task.completed) {
            taskCompletedCount++;
            $('#completedTasks').show();
            $('#tasksCompleted').append(
              '<p>'+ '- Title: ' + task.title.substring(0, task.title.lastIndexOf("[")) + ', Notes: ' + task.notes + ', Completed at: ' + task.completed.substring(0,10) + '</p>'+
              '<p>'+
                ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
              '</p>'
            );
          } else if(task.status == "needsAction" && task.due) {
            taskPendingCount++;
            $('#pendingTasks').show();
            $('#tasksPending').append(
              '<p>'+ '- Title: ' + task.title.substring(0, task.title.lastIndexOf("[")) + ', Notes: ' + task.notes + ', Due Date: ' + task.due.substring(0, 10) + '</p>'+
              '<p>'+
                ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/complete">Complete</a>'+
              '</p>'
            );
          }
        } else {
          if (task.status == "completed" && task.completed) {
            taskCompletedCount++;
            $('#completedTasks').show();
            $('#tasksCompleted').append(
              '<p>'+ '- Title: ' + task.title + ', Notes: ' + task.notes + ', Completed at: ' + task.completed.substring(0,10) + '</p>'+
              '<p>'+
                ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
              '</p>'
            );
          } else if(task.status == "needsAction" && task.due) {
            taskPendingCount++;
            $('#pendingTasks').show();
            $('#tasksPending').append(
              '<p>'+ '- Title: ' + task.title + ', Notes: ' + task.notes + ', Due Date: ' + task.due.substring(0, 10) + '</p>'+
              '<p>'+
                ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/complete">Complete</a>'+
              '</p>'
            );
          }
        }
      }
    },
    /**
     * Displays available Activities retrieved from server.
     */
    appendActivity: function(activity) {
      var activityCount = 0;
      $('#activityFeeds').empty();
      for (var activityIndex in activity.items) {
        activityCount++;
        $('#activityFeeds').show();
        item = activity.items[activityIndex];
        $('#activityFeeds').append(
          '<div class="col-md-3">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-archive"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3><a href="' + item.url + '" target="_blank">' + item.title + '</a></h3>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
      }
      if(activityCount == 0){
        $('#noActivityFeeds').show();
      }
    },
    /**
     * Displays Search Results retrieved from server.
     */
    appendSearchResult: function(search) {
      var count_search = 0;
      $('#search_result').empty();
      $("#modal-window-add-circle-member").modal("hide");
      for (var searchIndex in search.items) {
        count_search++;
        people = search.items[searchIndex];
        $('#search_result').append(
          '<div class="feature-boxs-wrapper">'+
            '<div class="feature-box-style2" style="margin: 0 0 5px 0;">'+
              '<div class="feature-box-containt" style="margin-top: 0px;padding: 5px 0px 0;">'+
                '<h3 style="padding-bottom: 5px;">'+
                  '<div class="form-group" style="margin-bottom: 0px;">'+
                    '<input name="google_id[]" type="checkbox" value="'+people.id+'" style="margin-right: 7px;">'+
                    '<a href="'+people.url+'" target="_blank" style="margin-right: 7px;">'+people.displayName+'</a>'+
                    '<a href="'+people.url+'" target="_blank"><img src="'+people.image.url+'"></a>'+
                  '</div'+
                '</h3>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
        if(search.nextPageToken) {
          $('#next_results').html('<input id="next_page_token" name="next_page_token" type="hidden" value="'+search.nextPageToken+'">');
        }
      }
      if(count_search == 0) {
        $('#search_result').append(
          '<div class="feature-boxs-wrapper">'+
            '<div class="feature-box-style2" style="margin: 0 0 5px 0;">'+
              '<div class="feature-box-containt" style="margin-top: 0px;padding: 5px 0px 0;">'+
                '<h3 style="padding-bottom: 5px;">'+
                  'No Result Found!!!!'+
                '</h3>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
        $("#next_button_circle_member_search").hide();
      }
      $("#modal-window-circle-members-result").modal("show");
    },
  };
})();

$(document).ready(function() {
  $('#disconnect').click(helper.disconnectServer);
  $('#create_button_circle_member').click(function(){
    $.ajax({
      type: 'GET',
      url: '/peoples/search',
      dataType: 'json',
      contentType: 'application/json',
      data: {query: $("#add_circle_member_form #query").val()},
      success: function(result) {
        console.log(result);
        helper.appendSearchResult(result);
      }
    });
  });
  $('#next_button_circle_member_search').click(function(){
    $.ajax({
      type: 'GET',
      url: '/peoples/search',
      dataType: 'json',
      contentType: 'application/json',
      data: {query: $("#add_circle_member_form #query").val(), next_page_token: $("#add_circle_member_search_form #next_page_token").val()},
      success: function(result) {
        console.log(result);
        helper.appendSearchResult(result);
      }
    });
  });
});

function onSignInCallback(authResult) {
  helper.onSignInCallback(authResult);
}