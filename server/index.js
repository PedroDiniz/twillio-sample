const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const { videoToken } = require('./tokens');
const Twilio = require('twilio');

const apiKeySid = process.env.TWILIO_API_KEY;
const apiKeySecret = process.env.TWILIO_API_SECRET;
const accountSid = process.env.TWILIO_ACCOUNT_SID;

const client = new Twilio(apiKeySid, apiKeySecret, {accountSid: accountSid});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);

const sendTokenResponse = (token, res) => {
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
};

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

app.get('/video/token', (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);

});
app.post('/video/token', (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

app.get('/listUsersInRoom', (req, res) => {
  const room = req.query.room;
  const participants = [];
  return client.video.rooms(room).participants
      .each({status: 'connected'},  async (participant) => {
        participants.push(participant.sid);
        res.setHeader('Content-Type', 'application/json');
        return await res.send(participants)
      });
});

app.get('/getMeARoom', (req, res) => {
    const uniqueName = 'SmallDailyStandup338zzz44aokkkosdd5r0o';
    res.setHeader('Content-Type', 'application/json');
    return client.video.rooms
        .create({
            recordParticipantsOnConnect: true,
            type: 'group-small',
            uniqueName
        })
        .then(() => {
            res.send({uniqueName});}
            )
        .catch(console.log)
});

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
