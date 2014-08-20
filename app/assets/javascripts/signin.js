(function() {
  var po = document.createElement('script');
  po.type = 'text/javascript'; po.async = true;
  po.src = 'http://plus.google.com/js/client:plusone.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);
})();

var helper = (function() {
  var authResult = undefined;

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
          contentType: 'application/octet-stream; charset=utf-8',
          success: function(result) {
            console.log(result);
          },
          processData: false,
          data: profile.id
        });

        $('#profile').empty();
        if (profile.error) {
          $('#profile').append(profile.error);
          return;
        }
        if (profile.gender == "male") {
          if (profile.cover && profile.cover.coverPhoto) {
            $('#profile').append('<div class="col-md-12"><div class="feature-box-style2"><div class="feature-box-title"><i class="fa fa-male"></i></div><div class="feature-box-containt"><h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3><p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p><p><img src="' + profile.cover.coverPhoto.url + '"></p></div></div></div>');
          } else {
            $('#profile').append('<div class="col-md-12"><div class="feature-box-style2"><div class="feature-box-title"><i class="fa fa-male"></i></div><div class="feature-box-containt"><h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3><p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p></div></div></div>');
          }
        } else {
          if (profile.cover && profile.cover.coverPhoto) {
            $('#profile').append('<div class="col-md-12"><div class="feature-box-style2"><div class="feature-box-title"><i class="fa fa-female"></i></div><div class="feature-box-containt"><h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3><p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p><p><img src="' + profile.cover.coverPhoto.url + '"></p></div></div></div>');
          } else {
            $('#profile').append('<div class="col-md-12"><div class="feature-box-style2"><div class="feature-box-title"><i class="fa fa-female"></i></div><div class="feature-box-containt"><h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3><p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p></div></div></div>');
          }
        }
      });
      $('#authOps').show('slow');
      $('#gConnect').hide();
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
          $('#profile').empty();
          $('#visiblePeople').empty();
          $('#gConnect').show();
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
          helper.people();
          helper.calendar();
          helper.files();
          helper.task_lists();
          helper.activities();
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
        url: '/calendar_events',
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
        success: function(result) {
          console.log(result);
          helper.appendTasks(result);
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
     * Displays visible People retrieved from server.
     */
    appendCircled: function(people) {
      $('#visiblePeople').empty();
      for (var personIndex in people.items) {
        person = people.items[personIndex];
        $('#visiblePeople').append('<div class="col-md-6"><div class="feature-box-style2"><div class="feature-box-title"><i class="fa fa-users"></i></div><div class="feature-box-containt"><h3><a href="' + person.url + '" target="_blank">' + person.displayName + '</a></h3><p><a href="' + person.url + '" target="_blank"><img src="' + person.image.url + '"></a></p></div></div></div>');
      }
    },
    /**
     * Displays available Calendar Event retrieved from server.
     */
    appendCalendar: function(events) {
      $('#calendarEvent').empty();
      for (var eventIndex in events.items) {
        event = events.items[eventIndex];
        $('#calendarEvent').append('<div class="col-md-6"><div class="feature-box-style2"><div class="feature-box-title"><i class="fa fa-calendar"></i></div><div class="feature-box-containt"><h3><a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a></h3><p>' + event.description + ' <a onclick=helper.deleteEvent("'+ event.id + '"); href="javascript:void(0)" class="btn btn-primary btn-main-o" >Delete</a> <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendar_events/' + event.id + '">Update</a></p></div></div></div>');
      }
    },
    /**
     * Displays available files in drive retrieved from server.
     */
    appendDrive: function(drive) {
      $('#driveFiles').empty();
      for (var itemIndex in drive.items) {
        item = drive.items[itemIndex];
        $('#driveFiles').append('<div class="col-md-3"><div class="feature-box-style2"><div class="feature-box-title"><i class="fa fa-file"></i></div><div class="feature-box-containt"><h3><a href="' + item.alternateLink + '" target="_blank">' + item.title + '</a></h3></div></div></div>');
      }
    },
    /**
     * Displays available Task Lists retrieved from server.
     */
    appendTaskLists: function(taskLists) {
      for (var taskListIndex in taskLists.items) {
        taskList = taskLists.items[taskListIndex];
        helper.tasks(taskList.id);
      }
    },
    /**
     * Displays available Tasks in Task List retrieved from server.
     */
    appendTasks: function(tasks) {
      for (var taskIndex in tasks.items) {
        task = tasks.items[taskIndex];
        if (task.status == "completed") {
          $('#tasksCompleted').append('<p>- Title: ' + task.title + ', Notes: ' + task.notes + ', Completed at: ' + task.completed.substring(0,10) + '</p>');
        } else {
          $('#tasksPending').append('<p>- Title: ' + task.title + ', Notes: ' + task.notes + ', Due Date: ' + task.due.substring(0, 10) + '</p>');
        }
      }
    },
    /**
     * Displays available Activities retrieved from server.
     */
    appendActivity: function(activity) {
      $('#activityFeeds').empty();
      for (var activityIndex in activity.items) {
        item = activity.items[activityIndex];
        $('#activityFeeds').append('<div class="col-md-3"><div class="feature-box-style2"><div class="feature-box-title"><i class="fa fa-archive"></i></div><div class="feature-box-containt"><h3><a href="' + item.url + '" target="_blank">' + item.title + '</a></h3></div></div></div>');
      }
    },
    /**
     * Delete a Calendar Event from server.
     */
    deleteEvent: function(event_id) {
      $.ajax({
        url: "/calendar_events/" + event_id ,
        type: "delete",
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          if (result == null) {
            alert("event deleted");
          } else {
            alert(result.error.message);
          }
        },
        processData: false
      });
    },
  };
})();

$(document).ready(function() {
  $('#disconnect').click(helper.disconnectServer);
});

function onSignInCallback(authResult) {
  helper.onSignInCallback(authResult);
}