var roster = {
  cardFront: true
}
var rosterID = 0;
var rosterSize = [0, 0];
var rosterStrings = ['', ''];
var rosters = [];

$(document).ready(function() {
  populateDOM();
  hookEvents();
  loadRoster();
}); // $( document ).ready(function() {

$( '#playerCard' ).click(function() {
  if (roster.cardFront) {
    roster.cardFront = false;
  } else {
    roster.cardFront = true;
  }
  displayCard($('#playerCard img').attr( 'alt' ));
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

function populateDOM() {
  for (var i = 0; i < common.allGuilds.length; i++) {
    var guildObj = common.allGuilds[i];
    var guildHTML = '<div id="' + guildObj.name + 'Players" class="hidden">';
    var selectorHTML = '<button value="' + guildObj.name + '" ' +
      'class="col-xs-4 btn btn-default" type="button">' +
      '<img src="/images/' + guildObj.name + '.png" ' +
      'alt="' + common.capFirst(guildObj.name) + '" class="img-responsive center-block"></button>';
    $( '#guildSelector' ).append(selectorHTML);
    var captainsHTML = '';
    var mascotsHTML = '';
    var playersHTML = '';
    var unionHTML = '';
    for (var j = 0; j < guildObj.players.length; j++) {
      var player = guildObj.players[j];
      if (player.role == 'c') {
        captainsHTML += common.playerButtonHTML(player.name, ' (C)' );
      } else if (player.role == 'm') {
        mascotsHTML += common.playerButtonHTML(player.name, ' (M)' );
      } else if (!player.role) {
        playersHTML += common.playerButtonHTML(player.name, '' );
      }
    }
    if (captainsHTML.length > 0) {
      captainsHTML = '<p id="captains">' + captainsHTML + '</p>';
    }
    if (mascotsHTML.length > 0) {
      mascotsHTML = '<p id="mascots">' + mascotsHTML + '</p>';
    }
    if (playersHTML.length > 0) {
      playersHTML = '<p id="players">' + playersHTML + '</p>';
    }
    if (guildObj.union.length > 0) {
      unionHTML += '<p id="union">';
      for (var j = 0; j < guildObj.union.length; j++) {
        unionHTML += common.playerButtonHTML(guildObj.union[j], '');
      };
      unionHTML += '</p>'
    }
    guildHTML += captainsHTML + mascotsHTML + playersHTML + unionHTML + '</div>';
    $( '#allPlayers' ).append(guildHTML);
  }
}

function hookEvents() {
  $( '#guildBack-butt' ).click(resetRosterManager);

  $( 'input[name=rosters]:radio' ).change(function() {
    resetRosterManager();
    loadRoster();
  });

  $( '#saveRosterButton' ).click(function() {
    cookieName = 'roster' + rosterID;
    rosters[rosterID].hpThreshold = $( '#low-health-threshold' ).val();
    Cookies.set( 'rosters', JSON.stringify(rosters), { expires: common.cookieExpiry });
    var rosterNumber = rosterID + 1;
    $( '#saveSuccessAlert' ).text( 'Roster ' + rosterNumber + ' saved.' );
    $( '#saveSuccessAlert' ).removeClass( 'hidden' );
  });

  $( '#guildSelector button' ).each(function() {
    $(this).click(function() {
      $( '#saveSuccessAlert' ).addClass( 'hidden' );
      var guild = $(this).val();
      hideAllPlayerSelectors()
      chooseGuild(guild);
    });
  });

  $( '#allPlayers button' ).each(function() {
    $(this).click(function() {
      $( '#saveSuccessAlert' ).addClass( 'hidden' );
      var player = $(this).val();
      roster.cardFront = true;
      displayCard(player);
      if ($(this).hasClass( 'btn-primary' )) {
        $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
        $(this).removeClass( 'active' );
        rosters[rosterID].players = _.without(rosters[rosterID].players, player);
      } else {
        $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
        $(this).addClass( 'active' );
        rosters[rosterID].players.push(player);
      };
      $( '#rosterSize' ).text(rosters[rosterID].players.length);
    });
  });
}

function chooseGuild(guildName) {
  var Guild = common.capFirst(guildName);
  $( '#guildSelector' ).addClass( 'hidden' );
  $( '#guildBack' ).removeClass( 'hidden' );
  $( '#guildBack-butt' ).text( Guild + ', click here to change guild' );
  $( '#allPlayers' ).removeClass( 'hidden' );
  $( '#saveControl' ).removeClass( 'hidden' );
  $( '#' + guildName + 'Players' ).removeClass( 'hidden' );
  rosters[rosterID].guild = guildName;
}

function choosePlayers(playerList) {
  $( '#allPlayers button' ).each(function() {
    var player = $(this).val();
    if (playerList.indexOf(player) > -1) { // It's in the list
      $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
      $(this).addClass( 'active' );
    }
  });
}

function hideAllPlayerSelectors() {
  $( '#allPlayers' ).addClass( 'hidden' );
  $( '#allPlayers div' ).each(function () {
    $(this).addClass( 'hidden' );
  });
  $( '#allPlayers button' ).each(function() {
    $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
    $(this).removeClass( 'active' );
  });
  rosters[rosterID] = {guild:'', players:[], hpThreshold:0};
  $( '#rosterSize' ).text(rosters[rosterID].players.length);
  $( '#saveControl' ).addClass( 'hidden' );
  $( '#saveSuccessAlert' ).addClass( 'hidden' );
}

function loadRoster() {
  rosterID = parseInt($( 'input[name=rosters]:checked' ).val());
  var tempCookie = Cookies.get( 'rosters' );
  if (tempCookie) {
    rosters = JSON.parse(tempCookie);
  } else {
    rosters = [{}, {}];
  }
  if (rosters[rosterID] && rosters[rosterID].guild && rosters[rosterID].players) {
    chooseGuild(rosters[rosterID].guild);
    choosePlayers(rosters[rosterID].players);
    $( '#rosterSize' ).text(rosters[rosterID].players.length);
    $( '#low-health-threshold' ).val(rosters[rosterID].hpThreshold || 0);
  }
}

function resetRosterManager() {
  $( '#saveSuccessAlert' ).addClass( 'hidden' );
  hideAllPlayerSelectors()
  $( '#guildSelector' ).removeClass( 'hidden' );
  $( '#guildBack' ).addClass( 'hidden' );
}

function displayCard(playerName) {
  var imageURL = '/cards/card-narwhal.gif';
  var imageURL2 = imageURL;
  if ($( '#cardCol2' ).css( 'display' ) != 'none') {
    roster.cardFront = true;
    imageURL2 = '/cards/' + playerName.replace('1-', '') + '_b' + common.IMG_EXT;
    var imageTag = '<img src="' + imageURL2 + '" class="img-responsive center-block">';
    $( '#playerCard2' ).html(imageTag);
    $( '#cardPanel2' ).removeClass( 'hidden' );
  }
  imageURL = '/cards/' + playerName + '_';
  if (roster.cardFront) {
    imageURL += 'f' + common.IMG_EXT;
  } else {
    imageURL += 'b' + common.IMG_EXT;
  }
  imageUrl = imageUrl.replace('1-', '');
  if ($( '#cardCol' ).css( 'display' ) != 'none') {
    var imageTag = '<img src="' + imageURL + '" class="img-responsive center-block" alt="' + playerName + '">';
    $( '#playerCard' ).html(imageTag);
    $( '#cardPanel' ).removeClass( 'hidden' );
  }
}
