$(document).ready(function() {
  addMorePlayerInfo()
  //$( '#json-output' ).val(JSON.stringify(newGuilds));
  $.ajax({
    dataType: "json",
    url: '/jsons/guilds.json',
    //data: data,
    success: function(data) {
      console.log( 'Guilds loaded' );
      common.allGuilds = data;
      common.allPlayers = getAllPlayerArr(common.allGuilds);
      $( '#json-output' ).val(JSON.stringify(common.allGuilds));
      findPlayerObj('blackheart');
    },
    error: function( one, two, err) {
      console.log(err)
      $( '#json-output' ).val(err);
    }
  });
});

$( '#player-name' ).keyup(function () {
  var playerName = $( '#player-name' ).val().toLowerCase();
  findPlayerObj(playerName);
});

$( '#show-avarisse' ).click(function () {
  var playerName = 'avarisse';
  findPlayerObj(playerName);
});

$( '#show-blackheart' ).click(function () {
  findPlayerObj('blackheart');
});

//================
// These functions
function findPlayerObj(playerName) {
  var playerObj = _.find(common.allPlayers, function(searchObj) {
    return searchObj.name == playerName;
  });
  if (playerObj) {
    $( '#player-name' ).val(playerName);
    $( '#json-output' ).val(JSON.stringify(playerObj));
    layoutCard(playerObj);
  }
  // playerObj.name
}

function layoutCard(playerObj, captainsGuild) {
  if (playerObj.hasCardData) {
    var portraitURL = '/images/portraits/' + playerObj.name + '_portrait.png';
    
    // Get image info and override if necessary
    var portrait = portraitURL;
    var season = playerObj.season
    var guild = playerObj.guild[0];
    if (playerObj.guild.indexOf(captainsGuild) >= 0) {
      guild = captainsGuild;
    } else if (playerObj.guild.length > 1) {
      guild = 'union';
    }
    
    // Make image urls
    var partsPath = '/images/card-parts/';
    var bgURL = partsPath + 's' + season + '_bg.jpg';
    var headURL = partsPath + guild + '_header.png';
    var statsURL = partsPath + guild + '_stats.png';
    
    // Set colour of fonts
    var fontOnBg = 'dark-font';
    var fontOnImg = 'light-font';
    
    // Pre-format some properties
    var Name = common.capFirst(playerObj.name);
    
    // Card HTML
    // Card Front
    var cardF = '<div class="card" style="background:url(' + bgURL + ');">';
    // Add stats header
    //cardF += '<span class="card-stats-bg"><img src="' + statsURL + '"></span>';
    cardF += '<div class="card-stats" style="background:url(' + statsURL + ');">';
    cardF += '<div class="card-title ' + fontOnImg + '">' + Name + '</div>';
    cardF += '<table><tr class="card-basic-stats ' + fontOnImg + '">';
    cardF += basicStatsHTML(playerObj.stats);
    cardF += '</tr></table>';
    
    cardF += '<div class="card-book ' + fontOnImg + '">';
    cardF += playbookHTML(playerObj.playbook);
    cardF += '</div>';
    
    
    cardF += '</div>';
    cardF += '</div>';
    
    $( '#playerCard' ).html(cardF);
  }
}

function playbookHTML(playbook) {
  var html = '';
  for (var i = 0; i < playbook.length; i++) {
    html += '<div class="playbook-col">';
    if (playbook[i].att2) {
      var classes = 'playbook-att ' + (playbook[i].att2.mom ? 'mom' : 'norm');
      html += '<div class="' + classes + '">' + playbookAttHTML(playbook[i].att2) + '</div>';
    } else {
      html += '<div class="playbook-att blank"><span class="sr-only">a</span></div>';
    }
    var classes = 'playbook-att ' + (playbook[i].att1.mom ? 'mom' : 'norm');
    html += '<div class="' + classes + '">' + playbookAttHTML(playbook[i].att1) + '</div></div>';
  }
  return html;
}

function playbookAttHTML(att) {
  var html = '';
  if (att.res.length == 1) {
    var guildballs = att.res[0].match( /GB/ig );
    if (guildballs) {
      html += howManyGuildballs(guildballs, att.mom, false);
    } else {
      html += '<div class="playbook-full">' + att.res[0] + '</div>';
    }
  } else {
    for (var i = 0; i < att.res.length; i++) {
      var guildballs = att.res[0].match( /GB/ig );
      if (guildballs) {
        html += howManyGuildballs(guildballs, att.mom, true);
      } else {
        html += '<div class="playbook-half">' + att.res[i] + '</div>';
      }
    }
  }
  return html
}

