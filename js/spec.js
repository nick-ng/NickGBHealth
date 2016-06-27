var socket = io();
var queryObj;
var gameID;
var sides = [[],[]];
var animateDuration = 2000;

$(document).ready(function() {
  queryObj = common.parseQueryString();
  gameID = location.pathname.replace( /^\/spec\//, '' );
  joinGame(gameID);
  lastMinuteStyles();
}); // $( document ).ready(function() {

// Static DOM events

// DOM generators
function populatePlayers(sidesIn) {
  for (var teamNum = 0; teamNum < sidesIn.length; teamNum++) {
    var teamGuild = false;
    var captainHTML;
    var mascotHTML;
    var playersHTML = '';
    var playerList = sidesIn[teamNum];
    console.log(playerList.length);
    for (var i = 0; i < playerList.length; i++) {
      var playerObj = playerList[i];
      if (playerObj.role == 'c') {
        captainHTML = playerHTML(playerObj, teamNum);
        teamGuild = getGuildFromCaptain(playerObj);
      } else if (playerObj.role == 'm') {
        mascotHTML = playerHTML(playerObj, teamNum);
      } else {
        playersHTML += playerHTML(playerObj, teamNum);
      }
    }
    $( 'div [id=content-' + teamNum + ']' ).each(function() {
      $(this).html('<ul>' + captainHTML + mascotHTML + playersHTML + '</ul>');
    });
    if (teamGuild) {
      $( 'div [id=guild-' + teamNum + ']' ).each(function() {
        $(this).text(common.capFirst(teamGuild));
      })
    }
  }
  $( '.right-side .progress-bar' ).each(function() {
    $(this).addClass( 'pull-right' );
  });
}

function lastMinuteStyles() {
  $( 'div[role=team-display]' ).each(function() {
    $(this).addClass( 'col-xs-6 col-sm-5 col-md-3 col-lg-2' );
  });
  $( 'div [id=guild-1]' ).each(function() {
    $(this).text( 'Guild One' );
  });
}

// Generated DOM events
$( 'button[id=swap]' ).each(function() {
  $(this).click(function() {
    $( 'div[role=team-display]' ).each(function() {
      $(this).toggleClass( 'hidden' );
    });
  });
})

// Normal functions
function joinGame(id) {
  socket.emit( 'joinRoom', id );
  socket.emit( 'joinGame', [], 'spec' );
}

function getGuildFromCaptain(playerObj) {
  console.log('getting guild');
  for (var i = 0; i < common.allGuilds.length; i++) {
    var result = common.findInArray(common.allGuilds[i].players, playerObj.name, 'name' );
    if (result) {
      return common.allGuilds[i].name;
    }
  }
  return null;
}

function updatePlayersHP(playerList, teamNum) {
  for (var i = 0; i < playerList.length; i++) {
    var playerObj = playerList[i];
    var percent = 100 * (playerObj.currHP / playerObj.hp);
    var barID = teamNum + '_' + playerObj.name + '_bar';
    var oldPercent = parseInt($( '#' + barID ).attr( 'aria-valuenow' ));
    var duration = 0.01 * Math.abs(percent - oldPercent) * animateDuration;
    $( 'div [id=' + barID + ']' ).each(function() {
      if ($(this).css( 'display' ) == 'none') {
        $(this).css( 'width', percent + '%' );
      } else {
        $(this).animate({width: percent + '%' }, {duration: duration});
      }
      $(this).attr( 'aria-valuenow', percent);
    });
  }
}

// "Helper" functions
function playerHTML(playerObj, teamNum) {
  var name = playerObj.name;
  var maxHP = playerObj.hp;
  var currHP = playerObj.currHP;
  var Name = common.capFirst(name).replace( /-v$/, ', Veteran' )
  var id = teamNum + '_' + name;
  var currHPID = id + '_hp';
  var barID = id + '_bar';
  var barDef = 'class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="0" style="width: 0%;"';
  var barHTML = '<div class="progress hidden-xs"><div id="' + barID + '" ' + barDef + '></div></div>';
  var hLvl = 4;
  var textHTML = '<h' + hLvl + '>' + Name + ' &ndash; <span id="' + currHPID + '">' + currHP + '</span>/' + maxHP + '</h' + hLvl + '>';
  //var textHTML = Name + ' &ndash; <span id="' + currHPID + '">' + currHP + '</span>/' + maxHP;
  //return '<li class="list-group-item">' + textHTML + barHTML + '</li>';
  return '<li>' + textHTML + barHTML + '</li>';
};

// Socket.IO ons
socket.on( 'broadcastRosters', function(teamArr) {
  for (var i = 0; i < 2; i++) {
    sides[i] = JSON.parse(teamArr[i]);
  }
  populatePlayers(sides);
  for (var i = 0; i < 2; i++) {
    updatePlayersHP(sides[i], i);
  }
});

socket.on( 'onePlayerToClient', function(playerObj, currentPlayer, mode) {
  var teamNum = 1;
  if (mode == 'host') {
    teamNum = 0;
  }
  updatePlayerHP([playerObj], teamNum);
});
