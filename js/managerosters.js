var rosterID = 0;
var rosterSize = [0, 0];
var rosterCookies = ['', ''];

$(document).ready(function() {
  
}); // $( document ).ready(function() {

$( '#guildBack-butt' ).click(function() {
  hideAllPlayerSelectors()
  $( '#guildSelector' ).removeClass( 'hidden' );
  $( '#guildBack' ).addClass( 'hidden' );
});

$( '#guildSelector button' ).each(function() {
  $(this).click(function() {
    var guild = $(this).attr( 'id' ).replace(/-butt$/, '' );
    var Guild = capFirst(guild);
    hideAllPlayerSelectors()
    chooseGuild( Guild );
    $( '#allPlayers' ).removeClass( 'hidden' );
    $( '#' + guild + 'Players' ).removeClass( 'hidden' );
  });
});

$( '#allPlayers button' ).each(function() {
  $(this).click(function() {
    var player = $(this).attr( 'id' ).replace(/-butt$/, '' );
    var playerCookie = '0' + player + '0';
    if ($(this).hasClass( 'active' )) {
      rosterSize[rosterID]--
      $(this).removeClass( 'active' );
      rosterCookies[rosterID] = rosterCookies[rosterID].replace( playerCookie, '' );
    } else {
      rosterSize[rosterID]++;
      $(this).addClass( 'active' );
      rosterCookies[rosterID] += playerCookie;
    };
    $(this).blur();
    $( '#rosterSize' ).text(rosterSize[rosterID]);
    $( '#output' ).text(rosterCookies[rosterID]);
  });
});

function chooseGuild(guildName) {
  $( '#guildSelector' ).addClass( 'hidden' );
  $( '#guildBack' ).removeClass( 'hidden' );
  $( '#guildBack-butt' ).text( guildName + ', click here to change' );
};

function hideAllPlayerSelectors() {
  $( '#allPlayers' ).addClass( 'hidden' );
  $( '#allPlayers div' ).each(function () {
    $(this).addClass( 'hidden' );
  });
  $( '#allPlayers button' ).each(function() {
    $(this).removeClass( 'active' );
  });
  rosterCookies[rosterID] = '';
  rosterSize[rosterID] = 0;
  $( '#rosterSize' ).text(rosterSize[rosterID]);
  $( '#output' ).text(rosterCookies[rosterID]);
};

//From http://stackoverflow.com/a/7224605
function capFirst(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}
