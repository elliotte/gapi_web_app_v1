// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require modernizr.custom
//= require signin
//= require bootstrap.min
//= require jquery.easing.1.3
//= require jquery.backstretch.min
//= require classie
//= require gnmenu
//= require jquery.flexslider-min
//= require waypoints.min
//= require jquery.mousewheel-3.0.6.pack
//= require jquery.fancybox
//= require jquery.countTo
//= require jquery.accordion
//= require jquery.isotope
//= require jquery.cbpQTRotator
//= require jquery.fitvids
//= require snap.svg-min
//= require jquery.nicescroll.min
//= require retina-1.1.0
//= require bootstrap-datepicker
//= require mine

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

	$('#start_time_event').datepicker({
	    format: "yyyy/mm/dd",
	    autoclose: true
	});
	$('#end_time_event').datepicker({
	    format: "yyyy/mm/dd",
	    autoclose: true
	});
});