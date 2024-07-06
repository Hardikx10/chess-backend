"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const app = (0, express_1.default)();
const httpServer = app.listen(8080);
const wss = new ws_1.WebSocketServer({ server: httpServer });
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
console.log(`WebSocket server is running on ws://localhost:8080`);
