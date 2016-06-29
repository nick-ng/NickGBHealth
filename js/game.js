var gameID;
var queryObj;
var teamSize = 0;
var maxTeamSize = 6;
var captainSelected = 0;
var mascotSelected = 0;
var superPlayers = 2;
var clientMode = 'solo';

$(document).ready(function() {
  queryObj = common.parseQueryString();
  displayGameID();
  populatePlayerSelect();
  nameRosterButtons();
  hookEvents();
  $( '#maxTeamSize' ).text(maxTeamSize);
}); // $( document ).ready(function() {

// Static DOM events
$( '#roster0-butt' ).click(function() {
  rosterButton(0);
});

$( '#roster1-butt' ).click(function() {
  rosterButton(1);
});

$( '#adhoc-butt' ).click(function() {
  rosterButton(-1)
});

$( '#chooseRoster' ).click(function() {
  $( '#rosterSelect' ).removeClass( 'hidden' );
  $( '#playerSelect' ).addClass( 'hidden' );
  $( '#allPlayers button' ).each(function() {
    $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
    $(this).removeClass( 'active' );
  });
  $( '#allPlayers input[type=radio]' ).each(function() {
    $(this).prop( 'checked', false);
  });
  $( '#allPlayers label' ).each(function() {
    $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
    $(this).removeClass( 'active' );
  });
});

$( '#play-butt' ).click(function() {
  $( '#tooManyPlayers' ).addClass( 'hidden' );
  if ((captainSelected + mascotSelected + teamSize) == maxTeamSize) {
    var players = getSelectedPlayers();
    var query = makePlayQuery(players);
    location.href = location.origin + '/play/' + gameID + query;
  } else {
    $( '#notEnoughPlayers' ).removeClass( 'hidden' );
  }
});

// DOM generators
function populatePlayerSelect() {
  var captainsHTML = '';
  var mascotsHTML = '';
  var playersHTML = '';
  for (var i = 0; i < common.allPlayers.length; i++) {
    var player = common.allPlayers[i];
    if (player.role == 'c') {
      captainsHTML += playerRadioHTML(player.name, ' (C)', 'captains');
    } else if (player.role == 'm') {
      mascotsHTML += playerRadioHTML(player.name, ' (M)', 'mascots');
    } else if (!player.role) {
      playersHTML += common.playerButtonHTML(player.name, '' );
    }
  }
  if (captainsHTML.length > 0) {
    captainsHTML = '<p><div id="captains" data-toggle="buttons">' + captainsHTML + '</div></p>';
  }
  if (mascotsHTML.length > 0) {
    mascotsHTML = '<p><div id="mascots" data-toggle="buttons">' + mascotsHTML + '</div></p>';
  }
  if (playersHTML.length > 0) {
    playersHTML = '<p id="players">' + playersHTML + '</p>';
  }
  $( '#allPlayers' ).append(captainsHTML + mascotsHTML + playersHTML);
}

function displayGameID() {
  gameID = location.pathname.substr(1);
  if (queryObj.mode && (queryObj.mode[0] == 'host')) {
    clientMode = 'host';
    joinURL = location.origin + '/' + gameID;
    $( '#qrcode' ).qrcode(joinURL);
    console.log( 'Join game url: ' + joinURL);
  } else {
    clientMode = 'join';
  }
  if (isNaN(parseInt(gameID))) {
    $( '#gameIDTitle' ).text( 'Solo Mode' );
    clientMode = 'solo';
  } else {
    $( '#gameIDHolder' ).text(gameID);
  }
}

// Generated DOM events
function hookEvents() {
  $( '#allPlayers button' ).each(function() {
    $(this).click(function() {
      if ($(this).hasClass( 'btn-primary' )) {
        teamSize--
        $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
        $(this).removeClass( 'active' );
        $( '#tooManyPlayers' ).addClass( 'hidden' );
      } else if ((teamSize + superPlayers) < maxTeamSize) {
        teamSize++;
        $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
        $(this).addClass( 'active' );
        if ((captainSelected + mascotSelected + teamSize) == maxTeamSize) {
          $( '#notEnoughPlayers' ).addClass( 'hidden' );
        }
      } else {
        $( '#tooManyPlayers' ).removeClass( 'hidden' );
      }
      $( '#teamSize' ).text(captainSelected + mascotSelected + teamSize);
    });
  });
  $( '#allPlayers input[type=radio]' ).each(function() {
    $(this).change(function() {
      var playerRole = $(this).attr( 'name' );
      if (playerRole == 'captains') {captainSelected = 1}
      else if (playerRoler = 'mascots') {mascotSelected = 1}
      if ((captainSelected + mascotSelected + teamSize) == maxTeamSize) {
        $( '#notEnoughPlayers' ).addClass( 'hidden' );
      }
      styleRadioButton($(this));
      $( '#teamSize' ).text(captainSelected + mascotSelected + teamSize);
      //~ $( '#output' ).text(rosterCookies[rosterID]);
    });
  });
}

