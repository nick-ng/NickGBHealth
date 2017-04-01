var socket = io();

var play = {
  currentPlayer: true,
  currentPlayer: {},
  queryObj: null,
  gameID: null,
  teamList: [{},{}],
  animateDuration: 2000,
  cardFront: true,
  fullSyncPeriod: 10000,
  singleSends: 0,
  btnSize: '',
  percentHeights: [
    {selector:'.btn-player', height:0.1},
    {selector:'#quickHealth button', height:0.12, constant:0},
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
  populateHitPoints('init');
  if (play.queryObj.mode[0] != 'solo') {
    // If your opponent isn't using this app, don't track the score with this app.
    $( '#clockouts-controls' ).removeClass( 'hidden' );
    $( '#goals-controls' ).removeClass( 'hidden' );
    $( '#bodycounts-controls' ).removeClass( 'hidden' );
    $( '#score-row' ).removeClass( 'hidden' );
  }
  $( '#selectedPlayer' ).text( 'Ready' );
  hookFullscreenChange();
  displayCard();
  lastMinuteStyles();
  windowResized();
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
  var currHP = play.teamList[0].players[play.currentPlayer.num].currHP;
  changePlayerHP(currHP - 1, true);
});

$( '#minusTwo' ).click(function() {
  var currHP = play.teamList[0].players[play.currentPlayer.num].currHP;
  changePlayerHP(currHP - 2, true);
});

$( '#minusThree' ).click(function() {
  var currHP = play.teamList[0].players[play.currentPlayer.num].currHP;
  changePlayerHP(currHP - 3, true);
});

$( '#icySponge' ).click(function() {
  for (var i = 0; i < play.teamList[0].players[play.currentPlayer.num].sponge.length; i++) {
    if (play.teamList[0].players[play.currentPlayer.num].currHP < play.teamList[0].players[play.currentPlayer.num].sponge[i]) {
      changePlayerHP(play.teamList[0].players[play.currentPlayer.num].sponge[i], true);
      return
    }
  }
});

$( '#plusFour' ).click(function() {
  var currHP = play.teamList[0].players[play.currentPlayer.num].currHP;
  changePlayerHP(currHP + 4, true);
});

$( '#plusOne' ).click(function() {
  var currHP = play.teamList[0].players[play.currentPlayer.num].currHP;
  changePlayerHP(currHP + 1, true);
});

