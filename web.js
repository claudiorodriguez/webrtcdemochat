var express = require('express');
var app = express();
var server = require('http').createServer(app);
var webRTC = require('webrtc.io').listen(server);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.enable('view cache');
app.engine('html', require('hogan-express'));

app.use('/public', express.static(__dirname + '/public'));

var port = process.env.PORT || 8080;
server.listen(port);



app.get('/', function(req, res) {
    res.render('index');
});


webRTC.rtc.on('chat_msg', function(data, socket) {
    var roomList = webRTC.rtc.rooms[data.room] || [];

    for (var i = 0; i < roomList.length; i++) {
        var socketId = roomList[i];

        if (socketId !== socket.id) {
            var soc = webRTC.rtc.getSocket(socketId);

            if (soc) {
                soc.send(JSON.stringify({
                    "eventName": "receive_chat_msg",
                    "data": {
                        "messages": data.messages,
                        "color": data.color
                    }
                }), function(error) {
                    if (error) {
                        console.log(error);
                    }
                });
            }
        }
    }
});