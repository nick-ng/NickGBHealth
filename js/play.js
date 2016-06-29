var IMG_EXT = '.jpg';
var havePermissionToDisplayCards = false;

var socket = io();
var currentPlayer = {};
var queryObj;
var gameID;
var playerList = [];
var opponentList = [];
var animateDuration = 2000;
var cardFront = true;
var fullSyncPeriod = 100;
var singleSends = 0;

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
$( '#soloReset' ).click(function() {
  Cookies.remove( 'solo-mode' );
  location.reload();
});

$( '#minusOne' ).click(function() {
  var currHP = playerList[currentPlayer.num].currHP;
  changePlayerHP(currHP - 1, true);
});

$( '#minusTwo' ).click(function() {
  var currHP = playerList[currentPlayer.num].currHP;
  changePlayerHP(currHP - 2, true);
});

$( '#minusThree' ).click(function() {
  var currHP = playerList[currentPlayer.num].currHP;
  changePlayerHP(currHP - 3, true);
});

$( '#icySponge' ).click(function() {
  var playerObj = playerList[currentPlayer.num];
  for (var i = 0; i < playerObj.sponge.length; i++) {
    if (playerObj.currHP < playerObj.sponge[i]) {
      changePlayerHP(playerObj.sponge[i], true);
      return
    }
  }
});

$( '#plusFour' ).click(function() {
  var currHP = playerList[currentPlayer.num].currHP;
  changePlayerHP(currHP + 4, true);
});

$( '#plusOne' ).click(function() {
  var currHP = playerList[currentPlayer.num].currHP;
  changePlayerHP(currHP + 1, true);
});

$( '#flipCard' ).click(function() {
  if (cardFront) {
    cardFront = false;
  } else {
    cardFront = true;
  }
  displayCard(currentPlayer);
});

// DOM generators
function populateMyTeam() {
  $( '#myPlayers0' ).html('');
  for (var i = 0; i < playerList.length; i++) {
    if (playerList[i].role != 'benched') {
      var html = playerButtonHTML(playerList, i, 'M' );
      $( '#myPlayers0' ).append(html);
    }
  }
}

function populateOpponentTeam() {
  $( '#opponents0' ).html('');
  for (var i = 0; i < opponentList.length; i++) {
    if (opponentList[i].role != 'benched') {
      var html = playerButtonHTML(opponentList, i, 'O' );
      $( '#opponents0' ).append(html);
    }
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
    $( '#quickHealth button' ).each(function() {
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
    if (playerObj.sponge.length == 0) {
      $( '#icySponge' ).prop( 'disabled', true);
    } else {
      for (var i = 0; i < playerObj.sponge.length; i++) {
        var s = playerObj.sponge[i] - 1;
        $( '#healthBoxes #' + s).removeClass( 'btn-default' );
        $( '#healthBoxes #' + s).addClass( 'btn-info' );
      }
    }
    changePlayerHP(playerObj.currHP, false);
  }
}

function lastMinuteStyles() {
  $( '#quickHealth > button' ).each(function() {
    $(this).addClass( 'btn-xs' );
    $(this).prop( 'disabled', true);
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
        $(this).removeAttr( 'style' );
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
      displayCard(player);
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
      } else {
        if (currentPlayer.side == 'M') {
          changePlayerHP(hp - 1, true);
        }
      }
    });
  });
}

// Normal functions
function setupGame() {
  if (queryObj.mode == 'solo') {
    soloSetup();
  } else if (queryObj.mode == 'host') {
    $( '#gameID' ).text( 'Game ID: ' + gameID);
    // Send information to the server.
    socket.emit( 'joinRoom', gameID );
    socket.emit( 'joinGame', playerList, 'host' );
  } else if (queryObj.mode == 'join') {
    $( '#gameID' ).text( 'Game ID: ' + gameID);
    // Send information to the server.
    socket.emit( 'joinRoom', gameID );
    socket.emit( 'joinGame', playerList, 'join' );
  }
}

