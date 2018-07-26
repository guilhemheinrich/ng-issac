import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';  // <-- #1 import module

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';

import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { AppRoutingModule } from './/app-routing.module';

import { LocalStorageModule } from 'angular-2-local-storage';
import { RegisterComponent } from './authentification/register/register.component';
import { LoginComponent } from './authentification/login/login.component';
import { LoggerComponent } from './authentification/logger/logger.component';
import { IndexComponent } from './processus/index/index.component';
import { EditComponent } from './processus/edit/edit.component';
import { ViewComponent } from './processus/view/view.component';
import { ThesaurusDisplayComponent } from './thesaurus/thesaurus-display/thesaurus-display.component';
import { MermaidComponent } from './mermaid/mermaid.component';
import { ActionDisplayComponent } from './processus/action/display/display.component';



@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    RegisterComponent,
    LoginComponent,
    LoggerComponent,
    IndexComponent,
    EditComponent,
    ViewComponent,
    ThesaurusDisplayComponent,
    MermaidComponent,
    ActionDisplayComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule, // <-- #2 add to @NgModule imports
    LocalStorageModule.withConfig({
      prefix: 'my-app',
      storageType: 'localStorage'
  })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
