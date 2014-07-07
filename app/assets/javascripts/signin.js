var helper = (function() {
var authResult = undefined;

return {
  /**
  * Hides the sign-in button and connects the server-side app after
  * the user successfully signs in.
  *
  * @param {Object} authResult An Object which contains the access token and
  *   other authentication information.
  */
    onSignInCallback: function(authResult) {
      $('#authResult').html('Auth Result:<br/>');
      for (var field in authResult) {
        $('#authResult').append(' ' + field + ': ' + authResult[field] + '<br/>');
      }
      if (authResult['access_token']) {
        // The user is signed in
        this.authResult = authResult;
        helper.connectServer();
        // After we load the Google+ API, render the profile data from Google+.
        gapi.client.load('plus','v1',this.renderProfile);
      } else if (authResult['error']) {
        // There was an error, which means the user is not signed in.
        // As an example, you can troubleshoot by writing to the console:
        console.log('There was an error: ' + authResult['error']);
        $('#authResult').append('Logged out');
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
          $.ajax({
            type: 'POST',
            url: window.location.href + 'signin/save_user',
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
              $('<p>Hello ' + profile.displayName + '!<br />Tagline: ' +
              profile.tagline + '<br />About: ' + profile.aboutMe + '</p>'));
          if (profile.cover && profile.coverPhoto) {
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
        url: window.location.href + 'signin/disconnect',
        async: false,
        success: function(result) {
          console.log('revoke response: ' + result);
          $('#authOps').hide();
          $('#profile').empty();
          $('#visiblePeople').empty();
          $('#authResult').empty();
          $('#gConnect').show();
        },
        error: function(e) {
          console.log(e);
        }
      });
    },
    /**
     * Calls the server endpoint to connect the app for the user. The client
     * sends the one-time authorization code to the server and the server
     * exchanges the code for its own tokens to use for offline API access.
     * For more information, see:
     *   https://developers.google.com/+/web/signin/server-side-flow
     */
    connectServer: function() {
      console.log(this.authResult.code);
      $.ajax({
        type: 'POST',
        url: window.location.href + 'signin/connect?state=' + $("#state").text(),
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.people();
          helper.calendar();
          helper.drive();
          helper.task_lists();
        },
        processData: false,
        data: this.authResult.code + ',' + this.authResult.id_token + ',' + this.authResult.access_token
      });
    },
    /**
     * Calls the server endpoint to get the list of people visible to this app.
     */
    people: function() {
      $.ajax({
        type: 'GET',
        url: window.location.href + 'signin/people',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendCircled(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the list of events in calendar visible to this app.
     */
    calendar: function() {
      $.ajax({
        type: 'GET',
        url: window.location.href + 'signin/calendar',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendCalendar(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the list of files in google drive visible to this app.
     */
    drive: function() {
      $.ajax({
        type: 'GET',
        url: window.location.href + 'signin/drive',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendDrive(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the task lists of tasks in google visible to this app.
     */
    task_lists: function() {
      $.ajax({
        type: 'GET',
        url: window.location.href + 'signin/task_lists',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendTaskLists(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the list of tasks in google visible to this app.
     */
    tasks: function(taskListId) {
      $.ajax({
        type: 'GET',
        url: window.location.href + 'signin/tasks?taskListId=' + taskListId,
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendTasks(result);
        },
        processData: false
      });
    },
    /**
     * Displays visible People retrieved from server.
     *
     * @param {Object} people A list of Google+ Person resources.
     */
    appendCircled: function(people) {
      $('#visiblePeople').empty();

      $('#visiblePeople').append('Number of people visible to this app: ' +
          people.totalItems + '<br/>');
      for (var personIndex in people.items) {
        person = people.items[personIndex];
        $('#visiblePeople').append(person.displayName + '<img src="' + person.image.url + '">' + '<br/>');
      }
    },
    /**
     * Displays available Event retrieved from server.
     */
    appendCalendar: function(events) {
      $('#calendarEvent').empty();
      $('#calendarEvent').append('Number of Events available to this app: ' + events.items.length + '<br/>');
      for (var eventIndex in events.items) {
        event = events.items[eventIndex];
        $('#calendarEvent').append('Created At: ' + event.created + ', Summary: ' + event.summary + '<br/>');
      }
    },
    /**
     * Displays available Event retrieved from server.
     */
    appendDrive: function(drive) {
      $('#driveFiles').empty();
      $('#driveFiles').append('Number of drive files available to this app: ' + drive.items.length + '<br/>');
      for (var itemIndex in drive.items) {
        item = drive.items[itemIndex];
        $('#driveFiles').append('Created Date: ' + item.createdDate + ', Title: ' + item.title + '<br/>');
      }
    },
    /**
     * Displays available Task Lists retrieved from server.
     */
    appendTaskLists: function(taskLists) {
      $('#taskLists').empty();
      $('#taskLists').append('Number of task lists available to this app: ' + taskLists.items.length + '<br/>');
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
      $('#taskLists').append('Number of tasks available in task list: ' + tasks.items.length + '<br/>');
      for (var taskIndex in tasks.items) {
        task = tasks.items[taskIndex];
        $('#taskLists').append('- Title: ' + task.title + ', Notes: ' + task.notes + '<br/>');
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