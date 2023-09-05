import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
    socket!: WebSocket;

    constructor(){
       this.connect(); 
    }

    connect(): void{
        // this.socket = new WebSocket('ws://127.0.0.1:8080');
        this.socket = new WebSocket('wss://game-server-ix4jjrfucq-uc.a.run.app');
        // this.socket.onopen = ()=>{
        //     // this.newGame();
            
        // };
    
        this.socket,onclose = (event) =>{
            console.log(event);
        }
    
        this.socket.onmessage = (event) => {
            let msg = JSON.parse(event.data);
            
            switch(msg.msg){
                case "new game":
                case "joined game":
                case "switch player":
                case "start game":
                    this.sendMessage(new Message('BoardComponent', `${event.data}`));
                break;

                case "make move":
                    this.sendMessage(new Message('BoardComponent', `${event.data}`));
                    break;
            }

            console.log(event.data);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
          };
    }

    private subject = new Subject<any>();

    sendMessage(message: Message) {
        this.subject.next(message);
    }

    clearMessages() {
        this.subject.next(null);
    }

    onMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    sendSocketMessage(msg:string){
        this.socket.send(msg);
    }
}

export class Message {
    target!: string;

    payload!: string;

    constructor(target:string, payload:string){
        this.target = target;

        this.payload = payload;
    }
}