$(document).ready(function() {
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
  $( '#json-output' ).val(JSON.stringify(newGuilds));
});

$( '#player-name' ).keyup(function () {
  var playerName = $( '#player-name' ).val();
  var playerObj = _.find(common.allPlayers, function(searchObj) {
    return searchObj.name == playerName;
  });
  if (playerObj) {
    layoutCard(playerObj);
  }
});

function layoutCard(playerObj) {
  // playerObj.name
}
