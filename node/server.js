const express = require('express');
const consolidate = require('consolidate');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
let app = express();
let server = require
app.listen(8080);

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