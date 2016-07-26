var socket = io();
var queryObj;
var gameID;
var sides = [{},{}];
var animateDuration = 2000;

$(document).ready(function() {
  queryObj = common.parseQueryString();
  gameID = location.pathname.replace( /^\/spec\//, '' );
  joinGame(gameID);
  windowResized()
  lastMinuteStyles();
}); // $( document ).ready(function() {

// Static DOM events
$(window).resize(windowResized);

// DOM generators
function populatePlayers(sidesIn) {
  console.log(sidesIn);
  for (var teamNum = 0; teamNum < sidesIn.length; teamNum++) {
    if (sidesIn[teamNum].players) {
      var teamGuild = false;
      var captainHTML = '';
      var mascotHTML = '';
      var playersHTML = [ '', '' ];
      var playerList = sidesIn[teamNum].players;
      for (var i = 0; i < playerList.length; i++) {
        var playerObj = playerList[i];
        if (playerObj.role == 'c') {
          captainHTML = playerHTML(playerObj, teamNum);
          teamGuild = getGuildFromCaptain(playerObj);
        } else if (playerObj.role == 'm') {
          mascotHTML = playerHTML(playerObj, teamNum);
        } else {
          var onePlayerHTML = playerHTML(playerObj, teamNum);
          for (var j = 0; j < playersHTML.length; j++) {
            playersHTML[j] += onePlayerHTML[j];
          }
        }
      }
      $( 'div [class=content-' + teamNum + ']' ).each(function() {
        var forRightSide = ($(this).parent( 'div' )).hasClass( 'right-side' );
        var sideNum = forRightSide ? 1 : 0;
        console.log(sideNum);
        $(this).html('<ul class="list-unstyled">' + captainHTML[sideNum] + mascotHTML[sideNum] + playersHTML[sideNum] + '</ul>');
      });
      if (teamGuild) {
        $( 'div [class=guild-' + teamNum + ']' ).each(function() {
          $(this).text(common.capFirst(teamGuild));
        });
      }
    }
  }
  $( '.right-side .progress-bar' ).each(function() {
    $(this).addClass( 'pull-right' );
  });
}

function lastMinuteStyles() {
  $( '.right-side.team-display' ).each(function() {
    $(this).addClass('text-right');
  });
}

// Generated DOM events
$( '#swap' ).each(function() {
  $(this).click(function() {
    $( 'div.team-display' ).each(function() {
      $(this).toggleClass( 'hidden' );
    });
  });
})

// Normal functions
function joinGame(id) {
  socket.emit( 'joinRoom', id );
  socket.emit( 'joinGame', 'spec' );
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
  if (playerList) {
    for (var i = 0; i < playerList.length; i++) {
      var playerObj = playerList[i];
      var percent = 100 * (playerObj.currHP / playerObj.hp);
      var hpID = teamNum + '_' + playerObj.name + '_hp';
      var barID = teamNum + '_' + playerObj.name + '_bar';
      var oldPercent = parseInt($( '#' + barID ).attr( 'aria-valuenow' ));
      var duration = 0.01 * Math.abs(percent - oldPercent) * animateDuration;
      $( 'div [id=' + barID + ']' ).each(function() {
        animateHealthBars(this, percent, duration);
        $(this).attr( 'aria-valuenow', percent);
      });
      $( 'span[id=' + hpID + ']' ).each(function() {
        $(this).text(playerObj.currHP);
      });
    }
  }
}

function animateHealthBars(selector, percent, duration) {
  if ($(selector).css( 'display' ) == 'none') {
    $(selector).css( 'width', percent + '%' );
  } else {
    var properties = {
      width: percent + '%',
      backgroundColor: colourHealthBars(percent)};
    var options = {
      //easing: 'linear',
      duration: duration};
    $(selector).animate(properties, options);
  }
}

function updateVPs(scoreObj, sideNum) {
  var totalVPs = scoreObj.goals * 4 + scoreObj.bodys * 2 + +scoreObj.clocks;
  $( '.score-' + sideNum).each(function() {
    console.log('h');
    $(this).text(totalVPs);
  });
  $( '.goals-' + sideNum).each(function() {
    $(this).text(scoreObj.goals);
  });
  $( '.bodys-' + sideNum).each(function() {
    $(this).text(scoreObj.bodys);
  });
}

function colourHealthBars(percent) {
  if (percent <= 25) {
    return '#d9534f';
  } else if (percent <= 50) {
    return '#f0ad4e';
  } else {
    return '#5cb85c';
  }
}

function windowResized() {
  var h0 = $( '#default-0' ).height();
  var h1 = $( '#default-1' ).height();
  var w0 = $( '#default-0' ).width();
  var w1 = $( '#default-1' ).width();
  $( '#element-dimensions' ).html( 'w' + w0 + ', h' + h0 +
    ' / w' + w1 + ', h' + h1 + '<br>' +
    'Difference in height: ' + Math.abs(h0-h1));
  var ww = $(window).width();
  var hw = $(window).height();
  $( '#window-dimensions' ).html( 'Window: w' + ww + ', h' + hw);
}

// "Helper" functions
function playerHTML(playerObj, teamNum) {
  var name = playerObj.name;
  var maxHP = playerObj.hp;
  var currHP = playerObj.currHP;
  var percent = 100. * currHP / maxHP;
  var Name = common.capFirst(name).replace( /-v$/, ', Veteran' )
  var id = teamNum + '_' + name;
  var currHPID = id + '_hp';
  var barID = id + '_bar';
  var barDef = 'class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + percent + '" style="width: ' + percent + '%;"';
  var barHTML = '<div class="progress hidden-xs!"><div id="' + barID + '" ' + barDef + '></div></div>';
  //var barHTML = '<div class="progress hidden-xs"><div id="' + barID + '" ' + barDef + '><strong><span id="' + currHPID + '">' + currHP + '</span></strong></div></div>';
  var hLvl = 4;
  var textHTML = '<h' + hLvl + '>' + Name + ' &ndash; <span id="' + currHPID + '">' + currHP + '</span>/' + maxHP + '</h' + hLvl + '>';
  var textHTMLr = '<h' + hLvl + '><span id="' + currHPID + '">' + currHP + '</span>/' + maxHP + ' &ndash; ' + Name + '</h' + hLvl + '>';
  //var textHTML = '<h' + hLvl + '>' + Name + '</h' + hLvl + '>';
  return [ '<li>' + textHTML + barHTML + '</li>', '<li>' + textHTMLr + barHTML + '</li>' ];
};

// Socket.IO ons
socket.on( 'broadcastRosters', function(teamArr) {
  for (var i = 0; i < 2; i++) {
    sides[i] = JSON.parse(teamArr[i]);
    sides[i].players = _.sortBy(sides[i].players, 'name' );
  }
  populatePlayers(sides);
  for (var i = 0; i < 2; i++) {
    updatePlayersHP(sides[i].players, i);
    updateVPs(sides[i], i)
  }
  windowResized()
});

socket.on( 'onePlayerToClient', function(playerObj, currentPlayer, mode) {
  var teamNum = 1;
  if (mode == 'host') {
    teamNum = 0;
  }
  updatePlayersHP([playerObj], teamNum);
});

socket.on( 'scoreToClient', function(scoreObj, mode) {
  if (mode == 'host') {
    updateVPs(scoreObj, 0);
  } else if (mode == 'join') {
    updateVPs(scoreObj, 1);
  }
});
