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
        $('#profile').append(
          $('<p><img src=\"' + profile.image.url + '\"></p>'));
        $('#profile').append(
          $('<p>Hello ' + profile.displayName + '!</p>'));
        if (profile.cover && profile.cover.coverPhoto) {
          $('#profile').append(
            $('<p><img src=\"' + profile.cover.coverPhoto.url + '\"></p>'));
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
          helper.drive();
          helper.task_lists();
          helper.activity_feed();
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
        url: '/signin/people',
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
        url: '/signin/calendar',
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
    drive: function() {
      $.ajax({
        type: 'GET',
        url: '/signin/drive',
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
        url: '/signin/task_lists',
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
        url: '/signin/tasks?task_list_id=' + taskListId,
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
    activity_feed: function() {
      $.ajax({
        type: 'GET',
        url: '/signin/activity_feed',
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

      $('#visiblePeople').append('Number of Friends: ' + people.totalItems + '<br/>');
      for (var personIndex in people.items) {
        person = people.items[personIndex];
        $('#visiblePeople').append('<a href="' + person.url + '" target="_blank">' + '<img src="' + person.image.url + '">' + person.displayName  + '</a><br/>');
      }
    },
    /**
     * Displays available Calendar Event retrieved from server.
     */
    appendCalendar: function(events) {
      $('#calendarEvent').empty();
      $('#calendarEvent').append('Number of Events: ' + events.items.length + '<br/>');
      for (var eventIndex in events.items) {
        event = events.items[eventIndex];
        $('#calendarEvent').append('Created At: ' + event.created.substring(0, 10) + ', Summary: <a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a><br/>'+ ' <a onclick="deleteEvent('+"'" + event.id + "'"+');" class= "event_' + event.id + '" href="#" > ' + 'Delete' + '</a><br/>'+'<a data-toggle="modal" data-target="#modal-window" data-remote=true href="/signin/update_calendar_event/' + event.id + '"> ' + "Update" + '</a><br/>');
      }
    },
    /**
     * Displays available files in drive retrieved from server.
     */
    appendDrive: function(drive) {
      $('#driveFiles').empty();
      $('#driveFiles').append('Number of files in drive: ' + drive.items.length + '<br/>');
      for (var itemIndex in drive.items) {
        item = drive.items[itemIndex];
        $('#driveFiles').append('Created Date: ' + item.createdDate.substring(0, 10) + ', Title: <a href="' + item.alternateLink + '" target="_blank"> ' + item.title + '</a><br/>');
      }
    },
    /**
     * Displays available Task Lists retrieved from server.
     */
    appendTaskLists: function(taskLists) {
      $('#taskLists').empty();
      $('#taskLists').append('Number of task lists: ' + taskLists.items.length + '<br/>');
      for (var taskListIndex in taskLists.items) {
        taskList = taskLists.items[taskListIndex];
        $('#taskLists').append('Title: ' + taskList.title + '<br/>');
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
          $('#tasksCompleted').append('- Title: ' + task.title + ', Notes: ' + task.notes + ', Due Date: ' + task.due.substring(0, 10) + ', Completed at: ' + task.completed.substring(0,10) + '<br/>');
        } else {
          $('#tasksPending').append('- Title: ' + task.title + ', Notes: ' + task.notes + ', Due Date: ' + task.due.substring(0, 10) + '<br/>');
        }
      }
    },


    // append deleted event

   // appendEventDelete: function(event){
   //  alert("inside function");
   // },



    /**
     * Displays available Activities retrieved from server.
     */
    appendActivity: function(activity) {
      $('#activityFeeds').empty();

      $('#activityFeeds').append('Number of Activity Feeds: ' + activity.items.length + '<br/>');
      for (var activityIndex in activity.items) {
        item = activity.items[activityIndex];
        $('#activityFeeds').append('Title: ' + item.title + ', Content: ' + item.object.content + '<br/>');
      }
    },
  };
})();

$(document).ready(function() {
  $('#disconnect').click(helper.disconnectServer);
});

function onSignInCallback(authResult) {
  helper.onSignInCallback(authResult);
}

function deleteEvent(e_id){
  $.ajax({
        url: "/signin/delete_calendar_event/" +e_id ,
        type: "post",
        dataType: "json",
        data: {"_method":"delete"},
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          alert("event deleted");
          // console.log(result);
          //:success => "$(this).up('.postS').remove();"
          $('#calendarEvent').up(e_id).remove();
        },
        processData: false
      });
}

function updateEvent(e_id){
  //alert("bhimasen");
  $.ajax({
        url: "/signin/update_calendar_event/" +e_id ,
        type: "put",
        //dataType: "json",
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          alert("update event")
          // console.log(result);
          // helper.appendCalender(result);
        },
        processData: false
      });
}
