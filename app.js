const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compileSass = require('express-compile-sass');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const config = require('./config/main');
const whitelistRoutes = config.whitelistRoutes;
const {skipRoutes, getEmailFromSession} = require('./lib/helpers')
const index = require('./routes/index');
const users = require('./routes/users');

const app = express();

app.locals.config = config;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compileSass({
    root: process.cwd(),
    sourceMap: false, // Includes Base64 encoded source maps in output css
    sourceComments: false, // Includes source comments in output css
    watchFiles: true, // Watches sass files and updates mtime on main files for each change
    logToConsole: true // If true, will log to console.error on errors
}));

app.use(session({
  secret: config.cookieSecret,
  cookie: { maxAge: config.cookieMaxAge },
  store: new RedisStore()
}));

app.use(skipRoutes(whitelistRoutes, redirectAnonymous));

app.use((req, _, next) => {
  app.locals.email = req.email = getEmailFromSession(req);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

function redirectAnonymous(req, res, next) {
  if (getEmailFromSession(req)) {
    next();
  } else {
    res.redirect('/users/auth');
  }
}

module.exports = app;
