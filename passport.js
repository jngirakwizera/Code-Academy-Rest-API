// Imports for the Passport libraries and Person, which contains the password authentication code
import User from './user.js';
import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT from 'passport-jwt';

// expose various aspects of the Passport in order the make use of its code
const JWTStrategy = passportJWT.Strategy;
const LocalStrategy = passportLocal.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// First, configure Passport to use the Local Strategy for authentication (i.e.: the username and password known to this system)
passport.use(new LocalStrategy({
    usernameField: "email_address",
    passwordField: "password"
},
// in addition to providing the above JSON object telling which fields are for authentication, you have to provide
// a function that will actually handle the authentication process
async function(email, password, callback) {
    // actually check the Person's password and username
    try {
        let thePersonDocs = await User.read({ email_address: email });
        let thePersonDoc = thePersonDocs[0];
        let authresult = await User.authenticate(password, thePersonDoc);
        // authresult will be true or false: true if username and password are good, false otherwise
        if(authresult) {
            // login's good.
            // call the next middle callback and pass it the object representing the logged in Person.
            return callback(null, thePersonDoc, { message: "The Person logged in successfully." });
        } else {
            // login attempt failed.
            return callback(null, false, { message: "Incorrect username or password." });
        }
    } catch (err) {
        console.log(err);
        (err) => callback(err);
    }
}
));

// Now config Passport to verify any generated JWTs
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'ThisNeedsToBeAStrongPasswordPleaseChange' // I recommend that you use a key, instead of a password.
},
// Provide a function that will verify any JWT
function (JWT, callback) {
    // do any additoinal checking here in this function, if needed.
    // in this case, no other checks are being performed, but you might want to consider other possible checks.
    return callback(null, JWT);
}
));