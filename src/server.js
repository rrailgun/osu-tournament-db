import express from 'express'
import { config } from 'dotenv';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import session from 'express-session';
config();

const app = express();
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));
app.use(passport.session())

passport.use(new OAuth2Strategy({
    authorizationURL: 'https://osu.ppy.sh/oauth/authorize',
    tokenURL: 'https://osu.ppy.sh/oauth/token',
    clientID: process.env.OSU_CLIENT_ID,
    clientSecret: process.env.OSU_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/cb"
  },
  function(_accessToken, _refreshToken, profile, cb) {
    return cb(null, {
        token: _accessToken,
        username: 'test'
    });
  }
));

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        'token': user.token,
        'username': user.username
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        console.log(user);
      return cb(null, user);
    });
  });

app.get('/', (req,res) => {
    res.send('Server online')
})

app.get('/auth', passport.authenticate('oauth2'))

app.get('/auth/cb', passport.authenticate('oauth2', { failureRedirect: '/' }), (req,res) => {
    res.send('Logged in as '+req.user.username)
})

app.listen(process.env.PORT, () => console.log('Server up at http://localhost:3000/'))