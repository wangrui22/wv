const express = require('express');
const consolidate = require('consolidate');
const bodyParser = require('body-parser');
const net = require('net');

let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
http.listen(8080);

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

    let client = net.createConnection({host:"127.0.0.1", port:1234}, function() {
        console.log('tcp connect success.');
    });

    client.on('data', function(data){
        console.log('data stream >>>>');
        socket.emit('data', data);
    });
    
    client.on('end', function(data){
        console.log('close connection.');
    });

    socket.on('message', function(json) {
        console.log(json);
        //image request
        if (json.id == 1 ) {
            let buffer = new Buffer(16);
            buffer.writeIntLE(1,0,4);
            client.write(buffer);
            console.log('client write');
        }
    });
});

