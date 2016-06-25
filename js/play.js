var socket = io();
var currentPlayer = {};

var playerList = [
  {name:'theron', hp:18, sponge:[6, 12], role:'c'},
  {name:'fahad', hp:8, sponge:[], role:'m'},
  {name:'chaska', hp:16, sponge:[6, 12]},
  {name:'egret', hp:12, sponge:[4, 8]},
  {name:'hearne', hp:20, sponge:[7, 14]},
  {name:'jaecar', hp:14, sponge:[5, 10]},
];

$(document).ready(function() {
  populateMyTeam();
  hookPlayerButtons( '#myPlayers0' );
  populateHitPoints('init')
}); // $( document ).ready(function() {

// Static DOM events

// DOM generators
function populateMyTeam() {
  for (var i = 0; i < playerList.length; i++) {
    playerList[i].currHP = playerList[i].hp - 2;
    var html = playerRadioHTML(playerList, i, 'm' );
    $( '#myPlayers0' ).append(html);
  }
}

function populateHitPoints(player) {
  if (player == 'init') {
    //$( '#healthBoxes' ).append('<div class="btn-group btn-group-justified" role="group">');
    for (var i = 0; i < common.mostHP; i++) {
      I = i + 1;
      var html = '<button href="#" id="' + i + '" class="btn btn-default btn-hp hidden" type="button">'
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

// Generated DOM events
function hookPlayerButtons(selector) {
  $( selector + ' input[type=radio]' ).each(function () {
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
function changePlayerHP(currHP, broadcast) {
  num = currentPlayer.num;
  playerList[num].currHP = currHP;
  var selector = currentPlayer.id + '_hp';
  $( '#' + selector ).text(currHP);
  $( '#selectedHP' ).text(currHP + '/' + playerList[num].hp);
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
  var html = '<label id="' + id + '" name="' + radioName + '" class="btn btn-default col-xs-4">';
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
