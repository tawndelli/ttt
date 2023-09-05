import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { Message, MessageService } from '../messageservice/messageservice';
import { GameObject } from '../common/gameobject';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  availableGames: GameObject[] = [];

  selectedGame!: GameObject;

  headers!: HttpHeaders; 
    
  options!: any; 
  
  constructor(private messageService: MessageService, private client: HttpClient){
    this.headers = new HttpHeaders({'Content-Type': 'application/json'});
    
    this.options = { headers: this.headers };

    // this.client.get('http://127.0.0.1:8080/freeGames', this.options).subscribe({
      this.client.get('https://game-server-ix4jjrfucq-uc.a.run.app/freeGames', this.options).subscribe({
      next: (res) => {
          let freeGames = JSON.parse(res.toString());
          for(let g in freeGames){
            let game = JSON.parse(freeGames[g]);
            game = new GameObject(game.id, game.name);
            this.availableGames.push(game);
          }
        
          this.selectGame(this.availableGames[0]);
      },
      error: (e) => console.error(e),
      complete: () => console.info('complete') 
    });
  }

  ngOnInit(): void {
    
  }

  joinGame(gameId: string){
    let body = {"msg" : "join game", "gameId" : gameId};
    this.messageService.sendSocketMessage(JSON.stringify(body))
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

