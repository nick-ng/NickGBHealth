var specialPos = {cap:{id:0, Name:'Captain'}, mas:{id:1, Name:'Mascot'}};
var percentHeights = [
  {selector:'.btn-player', height:0.115},
];

$(document).ready(function() {
  populatePositionButtons();
  hookPositionButtons();
  common.loadSettings();
  displaySettings();
  windowResized();
});

// Static DOM events
$(window).resize(windowResized);

// DOM generators
function populatePositionButtons() {
  for (var j = 0; j < 6; j++) {
    for (var i = 0; i < _.keys(specialPos).length; i++) {
      var type = _.keys(specialPos)[i];
      $( '#' + type + '-pos' ).append(playerButtonHTML(j));
    }
  }
}

// Generated DOM events
function hookPositionButtons() {
  for (var i = 0; i < _.keys(specialPos).length; i++) {
    var type = _.keys(specialPos)[i];
    var $theseButtons = $( '#' + type + '-pos button' );
    $theseButtons.each(function() {
      changePos($(this), type);
    });
  }
}

function changePos($thisBtn, type) {
  $thisBtn.click(function() {
    var id = $thisBtn.attr( 'id' );
    specialPos[type].id = parseInt(id);
    Cookies.set( 'options-' + type + '-pos', id);
    nameButtons();
    colourButtons();
  });
}

// Normal functions
function displaySettings() {
  nameButtons();
  colourButtons();
}

function nameButtons() {
  for (var i = 0; i < _.keys(specialPos).length; i++) {
    var type = _.keys(specialPos)[i];
    var $theseButtons = $( '#' + type + '-pos button' );
    var players = ['1', '2', '3', '4'];
    $theseButtons.each(function() {
      var id = parseInt($(this).attr( 'id' ));
      $(this).text('');
      for (var j = 0; j < _.keys(specialPos).length; j++) {
        var key = _.keys(specialPos)[j];
        if (id == specialPos[key].id) {
          $(this).text(specialPos[key].Name);
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
  for (var i = 0; i < _.keys(specialPos).length; i++) {
    var allTypes = _.keys(specialPos);
    var type = allTypes[i];
    colourEachButton(type, _.without(allTypes, type));
  }
}

function colourEachButton(type, antiTypes) {
  var $theseButtons = $( '#' + type + '-pos button' );
  $theseButtons.each(function() {
    var id = parseInt($(this).attr( 'id' ));
    if (id == specialPos[type].id) {
      $(this).removeClass( 'btn-default' ).addClass( 'btn-primary' );
      $(this).addClass( 'active' );
    } else {
      $(this).removeClass( 'btn-primary' ).addClass( 'btn-default' );
      $(this).removeClass( 'active' );
    }
    for (var i = 0; i < antiTypes.length; i++) {
      var antiType = antiTypes[i];
      if (id == specialPos[antiType].id) {
        $(this).prop( 'disabled', true);
      } else {
        $(this).prop( 'disabled', false);
      }
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
