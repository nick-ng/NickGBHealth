var options = {
  IMG_EXT: '.jpg'
};

var percentHeights = [
  {selector:'.btn-player', height:0.115},
];

$(document).ready(function() {
  if (Cookies.get( 'resume-url' )) {
    $( '#resumeGameButton' ).removeClass( 'hidden' );
  }
  populatePositionButtons();
  hookPositionButtons();
  common.loadSettings();
  displaySettings();
  windowResized();
});

// Static DOM events
$(window).resize(windowResized);

$( 'input[name=fullscreen-behaviour]:radio' ).change(function() {
  common.fullscreenBehaviour = $(this).val();
  Cookies.set( 'options-fullscreen', common.fullscreenBehaviour, {expires: 9999})
});

$( '#resumeGameButton' ).click(function() {
  console.log(Cookies.get( 'resume-url' ));
  location.href = Cookies.get( 'resume-url' );
});

$( '#preload-cards' ).click(function() {
  $( '#preloaded-cards' ).html( '' );
  $( '#preload-cards-bar' ).removeClass( 'hidden' );
  var allPlayers = _.sortBy(common.allPlayers, 'name' );
  preloadCards(allPlayers, allPlayers.length);
});

// DOM generators
function populatePositionButtons() {
  for (var j = 0; j < 6; j++) {
    for (var i = 0; i < _.keys(common.specialPos).length; i++) {
      var type = _.keys(common.specialPos)[i];
      $( '#' + type + '-pos' ).append(playerButtonHTML(j));
    }
  }
}

// Generated DOM events
function hookPositionButtons() {
  for (var i = 0; i < _.keys(common.specialPos).length; i++) {
    var type = _.keys(common.specialPos)[i];
    var $theseButtons = $( '#' + type + '-pos button' );
    $theseButtons.each(function() {
      changePos($(this), type);
    });
  }
}

function changePos($thisBtn, type) {
  $thisBtn.click(function() {
    var id = $thisBtn.attr( 'id' );
    common.specialPos[type].id = parseInt(id);
    Cookies.set( 'options-' + type + '-pos', id, {expires: 9999});
    nameButtons();
    colourButtons();
  });
}

// Normal functions
function displaySettings() {
  nameButtons();
  colourButtons();
  chooseFullscreenBehaviour();
}

function nameButtons() {
  for (var i = 0; i < _.keys(common.specialPos).length; i++) {
    var type = _.keys(common.specialPos)[i];
    var $theseButtons = $( '#' + type + '-pos button' );
    var players = ['1', '2', '3', '4'];
    $theseButtons.each(function() {
      var id = parseInt($(this).attr( 'id' ));
      $(this).text('');
      for (var j = 0; j < _.keys(common.specialPos).length; j++) {
        var key = _.keys(common.specialPos)[j];
        if (id == common.specialPos[key].id) {
          $(this).text(common.specialPos[key].Name);
        }
      }
      if (!$(this).text()) {
        var playerNum = players.shift();
        if (playerNum) {
          $(this).text( 'Player ' + playerNum);
        }
      }
    });
  }
}

function colourButtons() {
  for (var i = 0; i < _.keys(common.specialPos).length; i++) {
    var allTypes = _.keys(common.specialPos);
    var type = allTypes[i];
    colourEachButton(type, _.without(allTypes, type));
  }
}

function colourEachButton(type, antiTypes) {
  var $theseButtons = $( '#' + type + '-pos button' );
  $theseButtons.each(function() {
    var id = parseInt($(this).attr( 'id' ));
    if (id == common.specialPos[type].id) {
      $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
      $(this).addClass( 'active' );
    } else {
      $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
      $(this).removeClass( 'active' );
    }
    for (var i = 0; i < antiTypes.length; i++) {
      var antiType = antiTypes[i];
      if (id == common.specialPos[antiType].id) {
        $(this).prop( 'disabled', true);
      } else {
        $(this).prop( 'disabled', false);
      }
    }
  });
}

function preloadCards(allPlayers, totalCards) {
  if (allPlayers.length) {
    var playerObj = allPlayers.shift()
    console.log(playerObj);
    var name = playerObj.name;
    var frontURL = '/cards/' + name + '_f' + options.IMG_EXT;
    var backURL = '/cards/' + name + '_b' + options.IMG_EXT;
    var newHTML = '<img src="' + frontURL + '" class="img-preload">';
    newHTML += '<img id="' + name + '-card" src="' + backURL + '" class="img-preload">';
    $( '#preloaded-cards' ).append(newHTML);
    var Name = playerObj.display || common.capFirst(name).replace( /-v$/, ', Veteran' );
    $( '#preload-card-current').html( '&nbsp; Loading ' + Name);
    var eventData = {
      totalCards: totalCards,
      remainingCards: (totalCards - allPlayers.length),
      allPlayers: allPlayers
    }
    $( '#' + name + '-card' ).load(function() {
      var percent = 100 * eventData.remainingCards / eventData.totalCards;
      $( '#preload-cards-progress' ).css( 'width', percent + '%' ).text(eventData.remainingCards + '/' + eventData.totalCards);
      preloadCards(eventData.allPlayers, eventData.totalCards);
    });
  } else {
    $( '#preload-card-current').html( '&nbsp; Done' );
    $( '#preload-cards-progress' ).text( 'Done' );
  }
}

function chooseFullscreenBehaviour() {
  $( 'input[name=fullscreen-behaviour]:radio').each(function() {
    if ($(this).val() == common.fullscreenBehaviour) {
      $(this).prop( 'checked', true);
    }
  });
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
function playerButtonHTML(id) {
  return '<button id="' + id + '" name="playerButtons" class="btn btn-default btn-lg col-xs-4 text-center" type="button"></button>';
}
