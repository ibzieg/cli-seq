var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const http = require('http');


const expressWs = require('express-ws');
const app = express();

const port = require("./port");

app.set('port', port);

const server = http.createServer(app);
const wsInstance = expressWs(app, server);

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
const sequencerRouter = require("./routes/sequencer");



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sequencer', sequencerRouter);

/*app.ws('/echo', (ws, req) => {
    ws.on('message', msg => {
        ws.send(msg)
    });

    ws.on('close', () => {
        console.log('WebSocket was closed')
    });
});*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = server;
