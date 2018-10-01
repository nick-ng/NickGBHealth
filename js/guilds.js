// All Players
common.allGuilds = [];

// Alchemists
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'alchemists';
common.allGuilds[L].players = [
  {name:'midas', hp:14, sponge: [7], role:'c'},
  {name:'smoke', hp:16, sponge: [8], role:'c'},
  {name:'flask', hp:8, sponge: [4], role:'m'},
  {name:'naja', hp:7, sponge: [4], role:'m'},
  {name:'calculus', hp:15, sponge: [8]},
  {name:'katalyst', hp:27, sponge: [15]},
  {name:'katalyst-v', hp:29, sponge: [19]},
  {name:'mercury', hp:15, sponge: [8]},
  {name:'venin', hp:16, sponge: [10]},
  {name:'vitriol', hp:12, sponge: [6]},
  {name:'crucible', hp:14, sponge: [7]},
];
common.allGuilds[L].union = [
  'avarisse',
  'compound',
  'decimate',
  'harry',
  'hemlocke',
  'mist',
  'snakeskin',
];

// Blacksmiths
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'blacksmiths';
common.allGuilds[L].players = [
  { name: 'anvil', hp:22, sponge: [11] },
  { name: 'cinder', hp:13, sponge: [7] },
  { name: 'ferrite', hp: 17, sponge: [9] },
  { name: 'furnace', hp:20, sponge: [10] },
  { name: 'iron', hp: 13, sponge: [7] },
  { name: 'sledge', hp: 13, sponge: [7] },
  { name: 'alloy', hp: 12, sponge: [6] },
  { name: 'bolt', hp: 13, sponge: [7] },
  { name: 'burnish', hp: 18, sponge: [9] },
  { name: 'cast', hp: 13, sponge: [7] },
  { name: 'farris', hp: 18, sponge: [9] },
  { name: 'hearth', hp: 23, sponge: [12] },
  { name: 'vcinder', hp: 12, sponge: [6], display: 'vCinder' },

  { name: '1-anvil', hp:22, sponge: [11], display: 'Anvil', role: 'c' },
  { name: '1-cinder', hp:13, sponge: [7], display: 'Cinder', role: 'm' },
  { name: '1-ferrite', hp: 17, sponge: [9], display: 'Ferrite', role: 'c' },
  { name: '1-furnace', hp:20, sponge: [10], display: 'Furnace', role: 'c' },
  { name: '1-iron', hp: 13, sponge: [7], display: 'Iron', role: 'm' },
  { name: '1-sledge', hp: 13, sponge: [7], display: 'Sledge', role: 'm' },
  { name: '1-alloy', hp: 12, sponge: [6], display: 'Alloy', role: 'm' },
  { name: '1-bolt', hp: 13, sponge: [7], display: 'Bolt', role: 'm' },
  { name: '1-burnish', hp: 18, sponge: [9], display: 'Burnish', role: 'c' },
  { name: '1-cast', hp: 13, sponge: [7], display: 'Cast', role: 'm' },
  { name: '1-farris', hp: 18, sponge: [9], display: 'Farris', role: 'c' },
  { name: '1-hearth', hp: 23, sponge: [12], display: 'Hearth', role: 'c' },
  { name: '1-vcinder', hp: 12, sponge: [6], display: 'vCinder', role: 'm' },
  
];
common.allGuilds[L].union = [];

// Brewers
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'brewers';
common.allGuilds[L].players = [
  {name:'esters', hp:22, sponge: [11], role:'c'},
  {name:'tapper', hp:18, sponge: [9], role:'c'},
  {name:'quaff', hp:8, sponge: [4], role:'m'},
  {name:'scum', hp:6, sponge: [3], role:'m'},
  {name:'friday', hp:12, sponge: [6]},
  {name:'hooper', hp:16, sponge: [8]},
  {name:'mash', hp:15, sponge: [8]},
  {name:'spigot', hp:14, sponge: [6]},
  {name:'vspigot', hp:14, sponge: [7], display: 'vSpigot'},
  {name:'stave', hp:23, sponge: [12]},
  {name:'stoker', hp:16, sponge: [8]},
  {name:'pintpot', hp:20, sponge: [10]},
  {name:'vdecimate', hp:14, sponge: [7], display: 'vDecimate'},
];
common.allGuilds[L].union = [];

