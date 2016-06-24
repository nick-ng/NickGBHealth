//var socket = io();

$(document).ready(function() {
  
}); // $( document ).ready(function() {

$( '#newGameButton' ).click(function() {
  $( '#output' ).text('Getting new game ID.');
  $.post( '/', {newGame:true}, function(res) {
    if (res.id) {
      window.location.href = '/' + res.id + '?mode=host';
    }
  });
});

$( 'joinGameForm' ).submit(function() {
});
