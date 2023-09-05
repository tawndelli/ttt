import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SquareComponent } from './square/square.component';
import { BoardComponent } from './board/board.component';
import { HttpClientModule } from '@angular/common/http';
import { LobbyComponent } from './lobby/lobby.component';
import { NgIconsModule } from '@ng-icons/core';
import { heroPlay } from '@ng-icons/heroicons/outline';

@NgModule({
  declarations: [
    AppComponent,
    SquareComponent,
    BoardComponent,
    LobbyComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgIconsModule.withIcons({heroPlay})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