// Other functions
function nameRosterButtons() {
  for (var i = 0; i < 2; i++) {
    var rosterObj = loadRoster(i);
    if (rosterObj) {
      $( '#roster' + i + '-butt' ).prop( 'disabled', false);
      if (rosterObj.guild) {
        var I = i + 1;
        $( '#roster' + i + '-butt' ).text( 'Roster ' + I + ' (' + common.capFirst(rosterObj.guild) + ')' );
      }
    } else {
      $( '#roster' + i + '-butt' ).prop( 'disabled', true);
    }
  }
}

function styleRadioButton(element) {
  var playerRole = element.attr( 'name' );
  var player = element.attr( 'id' ).replace(/-butt$/, '' );;
  $( '#allPlayers label[name=' + playerRole + ']' ).each(function() {
    if ($(this).attr( 'id' ).replace(/-butt$/, '' ) == player) {
      $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
    } else {
      $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
    }
  });
}

function rosterButton(rosterID) {
  var chooseRosterText;
  if (rosterID > -1) {
    var RosterID = rosterID + 1;
    var rosterObj = loadRoster(rosterID)
    if (rosterObj) {
      showRoster(rosterObj.players);
    }
    chooseRosterText = 'Roster ' + RosterID + ' selected (' + common.capFirst(rosterObj.guild) + ').';
  } else {
    showRoster(['*']);
    chooseRosterText = 'Ad hoc roster.';
  }
  $( '#chooseRoster' ).text( chooseRosterText + ' Click here to choose a different roster.' );
  teamSize = 0;
  captainSelected = 0;
  mascotSelected = 0;
  $( '#teamSize' ).text(captainSelected + mascotSelected + teamSize);
  $( '#rosterSelect' ).addClass( 'hidden' );
  $( '#playerSelect' ).removeClass( 'hidden' );
}

function loadRoster(rosterID) {
  var cookieName = 'roster' + rosterID;
  var tempCookie = Cookies.get(cookieName);
  if (tempCookie) {
    return common.parseRosterCookie(tempCookie);
  } else {
    return false
  }
}

function showRoster(playerList) {
  $( '#allPlayers button' ).each(function() {
    var player = $(this).attr( 'id' ).replace(/-butt$/, '' );
    if ((playerList[0] != '*' ) && (playerList.indexOf(player) == -1)) {
      $(this).addClass('hidden');
    } else {
      $(this).removeClass('hidden');
    }
  });
  $( '#allPlayers label' ).each(function() {
    var player = $(this).attr( 'id' ).replace(/-butt$/, '' );
    if ((playerList[0] != '*' ) && (playerList.indexOf(player) == -1)) {
      $(this).addClass('hidden');
    } else {
      $(this).removeClass('hidden');
    }
  });
}

function getSelectedPlayers() {
  var players = [];
  $( '#allPlayers input[type=radio]:checked' ).each(function() {
    players.push($(this).attr('id').replace(/-butt$/, '' ));
  });
  $( '#allPlayers button' ).each(function() {
    if ($(this).hasClass( 'btn-primary' )) {
      players.push($(this).attr( 'id' ).replace(/-butt$/, '' ));
    }
  });
  return players;
}

function makePlayQuery(players) {
  var query = '?';
  query += 'mode=' + clientMode;
  for (var i = 0; i < players.length; i++) {
    query += '&players=' + players[i];
  }
  return query;
}

function playerButtonHTML(name, special) {
  var Name = common.capFirst(name).replace( /-v$/, ', Veteran' ) + special;
  if (name == 'avarisse') {
    Name = 'Avarisse &amp; Greede';
  }
  if (name == 'harry') {
    Name = 'Harry &lsquo;the Hat&rsquo;';
  }
  return '<button id="' + name + '-butt" class="btn btn-default btn-block" type="button">' + Name + '</button>';
}

function playerRadioHTML(name, special, radioName) {
  var Name = common.capFirst(name).replace( /-v$/, ', Veteran' ) + special;
  var html = '<label id="' + name + '-butt" name="' + radioName + '" class="btn btn-default">';
  html += '<input type="radio" name="' + radioName + '" id="' + name + '-butt" autocomplete="off" checked>' + Name + '</label>';
  return html
}
