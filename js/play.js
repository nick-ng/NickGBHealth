var socket = io();
var currentPlayer = {};
var queryObj;
var gameID;
var playerList = [];
var opponentList = [];

/*
var playerList = [
  {name:'theron', hp:18, sponge:[6, 12], role:'c'},
  {name:'fahad', hp:8, sponge:[], role:'m'},
  {name:'chaska', hp:16, sponge:[6, 12]},
  {name:'egret', hp:12, sponge:[4, 8]},
  {name:'hearne', hp:20, sponge:[7, 14]},
  {name:'jaecar', hp:14, sponge:[5, 10]},
];
*/

$(document).ready(function() {
  queryObj = common.parseQueryString();
  gameID = location.pathname.replace( /^\/play\//, '' );
  makePlayerList(common.allPlayers);
  setupGame();
  populateHitPoints('init')
  $( '#selectedPlayer' ).text( 'Ready' );
  lastMinuteStyles();
}); // $( document ).ready(function() {

// Static DOM events

// DOM generators
function populateMyTeam() {
  for (var i = 0; i < playerList.length; i++) {
    var html = playerRadioHTML(playerList, i, 'm' );
    $( '#myPlayers0' ).append(html);
  }
}

function populateHitPoints(player) {
  if (player == 'init') {
    //$( '#healthBoxes' ).append('<div class="btn-group btn-group-justified" role="group">');
    for (var i = 0; i < common.mostHP; i++) {
      I = i + 1;
      var html = '<button href="#" id="' + i + '" class="btn btn-default btn-hp hidden text-center" type="button">'
      html += I + '</button>';
      if ((i % 10) == 9) {
        //html += '</div><div class=class="btn-group btn-group-justified" role="group">';
      }
      $( '#healthBoxes' ).append(html);
    }
    hookHPButtons();
    //$( '#healthBoxes' ).append('</div>');
  } else if (player.side == 'M') {
    $( '#healthBoxes button' ).each(function() {
      $(this).addClass( 'active' ).addClass( 'hidden' );
      $(this).addClass( 'btn-default' ).removeClass( 'btn-info' );
    });
    var playerObj = playerList[player.num];
    for (var i = 0; i < playerObj.hp; i++) {
      $( '#healthBoxes #' + i).removeClass( 'hidden' );
    }
    for (var i = 0; i < playerObj.currHP; i++) {
      $( '#healthBoxes #' + i).removeClass( 'active' );
    }
    for (var i = 0; i < playerObj.sponge.length; i++) {
      var s = playerObj.sponge[i] - 1;
      $( '#healthBoxes #' + s).removeClass( 'btn-default' );
      $( '#healthBoxes #' + s).addClass( 'btn-info' );
    }
    changePlayerHP(playerObj.currHP, false);
  }
}

function lastMinuteStyles() {
  $( '#quickHealth button' ).each(function() {
    $(this).addClass( 'btn-xs' );
  });
};

// Generated DOM events
function hookPlayerButtons(selector) {
  $( selector + ' input[type=radio]' ).each(function () {
    $(this).off();
    $(this).change(function() {
      var id = $(this).attr( 'id' );
      var player = idParser(id);
      $( '#selectedPlayer' ).html(player.Name + ' &ndash; <span id="selectedHP"></span>');
      currentPlayer = player;
      populateHitPoints(player);
    });
  });
}

function hookHPButtons() {
  $( '#healthBoxes button' ).each(function() {
    $(this).click(function() {
      var id = parseInt($(this).attr( 'id' ));
      var hp = id + 1;
      if ($(this).hasClass( 'active' )) {
        if (currentPlayer.side == 'M') {
          changePlayerHP(hp, true);
        }
        for (var i = 0; i <= id; i++) {
          $( '#healthBoxes #' + i).removeClass( 'active' );
        }
      } else {
        if (currentPlayer.side == 'M') {
          changePlayerHP(hp - 1, true);
        }
        for (var i = id; i < common.mostHP; i++) {
          $( '#healthBoxes #' + i).addClass( 'active' );
        }
      }
    });
  });
};

// Normal functions
function setupGame() {
  if (queryObj.mode == 'solo') {
    $( '#opponents0' ).addClass( 'hidden' );
    $( '#opponents1' ).addClass( 'hidden' );
    if (playerList.length < 3) {
      var playerCookie = Cookies.get( 'solo-mode' );
      playerList = JSON.parse(playerCookie);
    }
    populateMyTeam();
    hookPlayerButtons( '#myPlayers0' );
  } else if (queryObj.mode == 'host') {
    $( '#gameID' ).text( 'Game ID: ' + gameID);
    // Send information to the server.
    socket.emit( 'joinRoom', gameID );
    socket.emit( 'hostGame', playerList );
  } else if (queryObj.mode == 'join') {
    $( '#gameID' ).text( 'Game ID: ' + gameID);
    // Send information to the server.
    socket.emit( 'joinRoom', gameID );
  }
}

function makePlayerList(allPlayers) {
  if (queryObj.players) {
    for (var i = 0; i < allPlayers.length; i++) {
      if (queryObj.players.indexOf(allPlayers[i].name) > -1) {
        allPlayers[i].currHP = allPlayers[i].hp;
        playerList.push(allPlayers[i]);
      }
    }
  } else {
    // load playerList from database
  }
  console.log(JSON.stringify(playerList));
}

function changePlayerHP(currHP, broadcast) {
  num = currentPlayer.num;
  playerList[num].currHP = currHP;
  var selector = currentPlayer.id + '_hp';
  $( '#' + selector ).text(currHP);
  $( '#selectedHP' ).text(currHP + '/' + playerList[num].hp);
  if (queryObj.mode == 'solo') {
    Cookies.set( 'solo-mode', JSON.stringify(playerList), {expires: 0.084});
  }
}

function playerRadioHTML(playerList, playerNum, side) {
  side = side.toUpperCase() || 'M';
  var playerObj = playerList[playerNum];
  var name = playerObj.name;
  var maxHP = playerObj.hp;
  var currHP = playerObj.currHP;
  var Name = common.capFirst(name);
  if (Name.match( /-v$/ )) {
    Name = 'v' + Name.replace( /-v$/, '' );
  }
  var id = playerNum + side + '_' + name;
  var radioName = 'radio_' + side;
  var currHPID = id + '_hp';
  var html = '<label id="' + id + '" name="' + radioName + '" class="btn btn-default btn-xs btn-player col-xs-4">';
  html += '<input type="radio" name="' + radioName + '" id="' + id + '" class="text-center" autocomplete="off">';
  html += Name + '<br><span id="' + currHPID + '">' + currHP + '</span>/' + maxHP + '</label>';
  return html
}

function idParser(idString) {
  var player = {};
  player.id = idString;
  player.name = idString.replace( /^\d{1}[MO]{1}_/, '' );
  player.Name = common.capFirst(player.name).replace( /-v$/, ', Veteran' );
  player.side = idString.match( /[MO]/ )[0];
  player.num = parseInt(idString.match( /\d/ )[0]);
  return player
}

// Socket.IO ons
socket.on( 'testC', function(msg) {
  console.log(msg)
});

socket.on( 'getRosters', function(teamArr) {
  if (queryObj.mode == 'host') {
    playerList = JSON.parse(teamArr[0]);
    opponentList = JSON.parse(teamArr[1]);
  } else {
    playerList = JSON.parse(teamArr[1]);
    opponentList = JSON.parse(teamArr[0]);
  }
  populateMyTeam();
  hookPlayerButtons( '#myPlayers0' );
});
