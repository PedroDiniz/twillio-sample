const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const { videoToken } = require('./tokens');
const Twilio = require('twilio');
const {v4: uuidv4} = require('uuid');

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

const getRoom = async (rooms) => {
    const roomUniqueName = rooms.uniqueName
    const roomSid = rooms.sid
    return await client.video.rooms(roomSid).participants
        .list({status: 'connected'}, (error, participants) => {
            if (participants.length < 3) {
                return roomUniqueName
            }
            createRoom().then((response)=>{
                return response
            });
        });
}

const createRoom = async () => {
    const uid = uuidv4();
    return await client.video.rooms
        .create({
            recordParticipantsOnConnect: true,
            type: 'group-small',
            uniqueName: uid
        })
        .then((room) => {
                return {uniqueName: room.uniqueName, sid: room.sid}
            }
        )
        .catch(console.log)
}

// Main method
app.get('/getMeARoom', (req, res) => {
    return client.video.rooms.list({status: "in-progress",})
        .then(rooms => {
                const availableRoom = rooms.find(({sid, uniqueName}) => getRoom({sid, uniqueName}));
                if (availableRoom) {
                    res.send({uniqueName: availableRoom.uniqueName, sid: availableRoom.sid})
                }
            }
        );
});

app.get('/killRoom', (req, res) => {
    const sid = req.query.sid;
    return client.video.rooms(sid)
        .update({status: 'completed'})
        .then(room => res.send(room.uniqueName));
})

app.listen(3001, () =>
    console.log('Express server is running on localhost:3001')
);
