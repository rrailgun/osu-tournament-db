import express from 'express'
import { config } from 'dotenv';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import session from 'express-session';
import { Client } from 'osu-web.js';
import pgPromise from 'pg-promise';

config();
const pgp = pgPromise();
const db = pgp({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})
const app = express();
app.use(session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));
app.use(passport.session())

passport.use(new OAuth2Strategy({
    authorizationURL: 'https://osu.ppy.sh/oauth/authorize',
    tokenURL: 'https://osu.ppy.sh/oauth/token',
    clientID: process.env.OSU_CLIENT_ID,
    clientSecret: process.env.OSU_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/cb"
},
    function (_accessToken, _refreshToken, profile, cb) {
        let api = new Client(_accessToken);
        api.users.getSelf().then(res => {
            return cb(null, {
                token: _accessToken,
                refreshToken: _refreshToken,
                username: res.username
            });
        })
    }
));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

app.get('/auth', passport.authenticate('oauth2'))

app.get('/auth/cb', passport.authenticate('oauth2', { failureRedirect: '/' }), (req, res) => {
    res.send('Logged in as ' + req.user.username)
})

/**
 * Redirect unauthorized users to sign in
 */
app.use((req, res, next) => {
    if (req.user) next()
    else res.redirect('/auth')
  })

app.get('/', (req, res) => {
    res.send('Server online')
})

app.post('/tournament/register', (req,res) => {
    let api = new Client(req.user.token);
    api.users.getSelf().then(userResponse => {
        db.none('INSERT INTO players(player_id, username) VALUES(${id}, ${username})', {
            id: userResponse.username,
            username: userResponse.id
        })
        .then( () => res.sendStatus(201))
        .catch( error => {
            res.send(error);
            res.status(400);
        })
    })
    .catch( error => {
        res.status(401);
        res.redirect('/auth')
    })
})


app.listen(process.env.PORT, () => console.log('Server up at http://localhost:3000/'))