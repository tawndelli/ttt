import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Message, MessageService } from '../messageservice/messageservice';

@Component({
  selector: 'app-square',
  templateUrl: './square.component.html',
  styleUrls: ['./square.component.scss']
})

export class SquareComponent implements OnDestroy, OnInit{
 //#region fields and props

  private _value!: string;

  @Input() 
  public set value(val: string){
    this._value = val;
  } 

  public get value(){
    return this._value;
  }

  private _square!: ElementRef;

  @ViewChild('square')
  public get square(){
    return this._square;
  }
  public set square(val: ElementRef){
    this._square = val;

    this.squares = this.square.nativeElement as HTMLElement;
  
    this.letter = this.squares.childNodes[0];
  }
  
  subscription: Subscription = new Subscription();

  intervalId: any;

  squares!: HTMLElement;
  
  letter!: ChildNode;

  //#endregion

  //#region init

  constructor(private rd: Renderer2, private messageService: MessageService){}

  ngOnInit(): void {
    this.subscription = this.messageService.onMessage().subscribe((message)=>this.processMessage(message));
  }

  ngOnDestroy(): void {
      // unsubscribe to ensure no memory leaks
      this.subscription.unsubscribe();
  }

  //#endregion

  //#region methods

  processMessage(message: Message){
    if (message && message.target == this.constructor.name) {
      switch(JSON.parse(message.payload)["msg"]){
        case 'draw':
        case 'winner':
          this.colorSquares();
          this.intervalId = setInterval(()=>this.colorSquares(),450);
          break;
        case 'new game':
          this.clearSquares();
          break;
      } 
    } 
  }

  getRandomColor():string {
    return `rgb(${[1,2,3].map(x=>Math.random()*256|0)})`;
  }

  colorSquares(){
    this.rd.setStyle(this.squares, 'background-color', this.getRandomColor());
    this.rd.setStyle(this.squares, 'transition', 'background-color 1s ease'); 
    this.rd.setStyle(this.squares, 'animation', 'spin 1s linear infinite'); 
    this.rd.setStyle(this.squares, 'animation-timing-function','ease-in-out');

    this.rd.removeClass(this.letter, 'gradient');
    this.rd.addClass(this.letter, 'normal'); 
  }

  clearSquares(){
    clearInterval(this.intervalId);
    this.rd.removeStyle(this.squares, 'background-color'); 
    this.rd.removeStyle(this.squares, 'transition'); 
    this.rd.removeStyle(this.squares, 'animation'); 
    this.rd.removeStyle(this.squares, 'animation-timing-function');

    this.rd.removeClass(this.letter, 'normal');
    this.rd.addClass(this.letter, 'gradient');
  }

  //#endregion
}
