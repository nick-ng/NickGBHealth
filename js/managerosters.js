var rosterID = 0;
var rosterSize = [0, 0];
var rosterCookies = ['', ''];
var maxRosterSize = 9;

$(document).ready(function() {
  $( '#maxRosterSize' ).text(maxRosterSize);
  populateDOM();
  hookEvents();
  loadRoster();
}); // $( document ).ready(function() {

function populateDOM() {
  for (var i = 0; i < common.allPlayers.length; i++) {
    var guildObj = common.allPlayers[i];
    var guildHTML = '<div id="' + guildObj.name + 'Players" class="hidden">';
    var selectorHTML = '<button id="' + guildObj.name + '-butt" ' +
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
};

function hookEvents() {
  $( '#guildBack-butt' ).click(resetRosterManager);

  $( 'input[name=rosters]:radio' ).change(function() {
    resetRosterManager();
    loadRoster();
  });
  
  $( '#saveRosterButton' ).click(function() {
    cookieName = 'roster' + rosterID;
    Cookies.set(cookieName, rosterCookies[rosterID], { expires: common.cookieExpiry });
    var rosterNumber = rosterID + 1;
    $( '#saveSuccessAlert' ).text( 'Roster ' + rosterNumber + ' saved.' );
    $( '#saveSuccessAlert' ).removeClass( 'hidden' );
    common.parseRosterCookie(rosterCookies[rosterID]);
  });
  
  $( '#guildSelector button' ).each(function() {
    $(this).click(function() {
      var guild = $(this).attr( 'id' ).replace(/-butt$/, '' );
      var Guild = 
      hideAllPlayerSelectors()
      chooseGuild(guild);
      rosterCookies[rosterID] = '3' + guild + '2';
    });
  });

  $( '#allPlayers button' ).each(function() {
    $(this).click(function() {
      var player = $(this).attr( 'id' ).replace(/-butt$/, '' );
      var playerCookie = '1' + player + '0';
      if ($(this).hasClass( 'btn-primary' )) {
        rosterSize[rosterID]--
        $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
        $(this).removeClass( 'active' );
        rosterCookies[rosterID] = rosterCookies[rosterID].replace( playerCookie, '' );
      } else {
        rosterSize[rosterID]++;
        $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
        $(this).addClass( 'active' );
        rosterCookies[rosterID] += playerCookie;
        $( '#saveControl' ).removeClass( 'hidden' );
      };
      $(this).blur();
      $( '#rosterSize' ).text(rosterSize[rosterID]);
      //~ $( '#output' ).text(rosterCookies[rosterID]);
    });
  });
};

function chooseGuild(guildName) {
  var Guild = common.capFirst(guildName);
  $( '#guildSelector' ).addClass( 'hidden' );
  $( '#guildBack' ).removeClass( 'hidden' );
  $( '#guildBack-butt' ).text( Guild + ', click here to change guild' );
  $( '#allPlayers' ).removeClass( 'hidden' );
  $( '#' + guildName + 'Players' ).removeClass( 'hidden' );
};

function choosePlayers(playerList) {
  $( '#allPlayers button' ).each(function() {
    var player = $(this).attr( 'id' ).replace(/-butt$/, '' );
    if (playerList.indexOf(player) > -1) { // It's in the list
      $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
      $(this).addClass( 'active' );
    }
  });
};

function hideAllPlayerSelectors() {
  $( '#allPlayers' ).addClass( 'hidden' );
  $( '#allPlayers div' ).each(function () {
    $(this).addClass( 'hidden' );
  });
  $( '#allPlayers button' ).each(function() {
    $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
    $(this).removeClass( 'active' );
  });
  rosterCookies[rosterID] = '';
  rosterSize[rosterID] = 0;
  $( '#rosterSize' ).text(rosterSize[rosterID]);
  //~ $( '#output' ).text(rosterCookies[rosterID]);
  $( '#saveControl' ).addClass( 'hidden' );
  $( '#saveSuccessAlert' ).addClass( 'hidden' );
};

function loadRoster() {
  var id = parseInt($( 'input[name=rosters]:checked' ).attr('id'));
  rosterID = id;
  var cookieName = 'roster' + id;
  var tempCookie = Cookies.get(cookieName);
  if (tempCookie) {
    rosterCookies[id] = tempCookie;
    var rosterObj = common.parseRosterCookie(tempCookie);
    if (rosterObj.guild && rosterObj.players) {
      chooseGuild(rosterObj.guild);
      choosePlayers(rosterObj.players);
      rosterSize[id] = rosterObj.players.length;
      $( '#rosterSize' ).text(rosterSize[rosterID]);
    };
  } else {
    rosterCookies[id] = '';
  }
};

function resetRosterManager() {
  hideAllPlayerSelectors()
  $( '#guildSelector' ).removeClass( 'hidden' );
  $( '#guildBack' ).addClass( 'hidden' );
};