// Butchers
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'butchers';
common.allGuilds[L].players = [
  {name:'fillet', hp:14, sponge: [7], role:'c'},
  {name:'ox', hp:19, sponge: [10], role:'c'},
  {name:'princess', hp:8, sponge: [4], role:'m'},
  {name:'truffles', hp:11, sponge: [6], role:'m'},
  {name:'boar', hp:20, sponge: [10]},
  {name:'boiler', hp:14, sponge: [7]},
  {name:'brisket', hp:12, sponge: [6]},
  {name:'brisket-v', hp:13, sponge: [7]},
  {name:'meathook', hp:14, sponge: [7]},
  {name:'shank', hp:14, sponge: [7]},
  {name:'tenderiser', hp:19, sponge: [10]},
  {name:'ox-v', hp:19, sponge: [10]},
];
common.allGuilds[L].union = [
  'avarisse',
  'decimate',
  'gutter',
  'harry',
  'minx',
  'rage',
];

// Engineers
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'engineers';
common.allGuilds[L].players = [
  {name:'ballista', hp:18, sponge: [9], role:'c'},
  {name:'pinvice', hp:11, sponge: [6], role:'c', display:'Pin Vice'},
  {name:'mainspring', hp:7, sponge: [4], role:'m'},
  {name:'mother', hp:9, sponge: [5], role:'m'},
  {name:'colossus', hp:20, sponge: [10]},
  {name:'hoist', hp:11, sponge: [6]},
  {name:'ratchet', hp:17, sponge: [9]},
  {name:'salvo', hp:14, sponge: [7]},
  {name:'velocity', hp:11, sponge: [6]},
  {name:'velocity-v', hp:14, sponge: [7]},
  {name:'locus', hp:15, sponge: [8]},
];
common.allGuilds[L].union = [
  'avarisse',
  'compound',
  'decimate',
  'gutter',
  'harry',
  'rage',
];

// Farmers
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'farmers';
common.allGuilds[L].players = [
  { name:'grange', hp:26, sponge: [13], role:'c' },
  { name:'thresher', hp:20, sponge: [10], role:'c' },
  { name: 'peck', hp: 6, sponge: [3], role: 'm' },
  { name: 'buckwheat', hp: 9, sponge: [5], role: 'm' },
  { name: 'bushel', hp: 12, sponge: [6] },
  { name: 'jackstraw', hp: 10, sponge: [5] },
  { name: 'harrow', hp: 19, sponge: [10] },
  { name: 'fallow', hp: 19, sponge: [10] },
  { name: 'millstone', hp: 17, sponge: [9] },
  { name: 'windle', hp: 28, sponge: [14] },
  { name: 'tater', hp: 16, sponge: [8] },
  { name: 'ploughman', hp: 22, sponge: [11] },
];
common.allGuilds[L].union = [
  'benediction',
  'grace',
];

// Fishermen
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'fishermen';
common.allGuilds[L].players = [
  {name:'corsair', hp:18, sponge: [9], role:'c'},
  {name:'shark', hp:17, sponge: [9], role:'c'},
  {name:'salt', hp:7, sponge: [4], role:'m'},
  {name:'tentacles', hp:9, sponge: [5], role:'m'},
  {name:'angel', hp:12, sponge: [6]},
  {name:'greyscales', hp:13, sponge: [7]},
  {name:'jac', hp:15, sponge: [8]},
  {name:'kraken', hp:20, sponge: [10]},
  {name:'sakana', hp:15, sponge: [8]},
  {name:'siren', hp:10, sponge: [5]},
  {name:'siren-v', hp:10, sponge: [5]},
  {name:'hag', hp:14, sponge: [7]},
];
common.allGuilds[L].union = [
  'avarisse',
  'gutter',
  'hemlocke',
  'snakeskin',
];

// Hunters
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'hunters';
common.allGuilds[L].players = [
  {name:'theron', hp:18, sponge: [9], role:'c'},
  {name:'skatha', hp:14, sponge: [7], role:'c'},
  {name:'fahad', hp:6, sponge: [3], role:'m'},
  {name:'snow', hp:8, sponge: [4], role:'m'},
  {name:'chaska', hp:16, sponge: [8]},
  {name:'egret', hp:12, sponge: [6]},
  {name:'hearne', hp:20, sponge: [10]},
  {name:'hearne-v', hp:20, sponge: [10]},
  {name:'jaecar', hp:14, sponge: [7]},
  {name:'seenah', hp:21, sponge: [11]},
  {name:'ulfr', hp:16, sponge: [8]},
  {name:'zarola', hp:12, sponge: [6]},
];
common.allGuilds[L].union = [
  'avarisse',
  'hemlocke',
  'minx',
];

