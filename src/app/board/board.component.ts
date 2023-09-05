import { Component } from '@angular/core';
import { SquareComponent } from '../square/square.component';
import { Message, MessageService } from '../messageservice/messageservice';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})

export class BoardComponent {

  squares: any[] = [];

  private _isDraw: boolean = false;

  public get isDraw()
  {
    return this._isDraw;
  }

  public set isDraw(value: boolean)
  {
    this._isDraw = value;
    if(this._isDraw){
      this.sendMessage('SquareComponent', '{"msg": "draw"}');
    }
  }

  private _winner!: string;

  public get winner(){
    return this._winner;
  }

  public set winner(value: string){
    this._winner = value;
    if(this._winner){
      this.sendMessage('SquareComponent','{"msg": "winner"}');
    }
  }

  gameId!: string

  subscription: Subscription = new Subscription();

  constructor(private messageService: MessageService, private client: HttpClient){
    this.subscription = this.messageService.onMessage().subscribe((message)=>this.processMessage(message));
  }

  sendMessage(target:string, msg:string): void {
      // send message to subscribers via observable subject
      this.messageService.sendMessage(new Message(target, msg));
  }

  sendSocketMessage(msg:string): void{
    this.messageService.sendSocketMessage(msg);
  }

  processMessage(message: Message){
    if (message && message.target == this.constructor.name) {
      let msg = JSON.parse(message.payload);

      switch(msg.msg){
        case "new game":
        case "joined game":
        case "start game":
          this.gameId = msg.gameId;
          this.selectedPlayer = msg.player;
          this.squares = Array(9).fill(null);
          this.winner = "";
          this.isDraw = false;
          this.sendMessage('SquareComponent', '{"msg": "new game"}');
        break;

        case "game selected":
          this.gameId = JSON.parse(message.payload)["gameId"];
          // this.newGame();
          break;

        case "switch player":
          this.selectedPlayer = msg.player;
          break;

        case "make move":
          let move = msg.move;
          // if(move.player != this.player){
          //   //update squares
          //   this.squares[move.idx] = move.player;
          // }
          this.squares[move.idx] = move.player;

          if(msg.gameState == "WIN"){
            this.winner = msg.winner;
          }
          if(msg.gameState == "DRAW"){
            this.isDraw = true;
          }
        break;
      } 
    } 
  }

  selectedPlayer: string = '';

  onSelected(value:string): void {
		this.selectedPlayer = value;
	}

  newGame(){
    // this.squares = Array(9).fill(null);
    // this.winner = "";
    // this.isDraw = false;
    // this.sendMessage('SquareComponent', '{"msg": "new game"}');

    let body = {"msg" : "start game", "gameId" : this.gameId};
    this.messageService.sendSocketMessage(JSON.stringify(body)); 
  }

  get player(){
    return this.selectedPlayer; 
  }

  makeMove(idx: number, player: string){
    if(!this.squares[idx] && !this.winner){
      this.squares[idx] = player;
      this.sendMove(idx);
    }
  }

  sendMove(idx: number){
    //send the move to the server
    let body = {"msg" : "make move", "gameId" : this.gameId, "move" : {"player" : this.player, "idx" : idx}};
    this.messageService.sendSocketMessage(JSON.stringify(body)); 
  }
}

