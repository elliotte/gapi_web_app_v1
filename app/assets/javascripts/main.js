$(document).ready(function () {
	$("#quick_add_event").click(function() {
		$("#modal-window-quick-create-event").modal("show");
	});
	$("#add_event").click(function() {
		$("#modal-window-create-event").modal("show");
	});
	$("#create_circle").click(function() {
		$("#modal-window-create-circle").modal("show");
	});
	$("#create_spreadsheet").click(function() {
		$("#modal-window-create-spreadsheet").modal("show");
	});
	$("#create_document").click(function() {
		$("#modal-window-create-document").modal("show");
	});
	$("#create_tasklist").click(function() {
		$("#modal-window-create-tasklist").modal("show");
	});

	$("#add_team_member").click(function() {
		$("#modal-window-add-circle-member").modal("show");
	});
	$("#create_team_event").click(function() {
		$("#modal-window-create-circle-event").modal("show");
	});
	$("#create_team_task").click(function() {
		$("#modal-window-create-circle-task").modal("show");
	});
	$("#create_team_file").click(function() {
		$("#modal-window-create-circle-document").modal("show");
	});

	$('#create_button_circle_member_search').click(function(){
	    $('#add_circle_member_search_form').submit();
	});
	$('#create_button_circle_event').click(function(){
	    $('#create_circle_event_form').submit();
	});
	$('#create_button_circle_task').click(function(){
	    $('#create_circle_task_form').submit();
	});
	$('#create_button_circle_document').click(function(){
	    $('#create_circle_document_form').submit();
	});

	$('#quick_create_button_event').click(function(){
		$('#quick_create_event_form').submit();
	});
	$('#create_button_event').click(function(){
		$('#create_event_form').submit();
	});
	$('#create_button_circle').click(function(){
		$('#create_circle_form').submit();
	});
	$('#create_button_spreadsheet').click(function(){
		$('#create_spreadsheet_form').submit();
	});
	$('#create_button_document').click(function(){
		$('#create_document_form').submit();
	});
	$('#create_button_tasklist').click(function(){
	    $('#create_tasklist_form').submit();
	});

	$('#start_time_event').datepicker({
	    format: "yyyy/mm/dd",
	    autoclose: true
	});
	$('#end_time_event').datepicker({
	    format: "yyyy/mm/dd",
	    autoclose: true
	});
});