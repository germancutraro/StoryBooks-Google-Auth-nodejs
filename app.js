const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const exphbs = require('express-handlebars');
// init app
const app = express();
// conf files
const {port} = require('./config');
require('./libs/db-connection');
require('./config/passport')(passport);
const {mongoURI} = require('./config/keys');
// hbs helpers
const {truncate, stripTags, formatDate, select, editIcon} = require('./libs/hbs');
// set engine
app.engine('.hbs', exphbs({
helpers: {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
},
defaultLayout: 'main',
extname: '.hbs'
}));
app.set('view engine', 'hbs');
// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(session({
  secret: 'abc123',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ // Persisting Sessions
    mongooseConnection: mongoose.connection,
    url: mongoURI,
    autoReconnect: true
  })
}));
// Passport middlewares
app.use(passport.initialize());
app.use(passport.session());
// Global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));
// run
app.listen(port, err => console.log(err ? `Error on port ${port}, ${err}` : `App running on port ${port}`));
