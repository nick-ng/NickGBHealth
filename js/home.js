$(document).ready(function() {
  if (Cookies.get( 'resume-url' )) {
    $( '#resumeGameButton' ).removeClass( 'hidden' );
  }
  Cookies.remove( 'roster0' ); // Remove these later
  Cookies.remove( 'roster1' );
  Cookies.remove( 'test-cards' );
}); // $( document ).ready(function() {

$( '#resumeGameButton' ).click(function() {
  location.href = Cookies.get( 'resume-url' );
});

$( '#newGameButton' ).click(function() {
  $( '#output' ).text('Getting new game ID.');
  $.post( '/', {newGame:true}, function(res) {
    $( '#output' ).text('Got response.');
    if (res.id) {
      location.href = '/' + res.id + '?mode=host';
    }
  });
});

$( '#joinGameForm' ).submit(function() {
  var id = $( '#gameID' ).val();
  if (id) {
    location.href = '/' + id;
  } else {
    $( '#joinAlert' ).removeClass( 'hidden' );
  }
  return false
});

$( '#specGameForm' ).submit(function() {
  var id = $( '#gameIDSpec' ).val();
  if (id) {
    location.href = '/spec/' + id;
  } else {
    $( '#specAlert' ).removeClass( 'hidden' );
  }
  return false
});

$( '#playerDemo' ).click(function() {
  if (!Cookies.get( 'test-cards' )) {
    Cookies.set( 'test-cards', true, {expires: 0.02});
  }
  location.href = '/play/demo';
});

$( '#spectatorDemo' ).click(function() {
  if (!Cookies.get( 'test-cards' )) {
    Cookies.set( 'test-cards', true, {expires: 0.02});
  }
  location.href = '/spec/demo';
});
