"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const messages_1 = require("./messages");
const Game_1 = require("./Game");
// User, Game
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
        this.playerNames = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
        // Stop the game here because the user left
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === messages_1.INIT_GAME) {
                if (this.pendingUser) {
                    const player2Name = message.name;
                    this.playerNames.push(player2Name);
                    console.log(player2Name);
                    const game = new Game_1.Game(this.pendingUser, socket, this.playerNames[0], this.playerNames[1]);
                    this.games.push(game);
                    this.pendingUser = null;
                    this.playerNames = [];
                }
                else {
                    this.pendingUser = socket;
                    const player1Name = message.name;
                    this.playerNames.push(player1Name);
                    console.log(player1Name);
                }
            }
            if (message.type === messages_1.MOVE) {
                console.log("inside move");
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    console.log("inside makemove");
                    game.makeMove(socket, message.payload.move);
                }
            }
            if (message.type === messages_1.GAME_OVER) {
                console.log("Game over");
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    this.removeUser(game.player1);
                    this.removeUser(game.player2);
                }
            }
        });
    }
}
exports.GameManager = GameManager;
