var express = require('express');
var app = express();
var server = require('http').createServer(app);
var webRTC = require('webrtc.io').listen(server);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.enable('view cache');
app.engine('html', require('hogan-express'));

app.locals.pubnub_key = process.env.PUBNUB_SUBSCRIBE_KEY;
app.locals.pubnub_publish_key = process.env.PUBNUB_PUBLISH_KEY;

app.use('/public', express.static(__dirname + '/public'));
app.get('/favicon.ico', function(req,res) {
    res.sendfile(__dirname + '/public/favicon.ico');
});

var port = process.env.PORT || 5000;
server.listen(port);



app.get('/', function(req, res) {
    res.render('index');
});

app.get('/music/sender', function(req,res){
    res.render('sender', {layout: 'layouts/music'});
});

app.get('/music/receiver', function(req,res){
    res.render('receiver', {layout: 'layouts/music'});
});

app.get('/kaltura/spoofer', function(req,res){
    res.render('spoofer', {layout: 'layouts/kaltura'});
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