const mongoose = require('mongoose');
const {mongoURI} = require('../config/keys');
// map global promises
mongoose.Promise = global.Promise;
// connection
mongoose.connect(mongoURI, {useMongoClient: true});
// see if we can connect
mongoose.connection
  .once('open', () => console.info('Connected to the database!'))
  .on('error', err => console.info('Error with the database: ', err));
