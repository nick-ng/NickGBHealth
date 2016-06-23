var rosterID = 0;
var rosterSize = [0, 0];
var rosterCookies = ['', ''];
var maxRosterSize = 9;

$(document).ready(function() {
  populateAllPlayersDOM();
  hookAllPlayersEvents();
  $( '#maxRosterSize' ).text(maxRosterSize);
}); // $( document ).ready(function() {

$( '#guildBack-butt' ).click(function() {
  hideAllPlayerSelectors()
  $( '#guildSelector' ).removeClass( 'hidden' );
  $( '#guildBack' ).addClass( 'hidden' );
});

function populateAllPlayersDOM() {
  for (var i = 0; i < common.allPlayers.length; i++) {
    var guildObj = common.allPlayers[i]
    var guildHTML = '<div id="' + guildObj.name + 'Players" class="hidden">';
    var selectorHTML = '<button id="' + guildObj.name + '-butt" ' +
      'class="col-xs-4 btn btn-default" type="button">' +
      '<img src="/images/' + guildObj.name + '.png" ' +
      'alt="' + common.capFirst(guildObj.name) + '" class="img-responsive center-block"></button>';
    $( '#guildSelector' ).append(selectorHTML);
    var captainsHTML = '';
    var mascotsHTML = '';
    var playersHTML = '';
    var unionHTML = '';
    for (var j = 0; j < guildObj.players.length; j++) {
      var player = guildObj.players[j];
      if (player.role == 'c') {
        captainsHTML += playerButtonHTML(player.name, ' (C)' );
      } else if (player.role == 'm') {
        mascotsHTML += playerButtonHTML(player.name, ' (M)' );
      } else if (!player.role) {
        playersHTML += playerButtonHTML(player.name, '' );
      }
    }
    if (captainsHTML.length > 0) {
      captainsHTML = '<p id="captains">' + captainsHTML + '</p>';
    }
    if (mascotsHTML.length > 0) {
      mascotsHTML = '<p id="mascots">' + mascotsHTML + '</p>';
    }
    if (playersHTML.length > 0) {
      playersHTML = '<p id="players">' + playersHTML + '</p>';
    }
    if (guildObj.union.length > 0) {
      unionHTML += '<p id="union">';
      for (var j = 0; j < guildObj.union.length; j++) {
        unionHTML += playerButtonHTML(guildObj.union[j], '');
      };
      unionHTML += '</p>'
    }
    guildHTML += captainsHTML + mascotsHTML + playersHTML + unionHTML + '</div>';
    $( '#allPlayers' ).append(guildHTML);
  }
};

function playerButtonHTML(name, special) {
  var Name = common.capFirst(name).replace( /-v$/, ', Veteran' ) + special;
  if (name == 'avarisse') {
    Name = 'Avarisse &amp; Greede';
  }
  if (name == 'harry') {
    Name = 'Harry &lsquo;the Hat&rsquo;';
  }
  return '<button id="' + name + '-butt" class="btn btn-default" type="button">' + Name + '</button>';
}

function hookAllPlayersEvents() {
  $( '#guildSelector button' ).each(function() {
    $(this).click(function() {
      var guild = $(this).attr( 'id' ).replace(/-butt$/, '' );
      var Guild = common.capFirst(guild);
      hideAllPlayerSelectors()
      chooseGuild( Guild );
      $( '#allPlayers' ).removeClass( 'hidden' );
      $( '#' + guild + 'Players' ).removeClass( 'hidden' );
    });
  });

  $( '#allPlayers button' ).each(function() {
    $(this).click(function() {
      var player = $(this).attr( 'id' ).replace(/-butt$/, '' );
      var playerCookie = '1' + player + '0';
      if ($(this).hasClass( 'btn-primary' )) {
        rosterSize[rosterID]--
        $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
        rosterCookies[rosterID] = rosterCookies[rosterID].replace( playerCookie, '' );
      } else {
        rosterSize[rosterID]++;
        $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
        rosterCookies[rosterID] += playerCookie;
      };
      $(this).blur();
      $( '#rosterSize' ).text(rosterSize[rosterID]);
      $( '#output' ).text(rosterCookies[rosterID]);
    });
  });
};

function chooseGuild(guildName) {
  $( '#guildSelector' ).addClass( 'hidden' );
  $( '#guildBack' ).removeClass( 'hidden' );
  $( '#guildBack-butt' ).text( guildName + ', click here to change guild' );
};

function hideAllPlayerSelectors() {
  $( '#allPlayers' ).addClass( 'hidden' );
  $( '#allPlayers div' ).each(function () {
    $(this).addClass( 'hidden' );
  });
  $( '#allPlayers button' ).each(function() {
    $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
  });
  rosterCookies[rosterID] = '';
  rosterSize[rosterID] = 0;
  $( '#rosterSize' ).text(rosterSize[rosterID]);
  $( '#output' ).text(rosterCookies[rosterID]);
};
