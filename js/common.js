// Common variables
var common = {
  IMG_EXT: '.jpg',
  cookieExpiry: 999, // 999 days
  specialPos: {cap:{id:0, Name:'Captain'}, mas:{id:1, Name:'Mascot'}},
  fullscreenBehaviour: 'separate'
};

// Common functions
common.removeWhiteSpace = function removeWhiteSpace(someString) {
  // Replace multiple spaces with one, REMOVE leading and trailing spaces.
  return someString.replace( /[\s\n\r]+/g, ' ' ).replace( /^\s|\s$/g, '' );
  // This matches leading and trailing spaces of any number /^\s+|\s+$/g
};

common.findInArray = function findInArray(array, searchValue, searchKey, returnKey) {
  /* // Safari Mobile doesn't have Array.prototype.find()
  var returnObj = array.find(function(item) {
    return item[searchKey] == searchValue;
  });
  if (returnKey != undefined) {
    return returnObj[returnKey];
  } else {
    return returnObj;
  }
  */
  var returnObj = null;
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
    if (item[searchKey] == searchValue) {
      returnObj = $.extend(true, {}, item, { index: i });
      break
    }
  }
  if (returnObj && (returnKey != undefined)) {
    return returnObj[returnKey];
  } else {
    return returnObj
  }
}

common.getThisID = function getThisID() {
  return location.pathname.replace(/^\//, '');
};

common.getThisSearch = function getThisSearch() {
  return location.search.replace(/^\?/, '');
};

common.parseRosterString = function parseRosterString(rosterString) {
  var guild = rosterString.match( /3([a-z])+2/ );
  if (guild) {
    guild = guild[0].replace( /\d/g, '' );
  }
  var players = rosterString.match( /1([a-z\-])+0/g );
  if (players) {
    for (var i = 0; i < players.length; i++) {
      players[i] = players[i].replace( /\d/g, '' );
    }
  }
  return {guild:guild, players:players};
}

common.stringRosterObj = function stringRosterObj(rosterObj) {
  var rosterString = '3' + rosterObj.guild + '2';
  for (var i = 0; i < rosterObj.players.length; i++) {
    rosterString += '1' + rosterObj.players[i] + '0';
  }
  return rosterString;
}

common.playerButtonHTML = function playerButtonHTML(name, special) {
  var Name = common.getRosterName(name) + special;
  return '<button value="' + name + '" class="btn btn-default btn-lg" type="button">' + Name + '</button>';
}

common.getRosterName = function getRosterName(name) {
  var playerObj = common.findInArray(common.allPlayers, name, 'name');
  var displayName = false;
  if (playerObj.display) {
    displayName = playerObj.display;
  } else {
    displayName = common.capFirst(name).replace( /-v$/, ', Veteran' );
  }
  if (playerObj.detach) {
    displayName += ' &amp; ' + common.getRosterName(playerObj.detach);
  }
  return displayName
}

common.loadSettings = function loadSettings() {
  for (var i = 0; i < _.keys(common.specialPos).length; i++) {
    var key = _.keys(common.specialPos)[i];
    var tempPos = parseInt(Cookies.get( 'options-' + key + '-pos' ));
    if (!isNaN(tempPos)) {
      common.specialPos[key].id = tempPos;
    }
  }
  common.fullscreenBehaviour = Cookies.get( 'options-fullscreen' ) || common.fullscreenBehaviour;
}

common.sumArray = function sumArray(someArray, useFloat) {
  // Sums all values in an array which may be strings. If a value cannot be parsed, it's skipped
  useFloat = useFloat || false;
  if (someArray && (someArray.length > 0)) {
    return someArray.reduce(function(prev, curr) {
      if (useFloat) {
        curr = parseFloat(curr);
      } else {
        curr = parseInt(curr);
      }
      if (isNaN(curr)) {
        curr = 0;
      };
      return prev + curr;
    });
  } else {
    return 0;
  }
}

// Adapted from http://stackoverflow.com/a/32501584
common.setSelectOnClick = function setSelectOnClick(selectorList) {
  for (var i = 0; i < selectorList.length; i++) {
    $(selectorList[i]).blur(function() {
      if ($(this).attr("data-selected-all")) {
        $(this).removeAttr("data-selected-all");
      }
    });
    $(selectorList[i]).click(function() {
      if (!$(this).attr("data-selected-all")) {
        try {
          $(this).selectionStart = 0;
          $(this).selectionEnd = $(this).value.length + 1;
          //add atribute allowing normal selecting post focus
          $(this).attr("data-selected-all", true);
        } catch (err) {
          $(this).select();
          //add atribute allowing normal selecting post focus
          $(this).attr("data-selected-all", true);
        }
      }
    });
  }
}

//From http://stackoverflow.com/a/7224605
common.capFirst = function capFirst(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

common.sortByKey = function sortByKey(array, key) {
  return array.sort(function getDelta(a, b) {
    var x = a[key];
    var y = b[key];

    if (typeof x == "string") {
      x = x.toLowerCase();
    }
    if (typeof y == "string") {
      y = y.toLowerCase();
    }
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

//Adapted from http://stackoverflow.com/a/21152762
common.parseQueryString = function parseQueryString() {
  var qd = {};
  location.search.substr(1).split("&").forEach(function(item) {
    var parts = item.split("=");
    var k = parts[0];
    var v = decodeURIComponent(parts[1]);
    (k in qd) ? qd[k].push(v) : qd[k] = [v]
  });
  return qd;
}
