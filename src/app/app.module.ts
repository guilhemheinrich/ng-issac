import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';  // <-- #1 import module

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';

import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { AppRoutingModule } from './/app-routing.module';

import {Ng2Webstorage} from 'ngx-webstorage';
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
import { selectFieldPipe } from './tools';
import { ConcatenatePipe } from './concatenate.pipe';
import { NgPipesModule } from 'ngx-pipes';
import { PrefixPipe } from './prefix.pipe';
import { SuffixPipe } from './suffix.pipe';
import { MapPipe } from './map.pipe';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';



// Material stuff
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialCustomModule} from './material-custom/material-custom.module';
import {EditorModule} from 'primeng/editor';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {TooltipModule} from 'primeng/tooltip';
import {MenubarModule} from 'primeng/menubar';
import {SlideMenuModule} from 'primeng/slidemenu';
import {SelectButtonModule} from 'primeng/selectbutton';



import { AngularFontAwesomeModule } from 'angular-font-awesome';


import { DisplayerComponent } from './messages/displayer/displayer.component';
import { HomeComponent } from './home/home.component';
import { XsdDateToDatePipe } from './xsd-date-to-date.pipe'

import {IssacProcessusModule} from './issac-processus/issac-processus.module';
import { PropertyAccessPipe } from './property-access.pipe';
import { ContextDisplayComponent } from './processus/context/context-display/context-display.component';
import { BasicComponent } from './gojs/basic/basic.component';
import { MainComponent } from './vis/main/main.component';
import { ProcessusFormComponent } from './vis/processus-form/processus-form.component';


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
    ActionDisplayComponent,
    selectFieldPipe,
    ConcatenatePipe,
    PrefixPipe,
    SuffixPipe,
    MapPipe,
    HomeComponent,
    DisplayerComponent,
    XsdDateToDatePipe,
    PropertyAccessPipe,
    ContextDisplayComponent,
    BasicComponent,
    MainComponent,
    ProcessusFormComponent,

  ],
  imports: [
    AngularFontAwesomeModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule, // <-- #2 add to @NgModule imports
    LocalStorageModule.withConfig({
      prefix: 'my-app',
      storageType: 'localStorage'
    }),
    NgPipesModule,
    Ng2Webstorage,
    NgbModule.forRoot(),
    BrowserAnimationsModule,
    MaterialCustomModule,
    InputTextareaModule,
    OverlayPanelModule,
    ButtonModule,
    IssacProcessusModule,
    DialogModule,
    TooltipModule,
    MenubarModule,
    SlideMenuModule,
    SelectButtonModule
    // GojsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
