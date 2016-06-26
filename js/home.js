//var socket = io();

$(document).ready(function() {
  
}); // $( document ).ready(function() {

$( '#newGameButton' ).click(function() {
  $( '#output' ).text('Getting new game ID.');
  $.post( '/', {newGame:true}, function(res) {
    $( '#output' ).text('Got response.');
    console.log(res);
    if (res.id) {
      location.href = '/' + res.id + '?mode=host';
    }
  });
});

$( '#joinGameForm' ).submit(function() {
  var id = $( '#gameID' ).val();
  console.log(id);
  location.href = '/' + id;
  return false
});