// Masons
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'masons';
common.allGuilds[L].players = [
  {name:'hammer', hp:18, sponge: [9], role:'c'},
  {name:'honour', hp:17, sponge: [9], role:'c'},
  {name:'marbles', hp:8, sponge: [4], role:'m'},
  {name:'wrecker', hp:9, sponge: [5], role:'m'},
  {name:'brick', hp:19, sponge: [10]},
  {name:'chisel', hp:13, sponge: [9], nonsponge: [6]},
  {name:'flint', hp:14, sponge: [7]},
  {name:'harmony', hp:10, sponge: [5]},
  {name:'harmony-v', hp:10, sponge: [5]},
  {name:'mallet', hp:16, sponge: [8]},
  {name:'tower', hp:18, sponge: [9]},
  {name:'granite', hp:24, sponge: [12]},
];
common.allGuilds[L].union = [
  'avarisse',
  'decimate',
  'lucky',
  'minx',
  'mist',
  'snakeskin',
];

// Morticians
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'morticians';
common.allGuilds[L].players = [
  {name:'obulus', hp:14, sponge: [7], role:'c'},
  {name:'scalpel', hp:17, sponge: [9], role:'c'},
  {name:'dirge', hp:5, sponge: [3], role:'m'},
  {name:'vileswarm', hp:7, sponge: [4], role:'m'},
  {name:'bonesaw', hp:12, sponge: [6]},
  {name:'casket', hp:17, sponge: [9]},
  {name:'cosset', hp:12, sponge: [7]},
  {name:'ghast', hp:21, sponge: [11]},
  {name:'graves', hp:14, sponge: [7]},
  {name:'graves-v', hp:14, sponge: [7]},
  {name:'silence', hp:12, sponge: [6]},
  {name:'brainpan', hp:14, sponge: [7], detach:'memory'},
  {name:'memory', hp:3, sponge: [], role:'benched'},
  { name: 'hemlocke-v', hp: 12, sponge: [6] },
  { name: 'pelage', hp: 10, sponge: [5] },
  { name: 'skulk', hp: 14, sponge: [7] },
];
common.allGuilds[L].union = [
];

// Union
common.allGuilds.push({});
L = common.allGuilds.length - 1;
common.allGuilds[L].name = 'union';
common.allGuilds[L].players = [
  {name:'compound', hp:20, sponge: [10], role:'nonunion'},
  {name: 'lucky', hp:14, sponge: [7], role: 'nonunion'},
  {name:'blackheart', hp:16, sponge: [8], role:'c'},
  {name:'rage-v', hp:17, sponge: [9], role:'c'},
  {name:'brisket-s', hp:15, sponge: [8], role:'c'},
  {name:'coin', hp:8, sponge: [4], role:'m'},
  {name:'strongbox', hp:8, sponge: [4], role:'m'},
  {name:'avarisse', hp:20, sponge: [10], detach:'greede'},
  {name:'greede', hp:7, sponge: [4], role:'benched'},
  {name:'benediction', hp:19, sponge: [10]},
  {name:'decimate', hp:14, sponge: [7]},
  {name:'fangtooth', hp:29, sponge: [15]},
  {name:'grace', hp:15, sponge: [8]},
  {name:'gutter', hp:14, sponge: [7]},
  {name:'harry', hp:19, sponge: [12], display:'Harry &lsquo;the Hat&rsquo;'},
  {name:'hemlocke', hp:10, sponge: [5]},
  {name:'minx', hp:12, sponge: [6]},
  {name:'mist', hp:12, sponge: [6]},
  {name:'rage', hp:17, sponge: [9]},
  {name:'snakeskin', hp:12, sponge: [6]},
];
common.allGuilds[L].union = [];

// All players in one list
common.allPlayers = [];
common.mostHP = 0;
var unionIndex = 0;
for (var i = 0; i < common.allGuilds.length; i++) {
  if (common.allGuilds[i].name != 'union') {
    for (var j = 0; j < common.allGuilds[i].players.length; j++) {
      common.allPlayers.push(common.allGuilds[i].players[j]);
      common.mostHP = Math.max(common.allGuilds[i].players[j].hp, common.mostHP);
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
  common.mostHP = Math.max(common.allGuilds[unionIndex].players[i].hp, common.mostHP);
}
