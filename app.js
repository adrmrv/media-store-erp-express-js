var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var artistRouter = require('./routes/artist');
var genreRouter = require('./routes/genre');
var mediaRouter = require('./routes/media');
var albumRouter = require('./routes/album');
var trackRouter = require('./routes/track');

var db = require('./database')

const session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
  resave: false 
}));

app.use('/', indexRouter);
app.use('/', artistRouter);
app.use('/', genreRouter);
app.use('/', mediaRouter);
app.use('/', albumRouter);
app.use('/', trackRouter);
app.use('/', require('./routes/customer'));
app.use('/', require('./routes/employee'));
app.use('/', require('./routes/invoice'));

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

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

module.exports = app;
