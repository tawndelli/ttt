import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { Message, MessageService } from '../messageservice/messageservice';
import { GameObject } from '../common/gameobject';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {
  availableGames: GameObject[] = [];

  selectedGame!: GameObject | null;

  headers!: HttpHeaders; 
    
  options!: any; 

  componentName!: string

  isInGame: boolean = false;

  constructor(private messageService: MessageService, private client: HttpClient, private cdr: ChangeDetectorRef){
    this.messageService.onMessage().subscribe((message)=>this.processMessage(message));

    this.componentName = 'LobbyComponent';
    this.headers = new HttpHeaders({'Content-Type': 'application/json'});
    
    this.options = { headers: this.headers };

    this.client.get('http://127.0.0.1:8080/freeGames', this.options).subscribe({
      // this.client.get('https://game-server-ix4jjrfucq-uc.a.run.app/freeGames', this.options).subscribe({
      next: (res) => {
          let freeGames = JSON.parse(res.toString());
          for(let g in freeGames){
            let game: GameObject = JSON.parse(freeGames[g]);
            var o = new GameObject(game.id, game.name, this.cdr);
            o.numPlayers = game.numPlayers;
            this.availableGames.push(o);
          }
          this.cdr.detectChanges();
      },
      error: (e) => console.error(e),
      complete: () => console.info('complete') 
    });
  }

  processMessage(message: Message){
    if (message && message.target == this.componentName) {
      let msg = JSON.parse(message.payload);
      
      console.log('json message: ' + msg);
      
      switch(msg.msg){
        case "end game":
          this.isInGame = false;
          var foundGame = this.availableGames.find(x=>x.id==msg.gameId);
          if(foundGame){
            foundGame.numPlayers = 0;
          }

          this.selectedGame = null;
        break;

        case "player added":
          var numPlayers = msg.numPlayers;
          var gameId = msg.gameId;
          var foundGame = this.availableGames.find(x=>x.id==gameId);
          if(foundGame){
            foundGame.numPlayers = numPlayers;
          }
          
          break;
      }
    }
  }

  joinGame(game: GameObject | null){
    let body = {"msg" : "join game", "gameId" : game?.id};
    this.messageService.sendSocketMessage(JSON.stringify(body))
    this.isInGame = true;
  }

  selectGame(game: GameObject){
    this.selectedGame = game;
    this.sendMessage('BoardComponent', `{"msg": "game selected", "gameId" : "${this.selectedGame.id}"}`);
  }

  sendMessage(target:string, msg:string): void {
    // send message to subscribers via observable subject
    this.messageService.sendMessage(new Message(target, msg));
  }
}

