const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, callback) => {
    console.log('test passport.js');
    console.log(username + ' ' + password);
    foundUser = await Users.findOne({ Username: username });
    console.log(foundUser);
    if (!foundUser) {
        return callback(null, false, { message: 'Incorrect username.' });
    } if (!foundUser.validatePassword(password)) {
      console.log('incorrect password');
      return callback(null, false, {message: 'Incorrect password.'});
    } else {
        return callback(null, foundUser);
    }
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, async (jwtPayload, callback) => {
    tokens = await Users.findById(jwtPayload._id);
        if(tokens)
        return callback(null, tokens);
        else {
        return callback(error);
        }
}));