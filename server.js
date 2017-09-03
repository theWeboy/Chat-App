/**
 * Created by devdeepak on 18/7/17.
 */
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);

var socket = require('socket.io');
var io = socket(server);

var users = {};
var connections = [];
var messages = [];
var disc = {};

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
        delete users[socket.username];
        // users.splice(users.indexOf(socket.username),1);
        disc.d = socket.username;
        userDisconnected();
        console.log(disc);
        updateUsernames();
       connections.splice(connections.indexOf(socket),1);
       console.log('A socket disconnected: %s sockets connected', connections.length);
   });
   socket.on('send message', function (data,callback) {
       var ms = data.trim();
       if(ms.substr(0,3)==='/w ') {
           ms = ms.substr(3);
           var ind = ms.indexOf(' ');
           if (ind !== -1) {
               var name = ms.substring(0, ind);
               ms = ms.substring(ind + 1);
               if (name in users) {
                   users[name].emit('whisper', {msg: ms, user: socket.username});
                   socket.emit('whisper', {msg: ms, user: socket.username});
               } else {
                   callback('Error! Please enter a valid user');
               }
           } else {
               callback('Error! Please enter a message for your whisper');
           }
       }
       else{
           io.sockets.emit('new message',{msg: data, user: socket.username});
           messages.push({msg: data, user: socket.username}) ;
           }

   });

   //New User
    socket.on('new user', function (data, callback) {
        if(data in users){
            callback({us : '',bool : false});
        }else {
        callback({us : data, bool: true});
        socket.username = data;
        users[socket.username] = socket;
        updateUsernames();}
    });

    socket.emit('all',messages);

    function userDisconnected() {
        console.log("userdisc function working");
        io.sockets.emit('discon', disc);

    }

    function updateUsernames() {
        io.sockets.emit('get users', Object.keys(users));
    }

});