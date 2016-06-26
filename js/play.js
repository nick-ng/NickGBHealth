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
  $( '#myPlayers0' ).html('');
  for (var i = 0; i < playerList.length; i++) {
    var html = playerButtonHTML(playerList, i, 'M' );
    $( '#myPlayers0' ).append(html);
  }
}

function populateOpponentTeam() {
  $( '#opponents0' ).html('');
  for (var i = 0; i < opponentList.length; i++) {
    var html = playerButtonHTML(opponentList, i, 'O' );
    $( '#opponents0' ).append(html);
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
  } else {
    $( '#healthBoxes button' ).each(function() {
      $(this).addClass( 'active' ).addClass( 'hidden' );
      $(this).addClass( 'btn-default' ).removeClass( 'btn-info' );
      if (player.side == 'M') {
        $(this).prop( 'disabled', false);
      } else {
        $(this).prop( 'disabled', true);
      }
    });
    var playerObj;
    if (player.side == 'M') {
      playerObj = playerList[player.num];
    } else {
      playerObj = opponentList[player.num];
    }
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
  $( selector + ' button' ).each(function () {
    $(this).off();
    $(this).click(function() {
      $(this).addClass( 'active' );
      var id = $(this).attr( 'id' );
      $( 'button[name=playerButtons]' ).each(function() {
        console.log($(this).attr( 'id' ) + ($(this).attr( 'id' ) != id));
        if ($(this).attr( 'id' ) != id) {
          $(this).removeClass( 'active' );
        }
      });
      var player = idParser(id);
      var opponentText = '';
      if (player.side == 'O') {
        opponentText = 'Opponent ';
      }
      $( '#selectedPlayer' ).html(opponentText + player.Name + ' &ndash; <span id="selectedHP"></span>');
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
    socket.emit( 'joinGame', playerList, 'host' );
  } else if (queryObj.mode == 'join') {
    console.log('joining');
    $( '#gameID' ).text( 'Game ID: ' + gameID);
    // Send information to the server.
    socket.emit( 'joinRoom', gameID );
    socket.emit( 'joinGame', playerList, 'join' );
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
  //console.log(JSON.stringify(playerList));
}

function changePlayerHP(currHP, broadcast) {
  num = currentPlayer.num;
  playerList[num].currHP = currHP;
  var selector = currentPlayer.id + '_hp';
  $( '#' + selector ).text(currHP);
  $( '#selectedHP' ).text(currHP + '/' + playerList[num].hp);
  if (queryObj.mode == 'solo') {
    Cookies.set( 'solo-mode', JSON.stringify(playerList), {expires: 0.084});
  } else {
    socket.emit( 'onePlayerToServer', playerList[num], currentPlayer, queryObj.mode);
  }
}

function playerButtonHTML(playerList, playerNum, side) {
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
  var currHPID = id + '_hp';
  var html = '<button id="' + id + '" name="playerButtons" class="btn btn-default btn-xs btn-player col-xs-4 text-center" type="button">';
  html += Name + '<br><span id="' + currHPID + '">' + currHP + '</span>/' + maxHP + '</button>';
  return html
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
  //var radioName = 'radio_' + side;
  var radioName = 'radioPlayers'
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

socket.on( 'broadcastRosters', function(teamArr) {
  if (queryObj.mode == 'host') {
    console.log(teamArr[0]);
    console.log(teamArr[1]);
    playerList = JSON.parse(teamArr[0]);
    opponentList = JSON.parse(teamArr[1]);
  } else {
    playerList = JSON.parse(teamArr[1]);
    opponentList = JSON.parse(teamArr[0]);
  }
  if (playerList.length > 3) {
    populateMyTeam();
    hookPlayerButtons( '#myPlayers0' );
  }
  if (opponentList.length > 3) {
    populateOpponentTeam();
    hookPlayerButtons( '#opponents0' );
  }
});

socket.on( 'onePlayerToClient', function(playerObj, theirID) {
  theirID = theirID.replace( 'M_', 'O_' );
  var hpSelector = '#' + theirID + '_hp';
  console.log('their: ' + theirID + ', hpSel: ' + hpSelector);
  var oldHP = parseInt($(hpSelector).text());
  if (oldHP > playerObj.currHP) {
    // animate lose hp
  } else if (oldHP < playerObj.currHP) {
    // animate gain hp
  }
  $(hpSelector).text(playerObj.currHP);
});
