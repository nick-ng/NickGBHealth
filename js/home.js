//var socket = io();

$(document).ready(function() {
  
}); // $( document ).ready(function() {

$( '#newGameButton' ).click(function() {
  $.get( '/', {newGame:true}, function(data) {
    console.log(data)
  });
});

$( 'joinGameForm' ).submit(function() {
});
