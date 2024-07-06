import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";

// User, Game

export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];
    public playerNames:string[]
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
        this.playerNames = [];
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandler(socket)
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user !== socket);
        // Stop the game here because the user left
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
           
            if (message.type === INIT_GAME) {
                if (this.pendingUser) {
                    const player2Name=message.name
                    this.playerNames.push(player2Name)
                    console.log(player2Name);
                    const game = new Game(this.pendingUser, socket,this.playerNames[0],this.playerNames[1]);
                    this.games.push(game);
                    this.pendingUser = null;
                    this.playerNames=[]
                } else {

                    this.pendingUser = socket;
                    const player1Name=message.name
                    this.playerNames.push(player1Name)
                    console.log(player1Name);
                    
                }
                         
            }

            if (message.type === MOVE) {
                console.log("inside move")
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    console.log("inside makemove")
                    game.makeMove(socket, message.payload.move);
                }
            }
            if (message.type === GAME_OVER) {
                console.log("Game over");
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    this.removeUser(game.player1);
                    this.removeUser(game.player2);
                }
            }
        }
    )
    }
}