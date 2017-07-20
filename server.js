/**
 * Created by devdeepak on 18/7/17.
 */
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);

var socket = require('socket.io');
var io = socket(server);

var users = [];
var connections = [];
var messages = [];

app.use('/',express.static('public'));
server.listen(process.env.PORT || 3000);
console.log('Server running on port 3000...');
app.get('/', function (req,res) {
   res.sendFile(__dirname + '/index.html');

});

io.on('connection', function(socket){
   connections.push(socket);
   console.log('Connected: %s sockets connected', connections.length);

   socket.on('disconnect',function (data) {

        users.splice(users.indexOf(socket.username),1);
        updateUsernames();
       connections.splice(connections.indexOf(socket),1);
       console.log('A socket disconnected: %s sockets connected', connections.length);
   });
   socket.on('send message', function (data) {
      io.sockets.emit('new message',{msg: data, user: socket.username});
       messages.push({msg: data, user: socket.username}) ;


   });

   //New User
    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);

        updateUsernames();
    });
    socket.emit('all',messages);


    function updateUsernames() {
        io.sockets.emit('get users', users);
    }

});