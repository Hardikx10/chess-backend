import { WebSocket } from "ws";
import { Chess } from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";


export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess
    private startTime: Date;
    private moveCount = 0;
    public player1Name:string;
    public player2Name:string;
    constructor(player1: WebSocket, player2: WebSocket,player1Name:string,player2Name:string) {
        this.player1 = player1;
        this.player2 = player2;
        this.player1Name = player1Name;
        this.player2Name = player2Name;

        this.board = new Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white",
                opponentName: this.player2Name
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black",
                opponentName: this.player1Name
            }
        }));
    }

    makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }) {
        // validate the type of move using zod
        if ((this.moveCount % 2 === 0 && socket !== this.player1) || (this.moveCount % 2 === 1 && socket !== this.player2)) {
            console.log("Not your turn!");
        
            return;
        }
        try {
            this.board.move(move);
        } catch(e) {
            console.log(e);
            return;
        }
        
        if (this.board.isGameOver()) {
              // Send the final move to both players
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
            if (this.board.isThreefoldRepetition()) {
                this.sendGameOverMessage("draw", "Threefold repetition");
                return ;
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
                type: MOVE,
                payload: move
            }))
        } else {
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move
            }))
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

    sendGameOverMessage(winner: string, reason: string = "") {
        const gameOverMessage = JSON.stringify({
            type: GAME_OVER,
            payload: { winner, reason },
        });
        this.player2.send(gameOverMessage);
        this.player1.send(gameOverMessage);
        
    }

    isInsufficientMaterial() {
        const pieces = this.board.board().flat();
        const pieceCounts = pieces.reduce(
            (acc, piece) => {
                if (piece) acc[piece.type]++;
                return acc;
            },
            { k: 0, q: 0, r: 0, b: 0, n: 0, p: 0 }
        );

        const { k, q, r, b, n, p } = pieceCounts;

        if (q > 0 || r > 0 || p > 0) return false;
        if (b + n > 1) return false;
        if (b === 1 && n === 1) return false;

        return true;
    }
}
