import express from 'express'
import { WebSocketServer } from 'ws'
import WebSocket from 'ws'
import { GameManager } from './GameManager'

const port = 8080
const wss = new WebSocket.Server({ port:port });

const gameManager=new GameManager()

wss.on('connection', function connection(socket) {

    socket.on('error', console.error);

    gameManager.addUser(socket)
//   socket.on('message', function message(data, isBinary) {
//     wss.clients.forEach(function each(client) {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(data, { binary: isBinary });
//       }
//     });
    socket.on("disconnect", () => gameManager.removeUser(socket))
});

console.log(`WebSocket server is running on ws://localhost:8080`);