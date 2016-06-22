// Requires
// People's requires
var express = require( 'express' ); var app = express();
var fs = require( 'fs' );
var http = require( 'http' ).Server( app );
var io = require( 'socket.io' )( http );

var PAGEDIR = __dirname + '/pages';

app.set( 'port', ( process.env.PORT || 3434 ));
app.set( 'views', __dirname + '/public' );

app.use( express.static( __dirname + '/public' ) );
app.use( express.static( __dirname + '/js' ) );
app.use( express.static( __dirname + '/css' ) );
app.use( express.static( __dirname + '/bootstrap' ) );

// The pages
app.get( '/', function( req, res ) {
  res.sendFile(PAGEDIR + '/home.html' );
  //~ console.log('query - root');
  //~ console.log(req.query);
});

app.get( '/managerosters', function( req, res ) {
  res.sendFile(PAGEDIR + '/managerosters.html' );
});

app.get( '/:id', function( req, res ) {
  res.sendFile(PAGEDIR + '/home.html');
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
