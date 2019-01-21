'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const nocache = require('nocache');
const jwt = require('jsonwebtoken');
const rp = require('request-promise');

// Simple configuration based on environment variables
var port = process.env.APP_PORT || 4000;

if (!process.env.JWT_ISS) {
    console.error('Missing JWT_ISS environment variable. To provide a value one can run the following command on the same shell where node is being executed:');
    console.error('   export JWT_ISS=.......<Guest Issuer ID>...........');
    process.exit(1);
}

if (!process.env.JWT_KEY) {
    console.error('Missing JWT_KEY environment variable. To provide a value one can run the following command on the same shell where node is being executed:');
    console.error('   export JWT_KEY=........<Shared Secret>..........');
    process.exit(1);
}

const jwt_iss = process.env.JWT_ISS;
const jwt_key = Buffer.from(process.env.JWT_KEY, 'base64');

// Configure ExpressJS application
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json({ strict: false }));
app.use(nocache());

// API for creating a guest and adding it to the demo space (uses external call for that)
app.post('/api/v1/guest', async (req, res) => {
    const { sub, name } = req.body;

    console.log('GUEST: new request for', sub, name);

    var tokenJson = {
      iss: jwt_iss,
      sub: sub,
      name: name,
      exp: Math.floor(Date.now() / 1000) + (60 * 60)
    };
    
    // Compose & sign the JWT token
    var tokenJwt = jwt.sign(tokenJson, jwt_key);

    try {
        // Get the Demo Room ID using the bot's API created for this demo
        console.log('GUEST: retrieving the demo room ID');
        var demoRoomResponse = await rp({
            method: 'GET',
            uri: 'https://api.guest.training/v1/demoRoom',
            json: true
        });
        var roomId = demoRoomResponse.roomId;

        // Exchange the JWT token for an OAuth token from Webex CI
        console.log('GUEST: logging in guest');
        var loginResponse = await rp({
            method: 'POST',
            uri: 'https://api.ciscospark.com/v1/jwt/login',
            headers: { Authorization: 'Bearer ' + tokenJwt },
            json: true
        });

        // Retrieve guest persons' ID (needed in the next step)
        console.log('GUEST: obtaining guest persons details');
        var personDetails = await rp({
            method: 'GET',
            uri: 'https://api.ciscospark.com/v1/people/me',
            headers: { Authorization: 'Bearer ' + loginResponse.token },
            json: true
        });

        // Ask the bot to add the guest person to the demo room
        console.log('GUEST: adding guest person to demo room');
        try {
            await rp({
                method: 'POST',
                uri: 'https://api.guest.training/v1/demoRoom',
                body: { userId: personDetails.id },
                json: true
            })
        } catch (e) {
            if (e.statusCode != 409) throw e; // 409 means the user is already in the space, re-throw other errors
        }

        console.log('GUEST: request handled');
        res.send({
            userId: personDetails.id,
            roomId: roomId,
            token: tokenJwt
        });
    } catch (e) {
        res.status(e.statusCode).send(e.error);
    }
});

app.listen(port);
console.log('Open http://localhost:' + port + ' in Chrome');