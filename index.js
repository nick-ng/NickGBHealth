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
      console.log(idList);
      var newID = funcs.generateNewKey(ID_LENGTH, idList);
      if (newID) {
        client.rpush( KEY_PREFIX + newID, '[]', '[]' );
        res.status(201).json({id:newID});
        client.expire( KEY_PREFIX + newID, KEY_EXPIRY );
      } else {
        console.log('Could\'t generate a key');
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
  //~ console.log('params - id');
  //~ console.log(req.params);
  //~ console.log('query - id');
  //~ console.log(req.query);
});

// Listen
http.listen( app.get( 'port' ), function(){
  console.log( 'listening on : ' + app.get('port') );
});

// Extend client. object
client.setTeam = function setTeam(gameID, teamNum, teamObj, callback) {
  if (teamObj) {
    this.lset( KEY_PREFIX + gameID, teamNum, JSON.stringify(teamObj), function(err, reply) {
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
  this.lrange( KEY_PREFIX + gameID, 0, 1, function(err, reply) {
    if (err) {
      console.log(err);
      return
    }
    callback(reply);
  });
}

// Socket.IO stuff
io.on( 'connection', function( socket ) {
  var room;
  socket.on( 'joinRoom', function(roomReq) {
    //console.log('Joined room');
    room = roomReq;
    socket.join(room);
  });
  
  socket.on( 'joinGame', function(teamObj, mode) {
    if (mode == 'host') {
      // put teamObj into slot 0
      client.setTeam(room, 0, teamObj, function() {
        // get both team objects from the game. In callback so your team object is definitely added before you get it.
        client.getTeams(room, function(teamArr) {
          io.to(room).emit( 'broadcastRosters', teamArr);
        });
      });
    } else if (mode == 'join') {
      // put teamObj into slot 1
      client.setTeam(room, 1, teamObj, function() {
        // get both team objects from the game. In callback so your team object is definitely added before you get it.
        client.getTeams(room, function(teamArr) {
          io.to(room).emit( 'broadcastRosters', teamArr);
        });
      });
    } else { // spectator mode.
    }
    teamArr = ['[]','[]'];
    //io.to(room).emit( 'broadcastRosters', teamArr);
  });
  
  socket.on( 'updateOnePlayer', function(playerObj, objFromID, mode) {
    if (mode == 'host') {
      // 0
    } else { // Has to be join
      // 1
    }
  });

  // Test functions
  socket.on( 'testA', function (testObj) {
    //~ console.log('testA socket received');
    io.to(socket.id).emit( 'testB', 'hello' );
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
