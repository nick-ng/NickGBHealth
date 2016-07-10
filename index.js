// Requires
// People's requires
var express = require( 'express' );
var app = express();
//var fs = require( 'fs' ); // Don't need fs?
var bodyParser = require( 'body-parser' );
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
var http = require( 'http' ).Server( app );
var io = require( 'socket.io' )( http );
var redis = require("redis"),
client = redis.createClient(process.env.REDIS_URL);

// My requires
var funcs = require( __dirname + '/common/funcs' );

// Constants
const PAGEDIR = __dirname + '/pages';
const MIN_ID_LENGTH = 2;
const EXTRA_ID_RATIO = 1.4;
const KEY_PREFIX = 'game_';
const KEY_EXPIRY = 20000; // in seconds

// Variables
var demoTeam0 = {
  players: [
    {name:'shark', hp:17, sponge:[6, 12], role:'c', currHP:17},
    {name:'salt', hp:8, sponge:[0], role:'m', currHP:8},
    {name:'angel', hp:12, sponge:[4, 8], currHP:12},
    {name:'siren', hp:10, sponge:[3, 6], currHP:10},
    {name:'greyscales', hp:15, sponge:[5, 10], currHP:15},
    {name:'kraken', hp:20, sponge:[7, 14], currHP:20}
  ],
  bodys: 0,
  goals: 0,
  clocks: 0
};
var demoTeam1 = {
  players: [
    {name:'ox', hp:19, sponge:[6, 12], role:'c', currHP:19},
    {name:'boiler', hp:14, sponge:[5, 10], currHP:14},
    {name:'brisket', hp:12, sponge:[4, 8], currHP:12},
    {name:'princess', hp:10, sponge:[0], role:'m', currHP:10},
    {name:'boar', hp:22, sponge:[7, 14], currHP:22},
    {name:'meathook', hp:14, sponge:[5, 10], currHP:14}
  ],
  bodys: 0,
  goals: 0,
  clocks: 0
};
var remainingDemo = 0;
var analytics = {
  currentGames: 0,
  maxGames: 0
}

app.set( 'port', ( process.env.PORT || 3434 ));
app.set( 'views', __dirname + '/public' );

app.use( express.static( __dirname + '/public' ) );
app.use( express.static( __dirname + '/js' ) );
app.use( express.static( __dirname + '/css' ) );
app.use( express.static( __dirname + '/bootstrap' ) );

