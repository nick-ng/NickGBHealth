var socket = io();

var play = {
  currentPlayer: true,
  currentPlayer: {},
  queryObj: null,
  gameID: null,
  teamList: [[],[]],
  animateDuration: 2000,
  cardFront: true,
  fullSyncPeriod: 100,
  singleSends: 0,
  btnSize: '',
  percentHeights: [
    {selector:'.btn-player', height:0.115},
    {selector:'#quickHealth button', height:0.25, constant:-70},
    {selector:'.btn-hp', height:0.05, minHeight:function() {
      var ratio = 0.9;
      if (isBiggerThanPhone()) {
        ratio = 0.7;
      }
      return $('.btn-hp').width() * ratio
    }}
  ]
};

$(document).ready(function() {
  if (isBiggerThanPhone()) {
    play.btnSize = 'btn-tablet';
  }
  play.queryObj = common.parseQueryString();
  if (!play.queryObj.mode) {play.queryObj.mode = ['join']};
  play.gameID = location.pathname.replace( /^\/play\//, '' );
  common.loadSettings();
  applySettings();
  makePlayerList(common.allPlayers);
  setupGame();
  populateHitPoints('init')
  $( '#selectedPlayer' ).text( 'Ready' );
  hookFullscreenChange();
  displayCard();
  windowResized();
  lastMinuteStyles();
  Cookies.set( 'resume-url', getResumeURL(), {expires: 0.1});
});

// Static DOM events
$( '#makeFullscreen' ).click(function() {
  $( '#fullscreen-content' ).fullScreen(true);
});

$( '#soloReset' ).click(function() {
  Cookies.remove( 'solo-mode' );
  location.reload();
});

$( '#minusOne' ).click(function() {
  var currHP = play.teamList[0][play.currentPlayer.num].currHP;
  changePlayerHP(currHP - 1, true);
});

$( '#minusTwo' ).click(function() {
  var currHP = play.teamList[0][play.currentPlayer.num].currHP;
  changePlayerHP(currHP - 2, true);
});

$( '#minusThree' ).click(function() {
  var currHP = play.teamList[0][play.currentPlayer.num].currHP;
  changePlayerHP(currHP - 3, true);
});

$( '#icySponge' ).click(function() {
  for (var i = 0; i < play.teamList[0][play.currentPlayer.num].sponge.length; i++) {
    if (play.teamList[0][play.currentPlayer.num].currHP < play.teamList[0][play.currentPlayer.num].sponge[i]) {
      changePlayerHP(play.teamList[0][play.currentPlayer.num].sponge[i], true);
      return
    }
  }
});

$( '#plusFour' ).click(function() {
  var currHP = play.teamList[0][play.currentPlayer.num].currHP;
  changePlayerHP(currHP + 4, true);
});

$( '#plusOne' ).click(function() {
  var currHP = play.teamList[0][play.currentPlayer.num].currHP;
  changePlayerHP(currHP + 1, true);
});

$( '#playerCard' ).click(function() {
  if (play.cardFront) {
    play.cardFront = false;
  } else {
    play.cardFront = true;
  }
  displayCard(play.currentPlayer);
});

$(window).resize(windowResized);

// DOM generators
function populateTeam(side) {
  var teamNum = 0;
  var $targetDiv = $( '#myPlayers0' );
  if (side == 'O') {
    $targetDiv = $( '#opponents0' );
    teamNum = 1;
  }
  $targetDiv.html( '' );
  var htmls = [];
  for (var i = 0; i < play.teamList[teamNum].length; i++) {
    if (play.teamList[teamNum][i].role == 'c') {
      common.specialPos.cap.mHTML = playerButtonHTML(play.teamList[teamNum], i, side);
    } else if (play.teamList[teamNum][i].role == 'm') {
      common.specialPos.mas.mHTML = playerButtonHTML(play.teamList[teamNum], i, side);
    } else if (play.teamList[teamNum][i].role != 'benched') {
      htmls.push(playerButtonHTML(play.teamList[teamNum], i, side));
    }
  }
  htmls.sort();
  for (var i = 0; i < play.teamList[teamNum].length; i++) {
    var hasPlayer = false;
    for (var j = 0; j < _.keys(common.specialPos).length; j++) {
      var key = _.keys(common.specialPos)[j];
      if (i == common.specialPos[key].id) {
        $targetDiv.append(common.specialPos[key].mHTML);
        hasPlayer = true;
      }
    }
    if (!hasPlayer) {
      var tempHTML = htmls.shift();
      if (tempHTML) {
        $targetDiv.append(tempHTML);
      }
    }
  }
  windowResized();
}

function populateHitPoints(player) {
  if (player == 'init') {
    //$( '#healthBoxes' ).append('<div class="btn-group btn-group-justified" role="group">');
    for (var i = 0; i < common.mostHP; i++) {
      I = i + 1;
      var html = '<button href="#" id="' + i + '" class="btn btn-default btn-hp ' + play.btnSize + ' hidden text-center" type="button">'
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
    for (var i = 0; i < play.teamList[player.sideN][player.num].hp; i++) {
      $( '#healthBoxes #' + i).removeClass( 'hidden' );
    }
    for (var i = 0; i < play.teamList[player.sideN][player.num].currHP; i++) {
      $( '#healthBoxes #' + i).removeClass( 'active' );
    }
    if (play.teamList[player.sideN][player.num].sponge[0] == 0) {
      $( '#icySponge' ).prop( 'disabled', true);
    } else {
      for (var i = 0; i < play.teamList[player.sideN][player.num].sponge.length; i++) {
        var s = play.teamList[player.sideN][player.num].sponge[i] - 1;
        $( '#healthBoxes #' + s).removeClass( 'btn-default' );
        $( '#healthBoxes #' + s).addClass( 'btn-info' );
      }
    }
    changePlayerHP(play.teamList[player.sideN][player.num].currHP, false);
  }
  windowResized();
}

function lastMinuteStyles() {
  $( '#quickHealth button' ).each(function() {
    $(this).addClass( play.btnSize );
    //$(this).prop( 'disabled', true);
  });
  $( '#makeFullscreen' ).prop( 'disabled', false);
};

// Generated DOM events
function hookPlayerButtons() {
  $( 'button[role=player-buttons]' ).each(function () {
    $(this).off();
    $(this).click(function() {
      $(this).addClass( 'active' );
      var id = $(this).attr( 'id' );
      $( 'button[role=player-buttons]' ).each(function() {
        $(this).css( 'background-color', '' );
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
      play.currentPlayer = player;
      populateHitPoints(player);
      displayCard(player);
      if (!$(document).fullScreen() && (common.fullscreenBehaviour == 'player' )) {
        $( '#fullscreen-content' ).fullScreen(true);
      }
    });
  });
}

function hookHPButtons() {
  $( '#healthBoxes > button' ).each(function() {
    $(this).click(function() {
      var id = parseInt($(this).attr( 'id' ));
      var hp = id + 1;
      if ($(this).hasClass( 'active' )) {
        if (play.currentPlayer.side == 'M') {
          changePlayerHP(hp, true);
        }
      } else {
        if (play.currentPlayer.side == 'M') {
          changePlayerHP(hp - 1, true);
        }
      }
    });
  });
}

function hookFullscreenChange() {
  $(document).bind("fullscreenchange", function() {
    if ($(document).fullScreen()) {
      $( '#makeFullscreen-div' ).addClass( 'hidden' );
    } else if (common.fullscreenBehaviour == 'separate') {
      $( '#makeFullscreen-div' ).removeClass( 'hidden' );
    }
  });
}

// Normal functions
function setupGame() {
  if (play.gameID == 'demo') {
    socket.emit( 'joinRoom', 'demo' );
    $( '#gameID' ).text( 'Demonstration' );
    play.queryObj.hpThreshold = [6];
  } else if (play.queryObj.mode == 'solo') {
    soloSetup();
  } else {
    socket.emit( 'joinRoom', play.gameID );
    $( '#gameID' ).text( 'Game ID: ' + play.gameID);
    if (play.queryObj.mode == 'host') {
      socket.emit( 'joinGame', play.teamList[0], 'host' );
    } else if (play.queryObj.mode == 'join') {
      socket.emit( 'joinGame', play.teamList[0], 'join' );
    }
  }
}

function soloSetup() {
  $( '#opponents0' ).addClass( 'hidden' );
  $( '#soloHeader' ).removeClass( 'hidden' );
  // Try to load cookie.
  if (play.teamList[0].length >= 3) {
    Cookies.set( 'solo-mode', JSON.stringify(play.teamList[0]), {expires: 0.1});
    location.href = getResumeURL();
    return
  }
  play.teamList[0] = JSON.parse(Cookies.get( 'solo-mode' ));
  populateTeam( 'M' );
  hookPlayerButtons();
}

// This is now in game.js
function makePlayerList(allPlayers) {
  if (play.queryObj.players) {
    for (var i = 0; i < allPlayers.length; i++) {
      if (play.queryObj.players.indexOf(allPlayers[i].name) > -1) {
        allPlayers[i].currHP = allPlayers[i].hp;
        play.teamList[0].push(allPlayers[i]);
      }
    }
    // Check if Avarisse is a player.
    if (play.queryObj.players.indexOf( 'avarisse' ) > -1) {
      // Add the greede object to play.teamList[0].
      var greedeObj = common.findInArray(allPlayers, 'greede', 'name');
      greedeObj.currHP = greedeObj.hp;
      play.teamList[0].push(greedeObj);
    }
  }
}

function changePlayerHP(newHP, broadcast) {
  var num = play.currentPlayer.num;
  var sideN = play.currentPlayer.sideN;
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
  newHP = Math.min(newHP, play.teamList[sideN][num].hp);
  if (play.teamList[sideN][num].currHP == newHP) {
    // player's HP won't change so no point sending it to server.
    broadcast = false;
  } else {
    play.teamList[sideN][num].currHP = newHP; // This works becsue playerObj is a reference to the object that player/play.teamList[1][num] also refers to?
  }
  var selector = play.currentPlayer.id + '_hp';
  $( '#' + selector ).text(play.teamList[sideN][num].currHP);
  $( '#selectedHP' ).text(play.teamList[sideN][num].currHP + '/' + play.teamList[sideN][num].hp);
  if (play.queryObj.mode == 'solo') {
    Cookies.set( 'solo-mode', JSON.stringify(play.teamList[0]), {expires: 0.1});
    Cookies.set( 'resume-url', getResumeURL(), {expires: 0.1});
  } else if (broadcast && play.currentPlayer.side == 'M') {
    socket.emit( 'onePlayerToServer', play.teamList[sideN][num], play.currentPlayer, play.queryObj.mode);
    play.singleSends++
    play.singleSends = play.singleSends % play.fullSyncPeriod;
    if (play.singleSends == 0) {
      socket.emit( 'resyncRosterToServer', play.teamList[0], play.queryObj.mode);
    }
  }
}

function updateOpponentHP(playerObj, theirCurrent, mode) {
  /* play.queryObj.mode is a list with a single element.
   * Doing it this way lets us handle an undefined play.queryObj.mode
   */  var sameTeam = false; // Start with different.
  if (('' + mode) !== ('' + play.queryObj.mode)) {
    theirID = theirCurrent.id.replace( 'M_', 'O_' );
    var hpSelector = '#' + theirID + '_hp';
    var oldHP = parseInt($(hpSelector).text());
    play.teamList[1][theirCurrent.num] = playerObj;
    var buttonSelector = 'button[id=' + theirID + ']';
    animateButtonBG(buttonSelector, oldHP, playerObj.currHP);
    $(hpSelector).text(playerObj.currHP);
    if (theirID == play.currentPlayer.id) {
      changePlayerHP(playerObj.currHP, false);
    }
  }
}

function animateButtonBG(buttonSelector, oldHP, newHP) {
  if (play.queryObj.hpThreshold && (newHP <= play.queryObj.hpThreshold[0])) {
    $(buttonSelector).addClass( 'btn-low-hp' );
  } else {
    $(buttonSelector).removeClass( 'btn-low-hp' );
  }
  var originalBG = $(buttonSelector).css( 'background-color' );
  if (oldHP > newHP) {
    // animate lose hp
    $(buttonSelector).stop(true, true);
    $(buttonSelector).animate({backgroundColor: '#5cb85c'}); // green
    $(buttonSelector).animate({backgroundColor: originalBG}, {
      duration: play.animateDuration / 2,
      always: function() {
        $(buttonSelector).css( 'background-color', '' );
      }
    });
  } else if (oldHP < newHP) {
    // animate gain hp
    $(buttonSelector).stop(true, true);
    $(buttonSelector).animate({backgroundColor: '#d9534f'}); // red
    $(buttonSelector).animate({backgroundColor: originalBG}, {
      duration: play.animateDuration,
      always: function() {
        $(buttonSelector).css( 'background-color', '' );
      }
    });
  }
}

function displayCard(player) {
  var imageURL = '/cards/card-narwhal.gif';
  var imageURL2 = imageURL;
  if (player) {
    if ($( '#cardCol2' ).css( 'display' ) != 'none') {
      play.cardFront = true;
      imageURL2 = '/cards/' + player.name + '_b' + common.IMG_EXT;
      var imageTag = '<img src="' + imageURL2 + '" class="img-responsive center-block" alt="' + player.Name + '">';
      $( '#playerCard2' ).html(imageTag);
      $( '#cardPanel2' ).removeClass( 'hidden' );
    }
    imageURL = '/cards/' + player.name + '_';
    if (play.cardFront) {
      imageURL += 'f' + common.IMG_EXT;
    } else {
      imageURL += 'b' + common.IMG_EXT;
    }
    if ($( '#cardCol' ).css( 'display' ) != 'none') {
      var imageTag = '<img src="' + imageURL + '" class="img-responsive center-block" alt="' + player.Name + '">';
      $( '#playerCard' ).html(imageTag);
      $( '#cardPanel' ).removeClass( 'hidden' );
    }
  }
}

function applySettings() {
  if (common.fullscreenBehaviour == 'separate') {
    $( '#makeFullscreen-div' ).removeClass( 'hidden' );
  }
}

function updatePlayerLists(teamArr) {
  var teamLists = [];
  if (play.queryObj.mode == 'host') {
    teamLists[0] = JSON.parse(teamArr[0]);
    teamLists[1] = JSON.parse(teamArr[1]);
  } else {
    teamLists[0] = JSON.parse(teamArr[1]);
    teamLists[1] = JSON.parse(teamArr[0]);
  }
  return teamLists;
}

function windowResized() {
  var windowHeight = $(window).height();
  for (var i = 0; i < play.percentHeights.length; i++) {
    var pixels = play.percentHeights[i].height * windowHeight + (play.percentHeights[i].constant || 0);
    var maxHeight = play.percentHeights[i].minHeight || 0;
    if (typeof maxHeight == 'function') {
      maxHeight = maxHeight();
    }
    $(play.percentHeights[i].selector).each(function() {
      $(this).css( 'height', '' );
      maxHeight = Math.max(maxHeight, $(this).height());
    });
    $(play.percentHeights[i].selector).height(Math.max(maxHeight, pixels));
  }
}

// "Helper" functions
function playerButtonHTML(playerList, playerNum, side) {
  side = side.toUpperCase() || 'M';
  var name = playerList[playerNum].name;
  var maxHP = playerList[playerNum].hp;
  var currHP = playerList[playerNum].currHP;
  var Name = common.capFirst(name);
  if (Name.match( /-v$/ )) {
    Name = 'v' + Name.replace( /-v$/, '' );
  }
  if (playerList[playerNum].role) {
    Name += ' (' + playerList[playerNum].role.toUpperCase() + ')';
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
    var name2 = playerList[playerNum2].name;
    var maxHP2 = playerList[playerNum2].hp;
    var currHP2 = playerList[playerNum2].currHP;
    var id2 = playerNum2 + side + '_' + name2
    var currHPID2 = id2 + '_hp';
    html2 = '<button id="' + id2 + '" role="player-buttons" class="btn btn-default ' + play.btnSize +' btn-player ' + colSize + ' text-center" type="button">';
    html2 += Name2 + '<br><span id="' + currHPID2 + '" class="hp-text">' + currHP2 + '</span>/' + maxHP2 + '</button>';
  }
  var html = '<button name="' + name + '" id="' + id + '" role="player-buttons" class="btn btn-default ' + play.btnSize +' btn-player ' + colSize + ' text-center" type="button">';
  html += Name + '<br><span id="' + currHPID + '" class="hp-text">' + currHP + '</span>/' + maxHP + '</button>';
  return html + html2;
}

function idParser(idString) {
  var player = {};
  player.id = idString;
  player.name = idString.replace( /^\d{1}[MO]{1}_/, '' );
  player.Name = common.capFirst(player.name).replace( /-v$/, ', Veteran' );
  player.side = idString.match( /[MO]/ )[0];
  player.sideN = 1;
  if (player.side == 'M') {
    player.sideN = 0;
  }
  player.num = parseInt(idString.match( /\d/ )[0]);
  return player
}

function isBiggerThanPhone() {
  return $( '#cardCol' ).css( 'display' ) != 'none';
}

function getResumeURL() {
  var resumeURL = location.origin + location.pathname + '?';
  for (var i = 0; i < _.keys(play.queryObj).length; i++) {
    var key = _.keys(play.queryObj)[i];
    console.log(key)
    if (key != 'players') {
      for (var j = 0; j < play.queryObj[key].length; j++) {
        resumeURL += key + '=' + play.queryObj[key][j] + '&';
      }
    }
  }
  return resumeURL
}

// Socket.IO ons
socket.on( 'broadcastRosters', function(teamArr) {
  /*
  if (play.queryObj.players && (play.teamList[0].length > 3)) {
    location.href = getResumeURL();
    return
  }
  */
  $( '#opponents0' ).removeClass( 'hidden' );
  play.teamList = updatePlayerLists(teamArr);
  if (play.teamList[0].length > 3) {
    populateTeam( 'M' );
  }
  if (play.teamList[1].length > 3) {
    populateTeam( 'O' );
  }
  hookPlayerButtons();
});

socket.on( 'resyncRosterToClient', function(teamArr) {
  updatePlayerLists(teamArr);
  // Should only need to update opponent players.
  for (var i = 0; i < play.teamList[1].length; i++) {
    theirCurrent = {};
    theirCurrent.id = i + 'O_' + play.teamList[1][i].name;
    theirCurrent.name = play.teamList[1][i].name;
    theirCurrent.num = i;
    theirCurrent.side = 'O';
    theirCurrent.Name = 'Please Fix';
    updateOpponentHP(play.teamList[1][i], theirCurrent);
  }
});

socket.on( 'onePlayerToClient', updateOpponentHP);

socket.on( 'reconnect', function() {
  console.log( 'Reconnecting' );
  window.location.reload(true);
});