$( '.vp-btn' ).each(function() {
  $(this).click(function() {
    var $this = $(this);
    var thisName = $this.attr( 'name' );
    var $thisInput = $( '.vp-score[name=' + thisName + ']' );
    var currVal = parseInt($thisInput.val()) || 0;
    var thisVal = parseInt($this.val()) || 0;
    var newVal = currVal + thisVal;
    if (newVal >= 0) {
      $thisInput.val(newVal);
      countMyVPs(false);
    }
  })
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
function populateTeam(players, side) {
  var teamNum = 0;
  var $targetDiv = $( '#myPlayers0' );
  if (side == 'O') {
    $targetDiv = $( '#opponents0' );
    teamNum = 1;
  }
  $targetDiv.html( '' );
  var htmls = [];
  for (var i = 0; i < players.length; i++) {
    if (players[i].role == 'c') {
      common.specialPos.cap.HTML = playerButtonHTML(players, i, side);
    } else if (players[i].role == 'm') {
      common.specialPos.mas.HTML = playerButtonHTML(players, i, side);
    } else if (players[i].role != 'benched') {
      htmls.push(playerButtonHTML(players, i, side));
    }
  }
  htmls.sort();
  for (var i = 0; i < players.length; i++) {
    var hasPlayer = false;
    for (var j = 0; j < _.keys(common.specialPos).length; j++) {
      var key = _.keys(common.specialPos)[j];
      if (i == common.specialPos[key].id) {
        $targetDiv.append(common.specialPos[key].HTML);
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
      var html = '<button href="#" id="' + i + '" class="btn btn-default btn-hp ' + play.btnSize + ' text-center" type="button" disabled>'
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
    for (var i = 0; i < play.teamList[player.sideN].players[player.num].hp; i++) {
      $( '#healthBoxes #' + i).removeClass( 'hidden' );
    }
    for (var i = 0; i < play.teamList[player.sideN].players[player.num].currHP; i++) {
      $( '#healthBoxes #' + i).removeClass( 'active' );
    }
    if (play.teamList[player.sideN].players[player.num].sponge[0] == 0) {
      $( '#icySponge' ).prop( 'disabled', true);
    } else {
      for (var i = 0; i < play.teamList[player.sideN].players[player.num].sponge.length; i++) {
        var s = play.teamList[player.sideN].players[player.num].sponge[i] - 1;
        $( '#healthBoxes #' + s).removeClass( 'btn-default' );
        $( '#healthBoxes #' + s).addClass( 'btn-info' );
      }
    }
    changePlayerHP(play.teamList[player.sideN].players[player.num].currHP, false);
  }
  windowResized();
}

function lastMinuteStyles() {
  $( '#quickHealth button' ).each(function() {
    $(this).addClass( play.btnSize );
    $(this).prop( 'disabled', true);
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
        opponentText = 'Opp. ';
      }
      $( '#selectedPlayer' ).html(opponentText + player.Name + ' &ndash; <span id="selectedHP"></span>');
      play.currentPlayer = player;
      populateHitPoints(player);
      play.cardFront = true;
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
      var windowHeight = $(window).height();
      var windowWidth = $(window).width();
      $( '#makeFullscreen-div' ).addClass( 'hidden' );
      $( '#fullscreen-content' ).addClass( 'fullscreen-view' )
        .height(windowHeight).width(windowWidth - 10);
    } else if (common.fullscreenBehaviour == 'separate') {
      $( '#makeFullscreen-div' ).removeClass( 'hidden' );
      $( '#fullscreen-content' ).removeClass( 'fullscreen-view' )
        .css( 'height', '' ).css( 'width', '' );
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
    socket.emit( 'joinGame', play.queryObj.mode);
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
  populateTeam(play.teamList[0].players, 'M' );
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
  newHP = Math.min(newHP, play.teamList[sideN].players[num].hp);
  if (play.teamList[sideN].players[num].currHP == newHP) {
    // player's HP won't change so no point sending it to server.
    broadcast = false;
  } else {
    play.teamList[sideN].players[num].currHP = newHP; // This works becsue playerObj is a reference to the object that player/play.teamList[1][num] also refers to?
  }
  var selector = play.currentPlayer.id + '_hp';
  $( '#' + selector ).text(play.teamList[sideN].players[num].currHP);
  $( '#selectedHP' ).text(play.teamList[sideN].players[num].currHP + '/' + play.teamList[sideN].players[num].hp);
  if (play.queryObj.mode == 'solo') {
    Cookies.set( 'solo-mode', JSON.stringify(play.teamList[0]), {expires: 0.1});
    Cookies.set( 'resume-url', getResumeURL(), {expires: 0.1});
  } else if (broadcast && play.currentPlayer.side == 'M') {
    socket.emit( 'onePlayerToServer', play.teamList[sideN].players[num], play.currentPlayer, play.queryObj.mode);
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
   */
  if (('' + mode) !== ('' + play.queryObj.mode)) {
    theirID = theirCurrent.id.replace( 'M_', 'O_' );
    var hpSelector = '#' + theirID + '_hp';
    var oldHP = parseInt($(hpSelector).text());
    play.teamList[1].players[theirCurrent.num] = playerObj;
    var buttonSelector = 'button[id=' + theirID + ']';
    colourButtonLowHP(playerObj, buttonSelector);
    animateButtonBG(buttonSelector, oldHP, playerObj.currHP);
    $(hpSelector).text(playerObj.currHP);
    if (theirID == play.currentPlayer.id) {
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

function colourButtonLowHP(playerObj, buttonSelector) {
  if (play.queryObj.hpThreshold && (+playerObj.currHP <= +play.queryObj.hpThreshold[0])) {
    $(buttonSelector).addClass( 'btn-low-hp' );
  } else {
    $(buttonSelector).removeClass( 'btn-low-hp' );
  }
}

function toggleScoreButton($this, state) {
  if (state == 'on' ) {
    $this.addClass( 'btn-primary' )
      .removeClass( 'btn-default' );
  } else if (state == 'off' ) {
    $this.removeClass( 'btn-primary' )
      .addClass( 'btn-default' );
  } else {
    $this.toggleClass( 'btn-primary btn-default' );
    countMyVPs(false);
  }
}

function countMyVPs(dontBroadcast) {
  var myGoals = parseInt($( '#goals-scored' ).val()) || 0;
  var myBodys = parseInt($( '#bodycounts-scored' ).val()) || 0;
  var myClocks = parseInt($( '#clockouts-scored' ).val()) || 0;
  play.teamList[0].goals = myGoals;
  play.teamList[0].bodys = myBodys;
  play.teamList[0].clocks = myClocks;
  var scoreObj = {
    goals: myGoals,
    bodys: myBodys,
    clocks: myClocks
  };
  var myVPs = myGoals * 4 + myBodys * 2 + myClocks;
  $( '#my-score' ).text(myVPs);
  if ((!dontBroadcast) && (play.queryObj.mode[0] != 'solo')) {
    socket.emit( 'scoreToServer', scoreObj, play.queryObj.mode[0]);
  }
}

function updateMyVPs(scoreObj) {
  $( '#goals-scored' ).val(scoreObj.goals || 0);
  $( '#bodycounts-scored' ).val(scoreObj.bodys || 0);
  $( '#clockouts-scored' ).val(scoreObj.clocks || 0);
  countMyVPs(true); // true means dontbroadcast to server
}

function updateOppVPs(scoreObj) {
  var goals = (+scoreObj.goals) || 0;
  var oppScore = goals * 4;
  oppScore += (scoreObj.bodys * 2) || 0;
  oppScore += (+scoreObj.clocks) || 0;
  $( '#opp-score' ).text(oppScore + ' (G: ' + goals + ')' );
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
  var playerObject = playerList[playerNum];
  var name = playerList[playerNum].name;
  var maxHP = playerList[playerNum].hp;
  var currHP = playerList[playerNum].currHP;
  var Name = common.capFirst(name);
  if (Name.match( /-v$/ )) {
    Name = 'v' + Name.replace( /-v$/, '' );
  }
  if (Name.match( /-s$/ )) {
    Name = 's' + Name.replace( /-s$/, '' );
  }
  if (playerList[playerNum].role && playerList[playerNum].role.length === 1) {
    Name += ' (' + playerList[playerNum].role.toUpperCase() + ')';
  }
  var id = playerNum + side + '_' + name;
  var currHPID = id + '_hp';
  var colSize = 'col-xs-4';
  var html2 = '';
  if (playerObject.detach) {
    var name2 = playerObject.detach;
    //Name = 'Ava<span class="hidden-xs">risse</span><span class="visible-xs-inline">.</span>';
    colSize = 'col-xs-2';
    //var Name2 = 'Gre<span class="hidden-xs">ede</span><span class="visible-xs-inline">.</span>';
    var playerObject2 = common.findInArray(playerList, name2, 'name')
    var Name2 = common.capFirst(playerObject2.name);
    var playerNum2 = playerObject2.index;
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
  $( '#opponents0' ).removeClass( 'hidden' );
  play.teamList = updatePlayerLists(teamArr);
  if (play.teamList[0].players) {
    populateTeam(play.teamList[0].players, 'M' );
  }
  if (play.teamList[1].players) {
    populateTeam(play.teamList[1].players, 'O' );
    for (var i = 0; i < play.teamList[1].players.length; i++) {
      var theirID = i + 'O_' + play.teamList[1].players[i].name;
      var buttonSelector = 'button[id=' + theirID + ']';
      colourButtonLowHP(play.teamList[1].players[i], buttonSelector)
    }
  }
  hookPlayerButtons();
  updateMyVPs(play.teamList[0]);
  updateOppVPs(play.teamList[1]);
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

socket.on( 'scoreToClient', function(scoreObj, mode) {
  if (mode == play.queryObj.mode) {
    updateMyVPs(scoreObj);
  } else {
    updateOppVPs(scoreObj);
  }
});

socket.on( 'reconnect', function() {
  console.log( 'Reconnecting' );
  window.location.reload(true);
});
