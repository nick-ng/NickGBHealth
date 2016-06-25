// Common variables
var common = {};
common.cookieExpiry = 999; // 999 days

// All Players
common.allGuilds = [];

// Alchemists
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'alchemists';
common.allGuilds[L].players = [
  {name:'midas', hp:14, sponge:[5, 10], role:'c'},
  {name:'smoke', hp:16, sponge:[6, 12], role:'c'},
  {name:'flask', hp:10, sponge:[], role:'m'},
  {name:'naja', hp:7, sponge:[], role:'m'},
  {name:'calculus', hp:15, sponge:[5, 10]},
  {name:'compound', hp:20, sponge:[6, 12]},
  {name:'katalyst', hp:27, sponge:[9, 18]},
  {name:'katalyst', hp:29, sponge:[14, 24]},
  {name:'mercury', hp:15, sponge:[5, 10]},
  {name:'venin', hp:16, sponge:[5, 10]},
  {name:'vitriol', hp:12, sponge:[4, 8]},
];
common.allGuilds[L].union = [
  'avarisse',
  'decimate',
  'harry',
  'hemlocke',
  'mist',
  'snakeskin',
];

// Brewers
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'brewers';
common.allGuilds[L].players = [
  {name:'esters', hp:22, sponge:[8, 16], role:'c'},
  {name:'tapper', hp:18, sponge:[6, 12], role:'c'},
  {name:'quaff', hp:10, sponge:[], role:'m'},
  {name:'scum', hp:8, sponge:[], role:'m'},
  {name:'friday', hp:12, sponge:[4, 8]},
  {name:'hooper', hp:17, sponge:[6, 12]},
  {name:'mash', hp:17, sponge:[6, 12]},
  {name:'spigot', hp:16, sponge:[5, 10]},
  {name:'spigot-v', hp:16, sponge:[6,12]},
  {name:'stave', hp:23, sponge:[8, 16]},
  {name:'stoker', hp:18, sponge:[6, 12]},
];
common.allGuilds[L].union = [
  'avarisse',
  'fangtooth',
  'gutter',
  'harry',
  'hemlocke',
  'rage',
];

// Butchers

// Engineers

// Fishermen

// Hunters
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'hunters';
common.allGuilds[L].players = [
  {name:'theron', hp:18, sponge:[6, 12], role:'c'},
  {name:'fahad', hp:8, sponge:[], role:'m'},
  {name:'chaska', hp:16, sponge:[6, 12]},
  {name:'egret', hp:12, sponge:[4, 8]},
  {name:'hearne', hp:20, sponge:[7, 14]},
  {name:'jaecar', hp:14, sponge:[5, 10]},
  {name:'seenah', hp:21, sponge:[7, 14]},
  {name:'zarola', hp:12, sponge:[4, 8]},
];
common.allGuilds[L].union = [
  'avarisse',
  'hemlocke',
  'minx',
];

// Masons

// Morticians
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'morticians';
common.allGuilds[L].players = [
  {name:'obulus', hp:16, sponge:[5, 10], role:'c'},
  {name:'scalpel', hp:17, sponge:[6, 12], role:'c'},
  {name:'dirge', hp:5, sponge:[], role:'m'},
  {name:'vileswarm', hp:7, sponge:[], role:'m'},
  {name:'bonesaw', hp:13, sponge:[4, 8]},
  {name:'casket', hp:17, sponge:[6, 12]},
  {name:'cosset', hp:12, sponge:[4, 8]},
  {name:'ghast', hp:21, sponge:[7, 14]},
  {name:'graves', hp:14, sponge:[5, 10]},
  {name:'graves-v', hp:14, sponge:[5, 10]},
  {name:'silence', hp:15, sponge:[5, 10]},
];
common.allGuilds[L].union = [
  'avarisse',
  'fangtooth',
  'minx',
  'mist',
  'rage',
];

// Union
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'union';
common.allGuilds[L].players = [
  {name:'blackheart', hp:16, sponge:[5, 10], role:'c'},
  {name:'rage-v', hp:17, sponge:[6, 12], role:'c'},
  {name:'coin', hp:10, sponge:[], role:'m'},
  {name:'strongbox', hp:10, sponge:[], role:'m'},
  {name:'avarisse', hp:20, sponge:[7, 14]},
  {name:'greede', hp:4, sponge:[], role:'greede'},
  {name:'decimate', hp:14, sponge:[5, 10]},
  {name:'fangtooth', hp:29, sponge:[10, 20]},
  {name:'gutter', hp:14, sponge:[5, 10]},
  {name:'harry', hp:19, sponge:[7, 14]},
  {name:'hemlocke', hp:10, sponge:[3, 6]},
  {name:'minx', hp:12, sponge:[4, 8]},
  {name:'mist', hp:12, sponge:[4, 8]},
  {name:'rage', hp:17, sponge:[6, 12]},
  {name:'snakeskin', hp:12, sponge:[4, 8]},
];
common.allGuilds[L].union = [];

// Common functions
common.removeWhiteSpace = function removeWhiteSpace(someString) {
  // Replace multiple spaces with one, REMOVE leading and trailing spaces.
  return someString.replace( /[\s\n\r]+/g, ' ' ).replace( /^\s|\s$/g, '' );
  // This matches leading and trailing spaces of any number /^\s+|\s+$/g
};

common.findInArray = function findInArray(array, searchValue, searchKey, returnKey) {
  var returnObj = array.find(function(item) {
    return item[searchKey] == searchValue;
  });
  if (returnKey != undefined) {
    return returnObj[returnKey];
  } else {
    return returnObj;
  }
}

common.getThisID = function getThisID() {
  return window.location.pathname.replace(/^\//, '');
};

common.getThisSearch = function getThisSearch() {
  return window.location.search.replace(/^\?/, '');
};

common.parseRosterCookie = function parseRosterCookie(rosterCookie) {
  var guild = rosterCookie.match( /3([a-z])+2/ );
  if (guild) {
    guild = guild[0].replace( /\d/g, '' );
  }
  var players = rosterCookie.match( /1([a-z\-])+0/g );
  if (players) {
    for (var i = 0; i < players.length; i++) {
      players[i] = players[i].replace( /\d/g, '' );
    }
  }
  return {guild:guild, players:players};
}

common.playerButtonHTML = function playerButtonHTML(name, special) {
  var Name = common.capFirst(name).replace( /-v$/, ', Veteran' ) + special;
  if (name == 'avarisse') {
    Name = 'Avarisse &amp; Greede';
  }
  if (name == 'harry') {
    Name = 'Harry &lsquo;the Hat&rsquo;';
  }
  return '<button id="' + name + '-butt" class="btn btn-default" type="button">' + Name + '</button>';
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

common.allPlayers = [];
var unionIndex = 0;
for (var i = 0; i < common.allGuilds.length; i++) {
  if (common.allGuilds[i].name != 'union') {
    for (var j = 0; j < common.allGuilds[i].players.length; j++) {
      common.allPlayers.push(common.allGuilds[i].players[j]);
    }
  } else {
    unionIndex = i;
  }
  common.sortByKey(common.allGuilds[i].players, 'name');
  common.allGuilds[i].union.sort();
}
common.sortByKey(common.allPlayers, 'name');
for (var i = 0; i < common.allGuilds[unionIndex].players.length; i++) {
  common.allPlayers.push(common.allGuilds[unionIndex].players[i]);
}
