import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './authentification/register/register.component';
import { LoginComponent } from './authentification/login/login.component';
import { LoggerComponent } from './authentification/logger/logger.component';
import { HttpClientModule } from '@angular/common/http'; 

const routes: Routes = [
  { path: 'authentification/register', component: RegisterComponent },
  { path: 'authentification/login', component: LoginComponent },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ 
    HttpClientModule,
    RouterModule ],
})
export class AppRoutingModule { }
