var game = {
  gameID: null,
  queryObj: null
};
var teamSize = 0;
var maxTeamSize = 6;
var captainSelected = 0;
var mascotSelected = 0;
var superPlayers = 2;
var clientMode = 'solo';

$(document).ready(function() {
  game.queryObj = common.parseQueryString();
  game.gameID = location.pathname.substr(1);
  displayGameID(game.gameID, game.queryObj);
  populatePlayerSelect();
  nameRosterButtons();
  hookEvents();
  $( '.maxTeamSize' ).each(function() {
    $(this).text(maxTeamSize);
  });
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

$( '#low-health-down' ).click(function() {
  var lowHP = parseInt($( '#low-health-threshold' ).val());
  lowHP = lowHP || 0;
  lowHP = Math.max(lowHP - 1, 0);
  $( '#low-health-threshold' ).val(lowHP);
  countMyVPs(false);
});

$( '#low-health-up' ).click(function() {
  var lowHP = parseInt($( '#low-health-threshold' ).val());
  lowHP = lowHP || 0;
  lowHP = Math.max(lowHP + 1, 0);
  $( '#low-health-threshold' ).val(lowHP);
  countMyVPs(false);
});

$( '#play-butt' ).click(function() {
  $( '#tooManyPlayers' ).addClass( 'hidden' );
  var isMaxTeamSize = (captainSelected + mascotSelected + teamSize) == maxTeamSize;
  if (isMaxTeamSize || confirm( 'Fewer than ' + maxTeamSize + ' players selected. Play anyway?' )) {
    var teamList = getSelectedTeam();
    var teamObj = {
      players: teamList,
      goals: 0,
      bodys: 0,
      clocks: 0
    };
    if (game.gameID == 'solo') {
      Cookies.set( 'solo-mode', JSON.stringify(teamObj), {expires: 0.1});
      location.href = location.origin + '/play/solo' + makePlayQuery( 'solo' );
      $( '#output' ).text( 'Starting game...' );
    } else {
      var mode = '' + game.queryObj.mode;
      mode = (mode == 'host') ? 'host' : 'join';
      var gameReq = $.post( '/', {
        gameID: game.gameID,
        mode: mode,
        teamObj: teamObj
      }, function(res) {
        if (gameReq.status == 201) {
          location.href = location.origin + '/play/' + game.gameID + makePlayQuery(mode);;
          $( '#output' ).text( 'Starting game...' );
        } else {
          $( '#output' ).text( 'Error code: ' + gameReq.status);
        }
      });
    }
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

function displayGameID(gameID, queryObj) {
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
      //~ $( '#output' ).text(rosterStrings[rosterID]);
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
  var player = element.val();
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
    if (rosterObj.players.length > 0) {
      showRoster(rosterObj.players);
      $( '#low-health-threshold' ).val(rosterObj.hpThreshold);
    }
    chooseRosterText = 'Roster ' + RosterID + ' selected (' + common.capFirst(rosterObj.guild) + ').';
  } else {
    showRoster(['*']);
    chooseRosterText = 'Ad hoc roster.';
    $( '#low-health-threshold' ).val(0);
  }
  $( '#chooseRoster' ).html( chooseRosterText + '<br>Click here to choose a different roster.' );
  teamSize = 0;
  captainSelected = 0;
  mascotSelected = 0;
  $( '#teamSize' ).text(captainSelected + mascotSelected + teamSize);
  $( '#rosterSelect' ).addClass( 'hidden' );
  $( '#playerSelect' ).removeClass( 'hidden' );
}

function loadRoster(rosterID) {
  var rostersCookie = Cookies.get( 'rosters' );
  if (rostersCookie) {
    var rosters = JSON.parse(rostersCookie);
    if (rosters[rosterID].players && (rosters[rosterID].players.length > 0)) {
      return rosters[rosterID];
    }
  }
  return false;
}

function showRoster(playerList) {
  $( '#allPlayers button' ).each(function() {
    var player = $(this).val();
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

function getSelectedTeam() {
  var players = [];
  $( '#allPlayers input[type=radio]:checked' ).each(function() {
    players.push($(this).val());
  });
  $( '#allPlayers button' ).each(function() {
    if ($(this).hasClass( 'btn-primary' )) {
      players.push($(this).val());
    }
  });
  return makeTeamList(players, common.allPlayers);
}

function makeTeamList(players, allPlayers) {
  var teamList = [];
  var benchedPlayerObjs = [];
  for (var i = 0; i < players.length; i++) {
    var playerObj = _.find(allPlayers, function(item) {
      return item.name == players[i]
    });
    playerObj.currHP = playerObj.hp;
    teamList.push(playerObj);
    if (playerObj.detach) {
      var playerObjD = _.find(allPlayers, function(item) {
        return item.name == playerObj.detach
      });
      playerObjD.currHP = playerObjD.hp;
      benchedPlayerObjs.push(playerObjD);
    }
  }
  for (var i = 0; i < benchedPlayerObjs.length; i++) {
    teamList.push(benchedPlayerObjs[i]);
  }
  return teamList;
}

function makePlayQuery(mode) {
  var query = '?';
  query += 'mode=' + (mode || 'join');
  query += '&hpThreshold=' + $( '#low-health-threshold' ).val();
  return query;
}

function playerRadioHTML(name, special, radioName) {
  var Name = common.capFirst(name).replace( /-v$/, ', Veteran' ) + special;
  var html = '<label id="' + name + '-butt" name="' + radioName + '" class="btn btn-default btn-lg">';
  html += '<input type="radio" name="' + radioName + '" value="' + name + '" autocomplete="off">' + Name + '</label>';
  return html
}