// The pages
app.get( '/', function(req, res) {
  if (req.query.analytics) {
    if (req.query.analytics == 'all') {
      res.status(200).json(analytics);
    } else if (typeof analytics[req.query.analytics] != 'undefined') {
      res.status(200).send(analytics[req.query.analytics]);
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendFile(PAGEDIR + '/home.html' );
  }
});

app.post( '/', function(req, res) {
  if (req.body.newGame) {
    // Make a new game
    client.keys( KEY_PREFIX + '*', function(err, reply) {
      if (err) {
        console.log(err);
        res.status(500).json(err);
        return
      }
      var idList = [];
      for (var i = 0; i < reply.length; i++) {
        idList.push(reply[i].replace(KEY_PREFIX, '' ));
      }
      var idExtra = idList.length * EXTRA_ID_RATIO;
      var idLength = MIN_ID_LENGTH;
      while (Math.pow(10, idLength) < idExtra) {
        idLength++;
      }
      /* These values will be one less than the actual number of games
       * (including the demo game) but I want to exclude the demo game
       * from the count so this is working as intended.
      */
      analytics.currentGames = idList.length;
      client.updateMaxGames(analytics.currentGames, function(newMax) {
        analytics.maxGames = newMax;
      });
      console.log( 'Current games: ' + analytics.currentGames); // To be caught by Heroku's Papertrail add-on
      var newID = funcs.generateNewKey(idLength, idList);
      if (newID) {
        client.rpush( KEY_PREFIX + newID, '{}', '{}' );
        res.status(201).json({id:newID});
        client.expire( KEY_PREFIX + newID, KEY_EXPIRY );
      } else {
        console.log( 'Could\'t generate a key' );
        res.status(507).send('All possible keys are taken. Tell Nick you got this message.');
      }
    });
  } else if (req.body.gameID) {
    var teamNum = -1;
    if (req.body.mode == 'host') {
      teamNum = 0;
    } else if (req.body.mode == 'join') {
      teamNum = 1;
    }
    if (teamNum >= 0) {
      client.setTeam(req.body.gameID, teamNum, JSON.parse(req.body.teamObj), function(statusCode,err) {
        res.status(statusCode).send('0');
        client.getTeams(req.body.gameID, function(teamArr) {
          io.to(req.body.gameID).emit( 'broadcastRosters', teamArr);
        });
      });
    }
  } else {
    console.log(req.body);
  }
});

app.get( '/test-cards', function(req, res) {
  res.sendFile(PAGEDIR + '/home.html' );
});

app.get( '/layout-cards', function(req, res) {
  res.sendFile(PAGEDIR + '/layout-cards.html' );
});

app.get( '/test', function(req, res) {
  if (process.env.TEST) {
    res.sendFile(PAGEDIR + '/test.html' );
  } else {
    res.sendFile(PAGEDIR + '/home.html' );
  }
});

app.get( '/managerosters', function(req, res) {
  res.sendFile(PAGEDIR + '/managerosters.html' );
});

app.get( '/play', function(req, res) {
  res.sendFile(PAGEDIR + '/play.html' );
});

app.get( '/play/:id', function(req, res) {
  res.sendFile(PAGEDIR + '/play.html' );
});

app.get( '/spec', function(req, res) {
  res.sendFile(PAGEDIR + '/spec.html' );
});

app.get( '/spec/:id', function(req, res) {
  res.sendFile(PAGEDIR + '/spec.html' );
});

app.get( '/options', function(req, res) {
  res.sendFile(PAGEDIR + '/options.html' );
});

app.get( '/:id', function(req, res) {
  res.sendFile(PAGEDIR + '/game.html' );
});

// Listen
http.listen( app.get( 'port' ), function(){
  console.log( 'listening on : ' + app.get('port') );
});

// Redis client object
client.setTeam = function setTeam(gameID, teamNum, teamObj, callback) {
  if (typeof callback != 'function') {
    callback = function() {}
  }
  if (teamObj && teamObj.players.length >= 3) {
    this.lset(KEY_PREFIX + gameID, teamNum, JSON.stringify(teamObj), function(err, reply) {
      if (err) {
        console.log(err);
        callback(500,err);
        return
      }
      callback(201);
    });
  } else {
    callback(400);
  }
}

client.getTeams = function getTeams(gameID, callback) {
  if (typeof callback != 'function') {
    callback = function() {}
  }
  this.lrange(KEY_PREFIX + gameID, 0, 1, function(err, reply) { // reply should be team array.
    if (err) {
      console.log(err);
      callback(reply,err);
      return
    }
    callback(reply); // reply is team array.
  });
}

client.updateOnePlayer = function updateOnePlayer(gameID, teamNum, playerObj, playerNum) {
  var thisClient = this;
  thisClient.lindex(KEY_PREFIX + gameID, teamNum, function(err, reply) {
    if (err) {
      console.log(err);
      return
    }
    teamObj = JSON.parse(reply);
    teamObj.players[playerNum] = playerObj;
    thisClient.setTeam(gameID, teamNum, teamObj, function() {});
  });
}

client.updateOneScore = function updateOneScore(gameID, teamNum, scoreObj) {
  var thisClient = this;
  thisClient.lindex(KEY_PREFIX + gameID, teamNum, function(err, reply) {
    if (err) {
      console.log(err);
      return
    }
    teamObj = JSON.parse(reply);
    teamObj.goals = scoreObj.goals;
    teamObj.bodys = scoreObj.bodys;
    teamObj.clocks = scoreObj.clocks;
    thisClient.setTeam(gameID, teamNum, teamObj, function() {});
  });
}

client.updateMaxGames = function updateMaxGames(currentGames, callback) {
  if (typeof callback != 'function') {
    callback = function() {}
  }
  var thisClient = this;
  var keyName = 'analytics_maxgames';
  thisClient.get(keyName, function(err, reply) {
    if (err) {
      console.log(err);
      return
    }
    var dbMax = parseInt(reply) || 0;
    var newMax = Math.max(currentGames, dbMax);
    callback(newMax);
    thisClient.set(keyName, newMax);
  });
}

client.on( 'ready', function() {
  console.log( 'Connected to Redis server' );
  createDemos(this);
  this.updateMaxGames(analytics.currentGames);
});

// Demos
// Create demos on the server if they don't exist
function createDemos(thisClient) {
  // delete all demos (if they exist) first.
  thisClient.del(KEY_PREFIX + '0001', function() {
    //console.log( 'Deleted old demo key' );
    thisClient.rpush( KEY_PREFIX + '0001', JSON.stringify(demoTeam0), JSON.stringify(demoTeam1), function() {
      //console.log( 'Created demo key' );
    });
  })
}

function omniDemo() {
  client.getTeams( '0001', function(teamArr) {
    var teamJSON2 = JSON.stringify();
    io.to('0001').emit( 'broadcastRosters', ['{}', teamArr[1]]);
    var timesToChange = 50;
    var initialDelay = 750;
    var initialDelay2 = 500;
    setTimeout(function() {
      io.to('0001').emit( 'broadcastRosters', teamArr);
    }, initialDelay);
    if (remainingDemo) {
      remainingDemo += timesToChange;
    } else {
      remainingDemo = timesToChange;
      setTimeout(changeDemoHP, initialDelay + initialDelay2);
    }
  });
}

function changeDemoHP() {
  remainingDemo--;
  var playerNum = funcs.getRandomInt(0, 6);
  var playerObj = demoTeam0.players[playerNum];
  playerObj.currHP = funcs.getRandomInt(0, playerObj.hp + 1);
  var currentPlayer = {};
  currentPlayer.id = '' + playerNum + 'M_' + playerObj.name;
  currentPlayer.num = playerNum;
  io.to('0001').emit( 'onePlayerToClient', playerObj, currentPlayer, ['host']);
  client.updateOnePlayer( '0001', 0, playerObj, playerNum);
  var delay = 2357;
  if (remainingDemo) {
    setTimeout(changeDemoHP, delay);
  }
}

// Socket.IO stuff
io.on( 'connection', function(socket) {
  var room = false;
  socket.on( 'joinRoom', function(roomReq) {
    room = roomReq;
    if (room == 'demo' ) {
      omniDemo();
      room = '0001';
    }
    socket.join(room);
  });
  
  socket.on( 'joinGame', function(mode) {
    if (!room) {
      io.to(socket.id).emit( 'reconnect' );
      return
    }
    client.getTeams(room, function(teamArr) {
      io.to(room).emit( 'broadcastRosters', teamArr);
    });
  });
  
  socket.on( 'resyncRosterToServer', function(teamObj, mode) {
    if (!room) {
      io.to(socket.id).emit( 'reconnect' );
      return
    };
    var teamNum = 1;
    if (mode == 'host') {
      teamNum = 0;
    }
    client.setTeam(room, teamNum, teamObj, function() {
      client.getTeams(room, function(teamArr) {
        io.to(room).emit( 'resyncRosterToClient', teamArr);
      });
    });
    if (mode == 'spec') {
      client.getTeams(room, function(teamArr) {
        io.to(room).emit( 'resyncRosterToClient', teamArr);
      });
    }
  });
  
  socket.on( 'onePlayerToServer', function(playerObj, currentPlayer, mode) {
    if (!room) {
      io.to(socket.id).emit( 'reconnect' );
      return
    };
    io.to(room).emit( 'onePlayerToClient', playerObj, currentPlayer, mode);
    var teamNum = 1;
    if (mode == 'host') {
      teamNum = 0;
    }
    client.updateOnePlayer(room, teamNum, playerObj, currentPlayer.num);
  });
  
  socket.on( 'scoreToServer', function(scoreObj, mode) {
    if (!room) {
      io.to(socket.id).emit( 'reconnect' );
      return
    };
    io.to(room).emit( 'scoreToClient', scoreObj, mode);
    var teamNum = 1;
    if (mode == 'host') {
      teamNum = 0;
    }
    client.updateOneScore(room, teamNum, scoreObj);
  });
});

// log redis errors.
client.on( 'error', function (err) {
    console.log( 'Redis error: ' + err);
});

//~ client.set('test', 'onetwo');
//~ client.get('test', function(err, reply) {
  //~ console.log(reply);
//~ });
