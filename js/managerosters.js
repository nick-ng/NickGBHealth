var rosterID = 0;
var rosterSize = [0, 0];
var rosterStrings = ['', ''];
var rosters = [];
var maxRosterSize = 9;

$(document).ready(function() {
  $( '#maxRosterSize' ).text(maxRosterSize);
  populateDOM();
  hookEvents();
  loadRoster();
}); // $( document ).ready(function() {

function populateDOM() {
  for (var i = 0; i < common.allGuilds.length; i++) {
    var guildObj = common.allGuilds[i];
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
        captainsHTML += common.playerButtonHTML(player.name, ' (C)' );
      } else if (player.role == 'm') {
        mascotsHTML += common.playerButtonHTML(player.name, ' (M)' );
      } else if (!player.role) {
        playersHTML += common.playerButtonHTML(player.name, '' );
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
        unionHTML += common.playerButtonHTML(guildObj.union[j], '');
      };
      unionHTML += '</p>'
    }
    guildHTML += captainsHTML + mascotsHTML + playersHTML + unionHTML + '</div>';
    $( '#allPlayers' ).append(guildHTML);
  }
}

function hookEvents() {
  $( '#guildBack-butt' ).click(resetRosterManager);

  $( 'input[name=rosters]:radio' ).change(function() {
    resetRosterManager();
    loadRoster();
  });

  $( '#saveRosterButton' ).click(function() {
    cookieName = 'roster' + rosterID;
    rosters[rosterID].hpThreshold = $( '#lowHealthThreshold' ).val();
    Cookies.set( 'rosters', JSON.stringify(rosters), { expires: common.cookieExpiry });
    var rosterNumber = rosterID + 1;
    $( '#saveSuccessAlert' ).text( 'Roster ' + rosterNumber + ' saved.' );
    $( '#saveSuccessAlert' ).removeClass( 'hidden' );
  });

  $( '#guildSelector button' ).each(function() {
    $(this).click(function() {
      $( '#saveSuccessAlert' ).addClass( 'hidden' );
      var guild = $(this).attr( 'id' ).replace(/-butt$/, '' );
      hideAllPlayerSelectors()
      chooseGuild(guild);
    });
  });

  $( '#allPlayers button' ).each(function() {
    $(this).click(function() {
      $( '#saveSuccessAlert' ).addClass( 'hidden' );
      var player = $(this).attr( 'id' ).replace(/-butt$/, '' );
      if ($(this).hasClass( 'btn-primary' )) {
        $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
        $(this).removeClass( 'active' );
        rosters[rosterID] = _.without(rosters[rosterID], player)
      } else {
        $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
        $(this).addClass( 'active' );
        rosters[rosterID].players.push(player);
      };
      $( '#rosterSize' ).text(rosters[rosterID].players.length);
    });
  });
}

function chooseGuild(guildName) {
  var Guild = common.capFirst(guildName);
  $( '#guildSelector' ).addClass( 'hidden' );
  $( '#guildBack' ).removeClass( 'hidden' );
  $( '#guildBack-butt' ).text( Guild + ', click here to change guild' );
  $( '#allPlayers' ).removeClass( 'hidden' );
  $( '#saveControl' ).removeClass( 'hidden' );
  $( '#' + guildName + 'Players' ).removeClass( 'hidden' );
  rosters[rosterID].guild = guildName;
}

function choosePlayers(playerList) {
  $( '#allPlayers button' ).each(function() {
    var player = $(this).attr( 'id' ).replace(/-butt$/, '' );
    if (playerList.indexOf(player) > -1) { // It's in the list
      $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
      $(this).addClass( 'active' );
    }
  });
}

function hideAllPlayerSelectors() {
  $( '#allPlayers' ).addClass( 'hidden' );
  $( '#allPlayers div' ).each(function () {
    $(this).addClass( 'hidden' );
  });
  $( '#allPlayers button' ).each(function() {
    $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
    $(this).removeClass( 'active' );
  });
  rosters[rosterID] = {guild:'', players:[], hpThreshold:0};
  $( '#rosterSize' ).text(rosters[rosterID].players.length);
  $( '#saveControl' ).addClass( 'hidden' );
  $( '#saveSuccessAlert' ).addClass( 'hidden' );
}

function loadRoster() {
  rosterID = parseInt($( 'input[name=rosters]:checked' ).attr('id'));
  var tempCookie = Cookies.get( 'rosters' );
  if (tempCookie) {
    rosters = JSON.parse(tempCookie);
  } else {
    rosters = [{}, {}];
  }
  if (rosters[rosterID] && rosters[rosterID].guild && rosters[rosterID].players) {
    chooseGuild(rosters[rosterID].guild);
    choosePlayers(rosters[rosterID].players);
    $( '#rosterSize' ).text(rosters[rosterID].players.length);
    $( '#lowHealthThreshold' ).val(rosters[rosterID].hpThreshold || 0);
  }
}

function resetRosterManager() {
  $( '#saveSuccessAlert' ).addClass( 'hidden' );
  hideAllPlayerSelectors()
  $( '#guildSelector' ).removeClass( 'hidden' );
  $( '#guildBack' ).addClass( 'hidden' );
}
