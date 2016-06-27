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

var PAGEDIR = __dirname + '/pages';

// Constants
const ID_LENGTH = 6;
const KEY_PREFIX = 'game_';
const KEY_EXPIRY = 9001; // in seconds

app.set( 'port', ( process.env.PORT || 3434 ));
app.set( 'views', __dirname + '/public' );

app.use( express.static( __dirname + '/public' ) );
app.use( express.static( __dirname + '/js' ) );
app.use( express.static( __dirname + '/css' ) );
app.use( express.static( __dirname + '/bootstrap' ) );

// The pages
app.get( '/', function(req, res) {
  res.sendFile(PAGEDIR + '/home.html' );
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
      var newID = funcs.generateNewKey(ID_LENGTH, idList);
      if (newID) {
        client.rpush( KEY_PREFIX + newID, '[]', '[]' );
        res.status(201).json({id:newID});
        client.expire( KEY_PREFIX + newID, KEY_EXPIRY );
      } else {
        console.log( 'Could\'t generate a key' );
        res.status(507).send('All possible keys are taken. Tell Nick you got this message.');
      }
    });
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

app.get( '/:id', function(req, res) {
  res.sendFile(PAGEDIR + '/game.html' );
});

// Listen
http.listen( app.get( 'port' ), function(){
  console.log( 'listening on : ' + app.get('port') );
});

// Extend client. object
client.setTeam = function setTeam(gameID, teamNum, teamObj, callback) {
  if (teamObj && teamObj.length >= 3) {
    this.lset(KEY_PREFIX + gameID, teamNum, JSON.stringify(teamObj), function(err, reply) {
      if (err) {
        console.log(err);
        return
      }
      callback();
    });
  } else {
    callback();
  }
}

client.getTeams = function setTeams(gameID, callback) {
  this.lrange(KEY_PREFIX + gameID, 0, 1, function(err, reply) {
    if (err) {
      console.log(err);
      return
    }
    callback(reply);
  });
}

client.updateOnePlayer = function updateOnePlayer(gameID, teamNum, playerObj, playerNum) {
  thisClient = this;
  thisClient.lindex(KEY_PREFIX + gameID, teamNum, function(err, reply) {
    if (err) {
      console.log(err);
      return
    }
    teamArr = JSON.parse(reply);
    teamArr[playerNum] = playerObj;
    thisClient.setTeam(gameID, teamNum, teamArr, function() {});
  });
}

// Socket.IO stuff
io.on( 'connection', function(socket) {
  var room = false;
  socket.on( 'joinRoom', function(roomReq) {
    room = roomReq;
    socket.join(room);
  });
  
  socket.on( 'joinGame', function(teamObj, mode) {
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
        io.to(room).emit( 'broadcastRosters', teamArr);
      });
    });
    if (mode == 'spec') {
      client.getTeams(room, function(teamArr) {
        io.to(room).emit( 'broadcastRosters', teamArr);
      });
    }
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
    io.to(room).emit( 'onePlayerToClient', playerObj, currentPlayer);
    var teamNum = 1;
    if (mode == 'host') {
      teamNum = 0;
    }
    client.updateOnePlayer(room, teamNum, playerObj, currentPlayer.num);
  });
});

// log redis errors.
client.on("error", function (err) {
    console.log("Redis error: " + err);
});

//~ client.set('test', 'onetwo');
//~ client.get('test', function(err, reply) {
  //~ console.log(reply);
//~ });
