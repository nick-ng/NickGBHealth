var gameID;
var queryObj;
var teamSize = 0;
var captainSelected = 0;
var mascotSelected = 0;
var soloMode = false;

$(document).ready(function() {
  queryObj = common.parseQueryString();
  displayGameID();
  populatePlayerSelect();
  nameRosterButtons();
  hookEvents();
}); // $( document ).ready(function() {

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

function displayGameID() {
  gameID = window.location.pathname.substr(1);
  if (queryObj.mode && (queryObj.mode[0] == 'host')) {
    joinURL = window.location.origin + gameID;
    $( '#qrcode' ).qrcode(joinURL);
  }
  if (isNaN(parseInt(gameID))) {
    $( '#gameIDHolder' ).text(gameID);
  } else {
    $( '#gameIDTitle' ).text( 'Solo Mode' );
    soloMode = true;
  }
}

$( '#roster0-butt' ).click(function() {
  rosterButton(0);
});

$( '#roster1-butt' ).click(function() {
  rosterButton(1);
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

function hookEvents() {
  $( '#allPlayers button' ).each(function() {
    $(this).click(function() {
      var player = $(this).attr( 'id' ).replace(/-butt$/, '' );
      if ($(this).hasClass( 'btn-primary' )) {
        teamSize--
        $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
        $(this).removeClass( 'active' );
      } else {
        teamSize++;
        $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
        $(this).addClass( 'active' );
      }
      $( '#teamSize' ).text(captainSelected + mascotSelected + teamSize);
      //~ $( '#output' ).text(rosterCookies[rosterID]);
    });
  });
  $( '#allPlayers input[type=radio]' ).each(function() {
    $(this).change(function() {
      var playerRole = $(this).attr( 'name' );
      if (playerRole == 'captains') {captainSelected = 1}
      else if (playerRoler = 'mascots') {mascotSelected = 1}
      styleRadioButton($(this));
      $( '#teamSize' ).text(captainSelected + mascotSelected + teamSize);
      //~ $( '#output' ).text(rosterCookies[rosterID]);
    });
  });
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

function populatePlayerSelect() {
  var captainsHTML = '';
  var mascotsHTML = '';
  var playersHTML = '';
  for (var i = 0; i < common.allPlayers.length; i++) {
    var guildObj = common.allPlayers[i];
    for (var j = 0; j < guildObj.players.length; j++) {
      var player = guildObj.players[j];
      if (player.role == 'c') {
        captainsHTML += playerRadioHTML(player.name, ' (C)', 'captains');
      } else if (player.role == 'm') {
        mascotsHTML += playerRadioHTML(player.name, ' (M)', 'mascots');
      } else if (!player.role) {
        playersHTML += common.playerButtonHTML(player.name, '' );
      }
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

function rosterButton(rosterID) {
  var RosterID = rosterID + 1;
  var rosterObj = loadRoster(rosterID)
  if (rosterObj) {
    showRoster(rosterObj.players);
  }
  $( '#rosterSelect' ).addClass( 'hidden' );
  $( '#playerSelect' ).removeClass( 'hidden' );
  teamSize = 0;
  captainSelected = 0;
  mascotSelected = 0;
  $( '#teamSize' ).text(captainSelected + mascotSelected + teamSize);
  $( '#chooseRoster' ).text( 'Roster ' + RosterID + ' selected (' + common.capFirst(rosterObj.guild) + '). Click here to choose a different roster.' );
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
    if (playerList.indexOf(player) == -1) {
      $(this).addClass('hidden');
    } else {
      $(this).removeClass('hidden');
    }
  });
  $( '#allPlayers label' ).each(function() {
    var player = $(this).attr( 'id' ).replace(/-butt$/, '' );
    if (playerList.indexOf(player) == -1) {
      $(this).addClass('hidden');
    } else {
      $(this).removeClass('hidden');
    }
  });
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
