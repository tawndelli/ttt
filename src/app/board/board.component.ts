import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SquareComponent } from '../square/square.component';
import { Message, MessageService } from '../messageservice/messageservice';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})

export class BoardComponent implements OnInit {

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

  componentName!: string

  subscription: Subscription = new Subscription();

  selectedPlayer: string = '';

  isInGame: boolean = false;

  _numPlayers: number = 0;

  get numPlayers(){
    return this._numPlayers;
  }

  set numPlayers(val:number){
    this._numPlayers = val;
    this.changeDetect.detectChanges();
  }
   
  get player(){
    return this.selectedPlayer; 
  }
  
  currentPlayer: string = '';

  constructor(private messageService: MessageService, private client: HttpClient, private changeDetect: ChangeDetectorRef){
    this.componentName = 'BoardComponent';
    
    this.subscription = this.messageService.onMessage().subscribe((message)=>this.processMessage(message));
  }
  ngOnInit(): void {
  }

  sendMessage(target:string, msg:string): void {
      // send message to subscribers via observable subject
      this.messageService.sendMessage(new Message(target, msg));
  }

  sendSocketMessage(msg:string): void{
    this.messageService.sendSocketMessage(msg);
  }

  processMessage(message: Message){
    if (message && message.target == this.componentName) {
      let msg = JSON.parse(message.payload);
      
      console.log('json message: ' + msg);
      
      switch(msg.msg){
        case "start game":
          this.resetGameState();
          this.gameId = msg.gameId;
          this.selectedPlayer = msg.selectedPlayer;
          this.isInGame = true;
          this.sendMessage('SquareComponent', '{"msg": "new game"}');
          
        break;

        case "end game":
          this.resetGameState();
          this.isInGame = false;
          this.selectedPlayer = '';
          this.currentPlayer = '';
          this.sendMessage('LobbyComponent', `{"msg": "end game", "gameId" : "${this.gameId}"}`);
          this.gameId = '';
        break;

        case "joined game":
          this.resetGameState();
          this.gameId = msg.gameId;
          this.selectedPlayer = msg.selectedPlayer;
          this.currentPlayer = msg.player;
          this.sendMessage('SquareComponent', '{"msg": "new game"}');
          this.isInGame = true;
          break;

        case "game selected":
          break;

        case "switch player":
          this.selectedPlayer = msg.player;
          break;

        case "player added":
          this.numPlayers = msg.numPlayers;
          break;

        case "make move":
          let move = msg.move;
          if(move.player != this.currentPlayer){
            //update squares
            this.squares = msg.squares;
          }

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

  resetGameState(){
    this.squares = Array(9).fill(null);
    this.winner = "";
    this.isDraw = false;
  }

  newGame(){
    let body = {"msg" : "start game", "gameId" : this.gameId};
    this.messageService.sendSocketMessage(JSON.stringify(body)); 
  }

  exitGame(){
    let body = {"msg" : "end game", "gameId" : this.gameId};
    this.messageService.sendSocketMessage(JSON.stringify(body));
  }

  makeMove(idx: number, player: string){
    if(!this.squares[idx] && !this.winner && this.currentPlayer === this.selectedPlayer){
      this.squares[idx] = this.currentPlayer;
      this.sendMove(idx);
    }
  }

  sendMove(idx: number){
    //send the move to the server
    let body = {"msg" : "make move", "gameId" : this.gameId, "move" : {"player" : this.currentPlayer, "idx" : idx}};
    this.messageService.sendSocketMessage(JSON.stringify(body)); 
  }
}

