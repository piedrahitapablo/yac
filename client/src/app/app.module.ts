import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { routing, appRoutingProviders } from './app.routing';

import { AppComponent } from './app.component';
import { LogInComponent } from './components/login.component';
import { NewUserComponent } from './components/new_user.component';
import { ChatComponent } from './components/chat.component'

@NgModule({
  declarations: [
    AppComponent,
    LogInComponent,
    NewUserComponent,
    ChatComponent
  ],

  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],

  providers: [appRoutingProviders],

  bootstrap: [AppComponent]
})

export class AppModule { }