function soloSetup() {
  $( '#opponents0' ).addClass( 'hidden' );
  $( '#soloHeader' ).removeClass( 'hidden' );
  // Try to load cookie.
  var playerCookie = Cookies.get( 'solo-mode' );
  // Check if the cookie has the same team as the one you're trying to load.
  var sameTeam = false; // Start with different.
  if (playerCookie) {
    cookieList = JSON.parse(playerCookie);
    if (playerList.length == cookieList.length) {
      sameTeam = true; // might be the same...
      // check if they have the same players.
      for (var i = 0; i < playerList.length; i++) {
        if (playerList[i].name != cookieList[i].name) {
          sameTeam = false;
          break
        }
      }
    }
  }
  if (sameTeam) {
    $( '#soloReset' ).removeClass( 'hidden' );
    //$( '#soloReset' ).removeAttr( 'disabled' );
  }
  populateMyTeam();
  hookPlayerButtons( '#myPlayers0' );
}

function makePlayerList(allPlayers) {
  if (queryObj.players) {
    for (var i = 0; i < allPlayers.length; i++) {
      if (queryObj.players.indexOf(allPlayers[i].name) > -1) {
        allPlayers[i].currHP = allPlayers[i].hp;
        playerList.push(allPlayers[i]);
      }
    }
    // Check if Avarisse is a player.
    if (queryObj.players.indexOf( 'avarisse' ) > -1) {
      // Add the greede object to playerList.
      var greedeObj = common.findInArray(allPlayers, 'greede', 'name');
      greedeObj.currHP = greedeObj.hp;
      playerList.push(greedeObj);
    }
  }
}

function changePlayerHP(newHP, broadcast) {
  var num = currentPlayer.num;
  var playerObj;
  if (currentPlayer.side == 'M') {
    playerObj = playerList[num];
  } else {
    playerObj = opponentList[num];
  }
  // colour buttons
  $( '#healthBoxes button' ).each(function() {
    var id = parseInt($(this).attr( 'id' ));
    if (id >= newHP) {
      $(this).addClass( 'active' );
    } else {
      $(this).removeClass( 'active' );
    }
  });
  newHP = Math.max(0, newHP);
  newHP = Math.min(newHP, playerObj.hp);
  if (playerObj.currHP == newHP) {
    // player's HP won't change so no point sending it to server.
    broadcast = false;
  } else {
    playerObj.currHP = newHP; // This works becsue playerObj is a reference to the object that player/opponentList[num] also refers to?
  }
  var selector = currentPlayer.id + '_hp';
  $( '#' + selector ).text(playerObj.currHP);
  $( '#selectedHP' ).text(playerObj.currHP + '/' + playerObj.hp);
  if (queryObj.mode == 'solo') {
    var newURL = location.origin + location.pathname + '?mode=' + queryObj.mode;
    Cookies.set( 'resume-url', newURL, {expires: 0.084});
    Cookies.set( 'solo-mode', JSON.stringify(playerList), {expires: 0.084});
  } else if (broadcast && currentPlayer.side == 'M') {
    socket.emit( 'onePlayerToServer', playerObj, currentPlayer, queryObj.mode);
    singleSends++
    singleSends = singleSends % fullSyncPeriod;
    console.log(singleSends);
    if (singleSends == 0) {
      socket.emit( 'resyncRosterToServer', playerList, queryObj.mode);
    }
  }
}

function updateOpponentHP(playerObj, theirCurrent, mode) {
  if (mode != queryObj.mode) {
    theirID = theirCurrent.id.replace( 'M_', 'O_' );
    var hpSelector = '#' + theirID + '_hp';
    var oldHP = parseInt($(hpSelector).text());
    opponentList[theirCurrent.num] = playerObj;
    var buttonSelector = 'button[id=' + theirID + ']';
    animateButtonBG(buttonSelector, oldHP, playerObj.currHP);
    $(hpSelector).text(playerObj.currHP);
    if (theirID == currentPlayer.id) {
      changePlayerHP(playerObj.currHP, false);
    }
  }
}

function animateButtonBG(buttonSelector, oldHP, newHP) {
  var originalBG = $(buttonSelector).css( 'background-color' );
  if (oldHP > newHP) {
    // animate lose hp
    $(buttonSelector).stop(true, true);
    $(buttonSelector).animate({backgroundColor: '#5cb85c'}); // green
    $(buttonSelector).animate({backgroundColor: originalBG}, {
      duration: animateDuration / 2,
      always: function() {
        $(buttonSelector).removeAttr( 'style' );
      }
    });
  } else if (oldHP < newHP) {
    // animate gain hp
    $(buttonSelector).stop(true, true);
    $(buttonSelector).animate({backgroundColor: '#d9534f'}); // red
    $(buttonSelector).animate({backgroundColor: originalBG}, {
      duration: animateDuration,
      always: function() {
        $(buttonSelector).removeAttr( 'style' );
      }
    });
  }
}

