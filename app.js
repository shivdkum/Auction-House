'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require("morgan");
var https = require('https');
var fs = require('fs');
var http = require('http');
var privateKey = fs.readFileSync('C:/Users/shraamanar/source/repos/ExpressApp2/ExpressApp2/public/server.key', 'utf8');
var certificate = fs.readFileSync('C:/Users/shraamanar/source/repos/ExpressApp2/ExpressApp2/public/server.cert', 'utf8');
var credentials = { key: privateKey, cert: certificate };
var config = require('./config/main');
var jwt = require('jsonwebtoken');
var User = require('./models/user');
var passport = require('passport');



var routes = require('./routes/index');
var users = require('./routes/users');
var products = require('./routes/product');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//MongoDB Connection

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect(config.database)
    .then(() => console.log('connection succesful'))
    .catch((err) => console.error(err));

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});
// Routes which should handle requests
app.use('/', routes);
app.use('/users', users);
app.use('/products', products);

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

// Intialize passport for use

app.use(passport.initialize());

// Bring in Passport Strategy we defined

require('./config/passport')(passport);

app.set('port', process.env.PORT || 3000);

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpsServer.listen(3030);
httpServer.listen(8080);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
