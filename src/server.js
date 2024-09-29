import express from 'express'
import { config } from 'dotenv';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import session from 'express-session';
import { buildUrl, Client } from 'osu-web.js';
import pgPromise from 'pg-promise';
import cors from 'cors';
import bodyParser from 'body-parser';

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

app.use(cors({
    credentials: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Server online')
})

app.get('/test', (req,res) => {
    console.log('test fetch received')
    res.send({test: 'test'})
})

app.use(session({
    secret: process.env.COOKIE_KEY,
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
    scope: ['identify', 'public'],
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
    // req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000;
    res.redirect('http://localhost:4200/')
})

/**
 * Prevents non logged in users from accessing these APIs
 */
app.use((req, res, next) => {
    if (req.user) next()
    else res.sendStatus(401);
  })

app.get('/getSelf', (req,res) => {
    let api = new Client(req.user.token);
    api.users.getSelf().then(userResponse => {
        res.send({
            username: userResponse.username,
            id: userResponse.id
        })
    })
})

app.post('/tournament/register', (req,res) => {
    let api = new Client(req.user.token);
    api.users.getSelf().then(userResponse => {
        db.none('INSERT INTO players(player_id, username) VALUES(${id}, ${username})', {
            id: userResponse.id,
            username: userResponse.username
        })
        .then( () => {
            res.sendStatus(201)
        })
        .catch( error => {
            res.send(error);
            res.status(400);
        })
    })
    .catch( error => {
        res.status(401);
    })
})


app.listen(process.env.PORT, () => console.log(`Server up at http://localhost:${process.env.PORT}/`))