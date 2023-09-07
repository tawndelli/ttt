import { ChangeDetectorRef } from "@angular/core";

export class GameObject{
    id!: string;
  
    name!: string;

    _numPlayers!: number;

    get numPlayers(){
      return this._numPlayers;
    }
    
    set numPlayers(val:number){
      this._numPlayers = val;
      this.cdr.detectChanges();
    }
  
    constructor(id:string, name:string, private cdr: ChangeDetectorRef){
      this.id = id;
      this.name = name;
      this._numPlayers = 0;
    }
  }