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
    client.smembers( 'allgames', function(err, reply) {
      if (err) {
        console.log(err);
        res.status(500).json(err);
        return
      }
      var newID = funcs.generateNewKey(ID_LENGTH, reply);
      if (newID) {
        res.status(201).json({id:newID});
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

app.get( '/host/:id', function(req, res) {
  res.sendFile(PAGEDIR + '/game.html' );
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

// Socket.IO stuff
io.on( 'connection', function( socket ) {
  socket.on( 'joinRoom', function(room) {
    //console.log('Joined room');
    socket.join(room);
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
