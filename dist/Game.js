"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2, player1Name, player2Name) {
        this.moveCount = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.player1Name = player1Name;
        this.player2Name = player2Name;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "white",
                opponentName: this.player2Name
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "black",
                opponentName: this.player1Name
            }
        }));
    }
    makeMove(socket, move) {
        // validate the type of move using zod
        if ((this.moveCount % 2 === 0 && socket !== this.player1) || (this.moveCount % 2 === 1 && socket !== this.player2)) {
            console.log("Not your turn!");
            return;
        }
        try {
            this.board.move(move);
        }
        catch (e) {
            console.log(e);
            return;
        }
        if (this.board.isGameOver()) {
            // Send the final move to both players
            this.player1.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
            this.player2.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
            if (this.board.isThreefoldRepetition()) {
                this.sendGameOverMessage("draw", "Threefold repetition");
                return;
            }
            if (this.isInsufficientMaterial()) {
                this.sendGameOverMessage("draw", "Insufficient material");
                return;
            }
            if (this.board.isGameOver()) {
                const winner = this.board.turn() === "w" ? "black" : "white";
                this.sendGameOverMessage(winner);
                return;
            }
            // Send the game over message to both players
            // const winner = this.board.turn() === "w" ? "black" : "white";
            // const gameOverMessage = JSON.stringify({
            //     type: GAME_OVER,
            //     payload: { winner }
            // });
            // this.player1.send(gameOverMessage);
            // this.player2.send(gameOverMessage);
            return;
        }
        if (this.moveCount % 2 === 0) {
            this.player2.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
        }
        else {
            this.player1.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
        }
        this.moveCount++;
    }
    // isGameOver() {
    //     if (this.board.isGameOver()) {
    //         const winner = this.board.turn() === "w" ? "black" : "white";
    //         this.sendGameOverMessage(winner);
    //         return true;
    //     }
    //     if (this.board.isThreefoldRepetition()) {
    //         this.sendGameOverMessage("draw", "Threefold repetition");
    //         return true;
    //     }
    //     if (this.isInsufficientMaterial()) {
    //         this.sendGameOverMessage("draw", "Insufficient material");
    //         return true;
    //     }
    //     return false;
    // }
    sendGameOverMessage(winner, reason = "") {
        const gameOverMessage = JSON.stringify({
            type: messages_1.GAME_OVER,
            payload: { winner, reason },
        });
        this.player2.send(gameOverMessage);
        this.player1.send(gameOverMessage);
    }
    isInsufficientMaterial() {
        const pieces = this.board.board().flat();
        const pieceCounts = pieces.reduce((acc, piece) => {
            if (piece)
                acc[piece.type]++;
            return acc;
        }, { k: 0, q: 0, r: 0, b: 0, n: 0, p: 0 });
        const { k, q, r, b, n, p } = pieceCounts;
        if (q > 0 || r > 0 || p > 0)
            return false;
        if (b + n > 1)
            return false;
        if (b === 1 && n === 1)
            return false;
        return true;
    }
}
exports.Game = Game;
