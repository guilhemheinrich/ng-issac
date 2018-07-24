import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './authentification/register/register.component';
import { LoginComponent } from './authentification/login/login.component';
import { EditComponent } from './processus/edit/edit.component';
import { HttpClientModule } from '@angular/common/http'; 
import { AuthGuard } from './auth-guard.service';

const routes: Routes = [
  { path: 'authentification/register', component: RegisterComponent },
  { path: 'authentification/login', component: LoginComponent },
  { path: 'processus/edit', component: EditComponent, canActivate: [AuthGuard] },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ 
    HttpClientModule,
    RouterModule ],
    providers: [
      AuthGuard
    ]
})
export class AppRoutingModule { }
