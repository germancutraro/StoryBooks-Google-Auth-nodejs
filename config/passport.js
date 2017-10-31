const GoogleStrategy = require('passport-google-oauth20');
const mongoose = require('mongoose');
const {googleClientId, googleClientSecret} = require('./keys');

// load user model
const User = require('../models/User');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy({
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    }, (accessToken, refreshToken, profile, done) => {

        const image = profile.photos[0].value.substring(0, profile.photos[0].value.indexOf('?')); // cut the queryString

        let newUser = new User({
          googleID: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          image
        });

        User.findOne({googleID: profile.id}).then(user => {
          if (user)
            done(null, user);
          else
            newUser.save().then(user => done(null, user));
        }).catch(err => console.log(err))
    })
  )

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => done(null, user));
  });
} // end function