function howManyGuildballs(guildballs, mom, half) {
  var imgURL = '/images/card-parts/';
  imgURL += half ? 'half' : '';
  imgURL += mom ? 'mom' : '';
  if (guildballs.length == 1) {
    return '<img src="' + imgURL + 'gb.svg">';
  } else {
    return '<img src="' + imgURL + 'gbgb.svg">';
  }
}

function basicStatsHTML(stats) {
  var columns = [
    {
      stat: 'MOV',
      values: [
        {
          key: 'move',
          units: '&rdquo;/'
        },
        {
          key: 'sprint',
          units: '&rdquo;'
        }
      ]
    },
    {
      stat: 'TAC',
      values: [
        {
          key: 'tac',
        }
      ]
    },
    {
      stat: 'KICK',
      values: [
        {
          key: 'kick',
          units: '/'
        },
        {
          key: 'kickDistance',
          units: '&rdquo;'
        }
      ]
    },
    {
      stat: 'DEF',
      values: [
        {
          key: 'defence',
          units: '+'
        }
      ]
    },
    {
      stat: 'ARM',
      values: [
        {
          key: 'armour'
        }
      ]
    },
    {
      stat: 'INF',
      values: [
        {
          key: 'influence',
          units: '/'
        },
        {
          key: 'influenceCap'
        }
      ]
    }
  ];
  var preHtml = '<td class="card-';
  var html = '';
  for (var i = 0; i < columns.length; i++) {
    html += preHtml + columns[i].stat.toLowerCase() + '">' + columns[i].stat.toUpperCase() + '<br>';
    for (var j = 0; j < columns[i].values.length; j++) {
      var key = columns[i].values[j].key;
      var units = '';
      if (columns[i].values[j].units != undefined) {
        units = columns[i].values[j].units;
      }
      html += stats[key] + units;
    }
    html += '</td>';
  }
  return html;
}

//===========================================================
// Set up functions. Not directly to do with generating cards
//===========================================================
function addMorePlayerInfo() {
  var newGuilds = [];
  for (var i = 0; i < common.allGuilds.length; i++) {
    var oneGuild = common.allGuilds[i];
    oneGuild.sort = oneGuild.name;
    for (var j = 0; j < oneGuild.players.length; j++) {
      oneGuild.players[j].size = 30;
      oneGuild.players[j].melee = 1;
      oneGuild.players[j].stats = {
        mov:[1,2],
        tac:[1],
        kick:[1,2],
        def:[1],
        arm:[1],
        inf:[1,2]
      };
      oneGuild.players[j].book = [['mT','1m'],['','kD'],['><','3'],['<','gb'],['MgBGb','>>']];
      oneGuild.players[j].plays = ['example', 'example 2'];
      oneGuild.players[j].heroic = 'example';
      oneGuild.players[j].legendary = 'example';
      oneGuild.players[j].traits = [
        {name:'Selective',extra:['Brewers', 'Fishermen', 'Morticians']},
        {name:'Shelling Out',extra:[4]},
        {name:'Furious'},
        {name: 'GlUTtoNOuS mASs'}
      ];
      oneGuild.players[j].race = 'Castellyian, Human, Female,';
      oneGuild.players[j].position = 'Winger';
      oneGuild.players[j].guild = [oneGuild.name];
      oneGuild.players[j].season = 1;
    }
    newGuilds.push(oneGuild);
  }
}

function getAllPlayerArr(allGuilds) {
  var allPlayers = [];
  var unionIndex = 0;
  var mostHP = 0;
  for (var i = 0; i < allGuilds.length; i++) {
    if (allGuilds[i].name != 'union') {
      for (var j = 0; j < allGuilds[i].players.length; j++) {
        allPlayers.push(allGuilds[i].players[j]);
        mostHP = Math.max(allGuilds[i].players[j].hp, mostHP);
      }
    } else {
      unionIndex = i;
    }
    //allGuilds[i].players = 
    allGuilds[i].players = _.sortBy(allGuilds[i].players, 'name');
    allGuilds[i].union.sort();
  }
  for (var i = 0; i < allGuilds[unionIndex].players.length; i++) {
    allPlayers.push(allGuilds[unionIndex].players[i]);
    mostHP = Math.max(allGuilds[unionIndex].players[i].hp, mostHP);
  }
  common.mostHP = mostHP;
  return allPlayers;
}
