"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameManager_1 = require("./GameManager");
const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8080;
app.use(cors());
const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
const wss = new WebSocketServer({ server });
const gameManager = new GameManager_1.GameManager();
wss.on('connection', function connection(socket) {
    socket.on('error', console.error);
    gameManager.addUser(socket);
    //   socket.on('message', function message(data, isBinary) {
    //     wss.clients.forEach(function each(client) {
    //       if (client.readyState === WebSocket.OPEN) {
    //         client.send(data, { binary: isBinary });
    //       }
    //     });
    socket.on("disconnect", () => gameManager.removeUser(socket));
});