function displayCard(player) {
  if (havePermissionToDisplayCards || Cookies.get( 'test-cards' )) {
    if ($( '#cardCol2' ).css( 'display' ) != 'none') {
      var imageURL = '/cards/' + player.name + '_b' + IMG_EXT;
      cardFront = true;
      var imageTag = '<img src="' + imageURL + '" class="img-responsive center-block" alt="' + player.Name + '">';
      $( '#playerCard2' ).html(imageTag);
      $( '#cardPanel2' ).removeClass( 'hidden' );
    }
    if ($( '#cardCol' ).css( 'display' ) != 'none') {
      var imageURL = '/cards/' + player.name + '_';
      if (cardFront) {
        imageURL += 'f' + IMG_EXT;
      } else {
        imageURL += 'b' + IMG_EXT;
      }
      var imageTag = '<img src="' + imageURL + '" class="img-responsive center-block" alt="' + player.Name + '">';
      $( '#playerCard' ).html(imageTag);
      $( '#cardPanel' ).removeClass( 'hidden' );
    }
  }
};

function updatePlayerLists(teamArr) {
  console.log('updatePlayerLists');
  if (queryObj.mode == 'host') {
    playerList = JSON.parse(teamArr[0]);
    opponentList = JSON.parse(teamArr[1]);
  } else {
    playerList = JSON.parse(teamArr[1]);
    opponentList = JSON.parse(teamArr[0]);
  }
}

// "Helper" functions
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
  var colSize = 'col-xs-4';
  var html2 = '';
  if (name == 'avarisse') {
    //Name = 'Ava<span class="hidden-xs">risse</span><span class="visible-xs-inline">.</span>';
    Name = 'Avarisse';
    colSize = 'col-xs-2';
    //var Name2 = 'Gre<span class="hidden-xs">ede</span><span class="visible-xs-inline">.</span>';
    var Name2 = 'Greede';
    var playerNum2 = 6;
    var playerObj2 = playerList[playerNum2];
    var name2 = playerObj2.name;
    var maxHP2 = playerObj2.hp;
    var currHP2 = playerObj2.currHP;
    var id2 = playerNum2 + side + '_' + name2
    var currHPID2 = id2 + '_hp';
    html2 = '<button id="' + id2 + '" name="playerButtons" class="btn btn-default btn-xs btn-player ' + colSize + ' text-center" type="button">';
    html2 += Name2 + '<br><span id="' + currHPID2 + '">' + currHP2 + '</span>/' + maxHP2 + '</button>';
  }
  var html = '<button id="' + id + '" name="playerButtons" class="btn btn-default btn-xs btn-player ' + colSize + ' text-center" type="button">';
  html += Name + '<br><span id="' + currHPID + '">' + currHP + '</span>/' + maxHP + '</button>';
  return html + html2;
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
socket.on( 'broadcastRosters', function(teamArr) {
  if (queryObj.players && (playerList.length > 3)) {
    var newURL = location.origin + location.pathname + '?mode=' + queryObj.mode;
    Cookies.set( 'resume-url', newURL, {expires: 0.1});
    location.href = newURL;
    return
  }
  $( '#opponents0' ).removeClass( 'hidden' );
  updatePlayerLists(teamArr);
  if (playerList.length > 3) {
    populateMyTeam();
    hookPlayerButtons( '#myPlayers0' );
  }
  if (opponentList.length > 3) {
    populateOpponentTeam();
    hookPlayerButtons( '#opponents0' );
  }
});

socket.on( 'resyncRosterToClient', function(teamArr) {
  updatePlayerLists(teamArr);
  // Should only need to update opponent players.
  for (var i = 0; i < opponentList.length; i++) {
    var playerObj = opponentList[i]
    theirCurrent = {};
    theirCurrent.id = i + 'O_' + playerObj.name;
    theirCurrent.name = playerObj.name;
    theirCurrent.num = i;
    theirCurrent.side = 'O';
    theirCurrent.Name = 'Please Fix';
    updateOpponentHP(playerObj, theirCurrent);
  }
});

socket.on( 'onePlayerToClient', updateOpponentHP);

socket.on( 'reconnect', function() {
  console.log( 'Reconnecting' );
  window.location.reload(true);
});
