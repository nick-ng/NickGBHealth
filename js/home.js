
$(document).ready(function() {
  // Other stuff
  
}); // $( document ).ready(function() {

$( '#testButton' ).click(function() {
  socket.emit( 'testA', 'hello' );
});

socket.on( 'testB', function(message) {
  $( '#testTextarea' ).val(message);
  console.log(message);
});
