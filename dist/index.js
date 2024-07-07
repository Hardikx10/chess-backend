"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 4633;
app.use(cors());
const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
const wss = new WebSocketServer({ server });
const gameManager = new GameManager_1.GameManager();
wss.on('connection', function connection(socket) {
    const keepAliveInterval = setInterval(() => {
        if (socket.readyState === ws_1.WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'keep-alive' }));
        }
    }, 30000); // Send a keep-alive message every 30 seconds
    socket.on('error', console.error);
    gameManager.addUser(socket);
    //   socket.on('message', function message(data, isBinary) {
    //     wss.clients.forEach(function each(client) {
    //       if (client.readyState === WebSocket.OPEN) {
    //         client.send(data, { binary: isBinary });
    //       }
    //     });
    socket.on("disconnect", () => gameManager.removeUser(socket));
    // Clear the interval on disconnect
    socket.on('close', () => {
        console.log('Client disconnected');
        clearInterval(keepAliveInterval);
        gameManager.removeUser(socket);
    });
});
