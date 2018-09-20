const expressWs = require('express-ws');
const express = require('express');
const router = express.Router();

//const app = require("../app");

//const wsInstance = expressWs(app);

let data = null;

process.on('message', (message) => {
    data = message.state;
    try {
        broadcast(data);
    } catch (ex) {
        console.log(ex);
    }
});



let wsClients = new Map();

let getSerializedData = function() {
    return JSON.stringify(data);
}

let broadcast = function broadcast(data) {
/*    wsInstance.getWss().clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });*/

    wsClients.forEach((value, key, map) => {
        value.send(getSerializedData());
    })
};

router.ws('/state', (ws, req) => {
    console.log(`ws connected`);
    wsClients.set(ws, ws);

    ws.on('message', msg => {
        //ws.send(msg)
    });

    ws.on('close', () => {
        console.log('WebSocket was closed');
        wsClients.delete(ws);
    });

    ws.send(getSerializedData());
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send(data);
});

module.exports = router;
