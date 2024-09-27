import express, { Express, Request, Response } from 'express'
import OsuStrategy from 'passport-osu';
import { config } from 'dotenv';
import passport from 'passport';
config();

const app: Express = express();

app.get('/', (req,res) => {
    res.send('Server online')
})

app.listen(process.env.PORT, () => console.log('Server up at http://127.0.0.1:3000/'))