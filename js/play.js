var IMG_EXT = '.jpg';
var havePermissionToDisplayCards = false;

var socket = io();
var currentPlayer = {};
var queryObj;
var gameID;
var teamList = [[],[]];
var animateDuration = 2000;
var cardFront = true;
var fullSyncPeriod = 100;
var singleSends = 0;
var btnSize = '';
var percentHeights = [
  {selector:'.btn-player', height:0.115},
  {selector:'#quickHealth button', height:0.25, constant:-70},
  {selector:'.btn-hp', height:0.05, minHeight:function() {
    var ratio = 0.9;
    if (isBiggerThanPhone()) {
      ratio = 0.7;
    }
    return $('.btn-hp').width() * ratio}},
];
var specialPos = {
  cap:{id:0, Name:'Captain'},
  mas:{id:1, Name:'Mascot'}
};

$(document).ready(function() {
  if (isBiggerThanPhone()) {
    btnSize = 'btn-tablet';
  }
  queryObj = common.parseQueryString();
  if (!queryObj.mode) {queryObj.mode = ['join']};
  gameID = location.pathname.replace( /^\/play\//, '' );
  common.loadSettings();
  makePlayerList(common.allPlayers);
  setupGame();
  populateHitPoints('init')
  $( '#selectedPlayer' ).text( 'Ready' );
  hookFullscreenChange();
  displayCard();
  windowResized();
  lastMinuteStyles();
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
  var currHP = teamList[0][currentPlayer.num].currHP;
  changePlayerHP(currHP - 1, true);
});

$( '#minusTwo' ).click(function() {
  var currHP = teamList[0][currentPlayer.num].currHP;
  changePlayerHP(currHP - 2, true);
});

$( '#minusThree' ).click(function() {
  var currHP = teamList[0][currentPlayer.num].currHP;
  changePlayerHP(currHP - 3, true);
});

$( '#icySponge' ).click(function() {
  for (var i = 0; i < teamList[0][currentPlayer.num].sponge.length; i++) {
    if (teamList[0][currentPlayer.num].currHP < teamList[0][currentPlayer.num].sponge[i]) {
      changePlayerHP(teamList[0][currentPlayer.num].sponge[i], true);
      return
    }
  }
});

$( '#plusFour' ).click(function() {
  var currHP = teamList[0][currentPlayer.num].currHP;
  changePlayerHP(currHP + 4, true);
});

$( '#plusOne' ).click(function() {
  var currHP = teamList[0][currentPlayer.num].currHP;
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
  for (var i = 0; i < teamList[teamNum].length; i++) {
    if (teamList[teamNum][i].role == 'c') {
      specialPos.cap.mHTML = playerButtonHTML(teamList[teamNum], i, side);
    } else if (teamList[teamNum][i].role == 'm') {
      specialPos.mas.mHTML = playerButtonHTML(teamList[teamNum], i, side);
    } else if (teamList[teamNum][i].role != 'benched') {
      htmls.push(playerButtonHTML(teamList[teamNum], i, side));
    }
  }
  for (var i = 0; i < teamList[teamNum].length; i++) {
    var hasPlayer = false;
    for (var j = 0; j < _.keys(specialPos).length; j++) {
      var key = _.keys(specialPos)[j];
      if (i == specialPos[key].id) {
        $targetDiv.append(specialPos[key].mHTML);
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
      var html = '<button href="#" id="' + i + '" class="btn btn-default btn-hp ' + btnSize + ' hidden text-center" type="button">'
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
    for (var i = 0; i < teamList[player.sideN][player.num].hp; i++) {
      $( '#healthBoxes #' + i).removeClass( 'hidden' );
    }
    for (var i = 0; i < teamList[player.sideN][player.num].currHP; i++) {
      $( '#healthBoxes #' + i).removeClass( 'active' );
    }
    if (teamList[player.sideN][player.num].sponge.length == 0) {
      $( '#icySponge' ).prop( 'disabled', true);
    } else {
      for (var i = 0; i < teamList[player.sideN][player.num].sponge.length; i++) {
        var s = teamList[player.sideN][player.num].sponge[i] - 1;
        $( '#healthBoxes #' + s).removeClass( 'btn-default' );
        $( '#healthBoxes #' + s).addClass( 'btn-info' );
      }
    }
    changePlayerHP(teamList[player.sideN][player.num].currHP, false);
  }
  windowResized();
}

function lastMinuteStyles() {
  $( '#quickHealth button' ).each(function() {
    $(this).addClass( btnSize );
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
      currentPlayer = player;
      populateHitPoints(player);
      displayCard(player);
    });
  });
}

function hookHPButtons() {
  $( '#healthBoxes > button' ).each(function() {
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

function hookFullscreenChange() {
  $(document).bind("fullscreenchange", function() {
    if ($(document).fullScreen()) {
      $( '#makeFullscreen-div' ).addClass( 'hidden' );
    } else {
      $( '#makeFullscreen-div' ).removeClass( 'hidden' );
    }
  });
}

// Normal functions
function setupGame() {
  if (gameID == 'demo') {
    socket.emit( 'joinRoom', 'demo' );
    $( '#gameID' ).text( 'Demonstration' );
    queryObj.hpThreshold = [6];
  } else if (queryObj.mode == 'solo') {
    soloSetup();
  } else {
    socket.emit( 'joinRoom', gameID );
    $( '#gameID' ).text( 'Game ID: ' + gameID);
    if (queryObj.mode == 'host') {
      socket.emit( 'joinGame', teamList[0], 'host' );
    } else if (queryObj.mode == 'join') {
      socket.emit( 'joinGame', teamList[0], 'join' );
    }
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
    if (teamList[0].length == cookieList.length) {
      sameTeam = true; // might be the same...
      // check if they have the same players.
      for (var i = 0; i < teamList[0].length; i++) {
        if (teamList[0][i].name != cookieList[i].name) {
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
  populateTeam( 'M' );
  hookPlayerButtons();
}

function makePlayerList(allPlayers) {
  if (queryObj.players) {
    for (var i = 0; i < allPlayers.length; i++) {
      if (queryObj.players.indexOf(allPlayers[i].name) > -1) {
        allPlayers[i].currHP = allPlayers[i].hp;
        teamList[0].push(allPlayers[i]);
      }
    }
    // Check if Avarisse is a player.
    if (queryObj.players.indexOf( 'avarisse' ) > -1) {
      // Add the greede object to teamList[0].
      var greedeObj = common.findInArray(allPlayers, 'greede', 'name');
      greedeObj.currHP = greedeObj.hp;
      teamList[0].push(greedeObj);
    }
  }
}

function changePlayerHP(newHP, broadcast) {
  var num = currentPlayer.num;
  var sideN = currentPlayer.sideN;
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
  newHP = Math.min(newHP, teamList[sideN][num].hp);
  if (teamList[sideN][num].currHP == newHP) {
    // player's HP won't change so no point sending it to server.
    broadcast = false;
  } else {
    teamList[sideN][num].currHP = newHP; // This works becsue playerObj is a reference to the object that player/teamList[1][num] also refers to?
  }
  var selector = currentPlayer.id + '_hp';
  $( '#' + selector ).text(teamList[sideN][num].currHP);
  $( '#selectedHP' ).text(teamList[sideN][num].currHP + '/' + teamList[sideN][num].hp);
  if (queryObj.mode == 'solo') {
    Cookies.set( 'resume-url', location.href, {expires: 0.084});
    Cookies.set( 'solo-mode', JSON.stringify(teamList[0]), {expires: 0.084});
  } else if (broadcast && currentPlayer.side == 'M') {
    socket.emit( 'onePlayerToServer', teamList[sideN][num], currentPlayer, queryObj.mode);
    singleSends++
    singleSends = singleSends % fullSyncPeriod;
    if (singleSends == 0) {
      socket.emit( 'resyncRosterToServer', teamList[0], queryObj.mode);
    }
  }
}

function updateOpponentHP(playerObj, theirCurrent, mode) {
  /* queryObj.mode is a list with a single element.
   * Doing it this way lets us handle an undefined queryObj.mode
   */
  if (('' + mode) !== ('' + queryObj.mode)) {
    theirID = theirCurrent.id.replace( 'M_', 'O_' );
    var hpSelector = '#' + theirID + '_hp';
    var oldHP = parseInt($(hpSelector).text());
    teamList[1][theirCurrent.num] = playerObj;
    var buttonSelector = 'button[id=' + theirID + ']';
    animateButtonBG(buttonSelector, oldHP, playerObj.currHP);
    $(hpSelector).text(playerObj.currHP);
    if (theirID == currentPlayer.id) {
      changePlayerHP(playerObj.currHP, false);
    }
  }
}

function animateButtonBG(buttonSelector, oldHP, newHP) {
  if (queryObj.hpThreshold && (newHP <= queryObj.hpThreshold[0])) {
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
      duration: animateDuration / 2,
      always: function() {
        $(buttonSelector).css( 'background-color', '' );
      }
    });
  } else if (oldHP < newHP) {
    // animate gain hp
    $(buttonSelector).stop(true, true);
    $(buttonSelector).animate({backgroundColor: '#d9534f'}); // red
    $(buttonSelector).animate({backgroundColor: originalBG}, {
      duration: animateDuration,
      always: function() {
        $(buttonSelector).css( 'background-color', '' );
      }
    });
  }
  
}

function displayCard(player) {
  var imageURL = '/cards/card-narwal.gif';
  var imageURL2 = imageURL;
  if (player && (havePermissionToDisplayCards || Cookies.get( 'test-cards' ))) {
    if ($( '#cardCol2' ).css( 'display' ) != 'none') {
      imageURL2 = '/cards/' + player.name + '_b' + IMG_EXT;
      cardFront = true;
    }
    imageURL = '/cards/' + player.name + '_';
    if (cardFront) {
      imageURL += 'f' + IMG_EXT;
    } else {
      imageURL += 'b' + IMG_EXT;
    }
  } else {
    player = {Name:'Nick\'s Guild Ball Health Tracker'};
  }
  if (havePermissionToDisplayCards || Cookies.get( 'test-cards' )) {
    if ($( '#cardCol2' ).css( 'display' ) != 'none') {
      var imageTag = '<img src="' + imageURL2 + '" class="img-responsive center-block" alt="' + player.Name + '">';
      $( '#playerCard2' ).html(imageTag);
      $( '#cardPanel2' ).removeClass( 'hidden' );
    }
    if ($( '#cardCol' ).css( 'display' ) != 'none') {
      var imageTag = '<img src="' + imageURL + '" class="img-responsive center-block" alt="' + player.Name + '">';
      $( '#playerCard' ).html(imageTag);
      $( '#cardPanel' ).removeClass( 'hidden' );
    }
  }
}

function isBiggerThanPhone() {
  return $( '#cardCol' ).css( 'display' ) != 'none';
}

function updatePlayerLists(teamArr) {
  if (queryObj.mode == 'host') {
    teamList[0] = JSON.parse(teamArr[0]);
    teamList[1] = JSON.parse(teamArr[1]);
  } else {
    teamList[0] = JSON.parse(teamArr[1]);
    teamList[1] = JSON.parse(teamArr[0]);
  }
}

function windowResized() {
  var windowHeight = $(window).height();
  for (var i = 0; i < percentHeights.length; i++) {
    var pixels = percentHeights[i].height * windowHeight + (percentHeights[i].constant || 0);
    var maxHeight = percentHeights[i].minHeight || 0;
    if (typeof maxHeight == 'function') {
      maxHeight = maxHeight();
    }
    $(percentHeights[i].selector).each(function() {
      $(this).css( 'height', '' );
      maxHeight = Math.max(maxHeight, $(this).height());
    });
    $(percentHeights[i].selector).height(Math.max(maxHeight, pixels));
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
    html2 = '<button id="' + id2 + '" role="player-buttons" class="btn btn-default ' + btnSize +' btn-player ' + colSize + ' text-center" type="button">';
    html2 += Name2 + '<br><span id="' + currHPID2 + '" class="hp-text">' + currHP2 + '</span>/' + maxHP2 + '</button>';
  }
  var html = '<button id="' + id + '" role="player-buttons" class="btn btn-default ' + btnSize +' btn-player ' + colSize + ' text-center" type="button">';
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

// Socket.IO ons
socket.on( 'broadcastRosters', function(teamArr) {
  if (queryObj.players && (teamList[0].length > 3)) {
    var newURL = location.origin + location.pathname
    newURL += '?mode=' + queryObj.mode;
    newURL += '&hpThreshold=' + queryObj.hpThreshold;
    Cookies.set( 'resume-url', newURL, {expires: 0.1});
    location.href = newURL;
    return
  }
  $( '#opponents0' ).removeClass( 'hidden' );
  updatePlayerLists(teamArr);
  if (teamList[0].length > 3) {
    populateTeam( 'M' );
  }
  if (teamList[1].length > 3) {
    populateTeam( 'O' );
  }
  hookPlayerButtons();
});

socket.on( 'resyncRosterToClient', function(teamArr) {
  updatePlayerLists(teamArr);
  // Should only need to update opponent players.
  for (var i = 0; i < teamList[1].length; i++) {
    theirCurrent = {};
    theirCurrent.id = i + 'O_' + teamList[1][i].name;
    theirCurrent.name = teamList[1][i].name;
    theirCurrent.num = i;
    theirCurrent.side = 'O';
    theirCurrent.Name = 'Please Fix';
    updateOpponentHP(teamList[1][i], theirCurrent);
  }
});

socket.on( 'onePlayerToClient', updateOpponentHP);

socket.on( 'reconnect', function() {
  console.log( 'Reconnecting' );
  window.location.reload(true);
});
