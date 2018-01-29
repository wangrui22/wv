const express = require('express');
const consolidate = require('consolidate');
const bodyParser = require('body-parser');
const net = require('net');

let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
http.listen(8080);

let imgServerHost = '127.0.0.1';
let imgServerPort = 8001;
if(process.argv.length == 3) {
    imgServerPort = process.argv[2];
} else if (process.argv.length == 4) {
    imgServerHost = process.argv[2];
    imgServerPort = process.argv[3];
}
console.log('image server: ' + imgServerHost + ':' + imgServerPort);

//web server
app.engine('html', consolidate.ejs);
app.set('views', './views');
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('./www'));

let router = express.Router();
app.use('/', router);

router.get('/' , function(req,res) {
    res.render('index'); 
});

//socket io
io.on('connection', function(socket){
    console.log('a user connected');

    //TCP client
    let client = new net.Socket();
    client.connect(imgServerPort, imgServerHost, function() {
        console.log('connect image server success.');
    });

    client.on('data', function(data){
        console.log('data stream >>>');
        socket.emit('data', data);
    });
    
    client.on('end', function(data){
        console.log('disconnect image server connection success.');
    });

    socket.on('message', function(json) {
        console.log(json);
        //image request
        if (json.id == 1 ) {
            let buffer = new Buffer(16);
            buffer.writeIntLE(1,0,4);
            buffer.writeIntLE(parseInt(json.page),8,4);
            client.write(buffer);
            
            console.log('request image');
        }
    });

    socket.on('disconnect', function() {
        //disconnect  
        client.destroy();
    });
});