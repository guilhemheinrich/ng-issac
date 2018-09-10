import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './authentification/register/register.component';
import { LoginComponent } from './authentification/login/login.component';
import { EditComponent } from './processus/edit/edit.component';
import { IndexComponent } from './processus/index/index.component';
import { HttpClientModule } from '@angular/common/http'; 
import { AuthGuard } from './auth-guard.service';
import { ViewComponent } from './processus/view/view.component';
import { HomeComponent } from './home/home.component';
import { DisplayerComponent } from './messages/displayer/displayer.component';

const routes: Routes = [
  { path: 'authentification/register', component: RegisterComponent },
  { path: 'authentification/login', component: LoginComponent },
  { path: 'processus/edit', component: EditComponent, canActivate: [AuthGuard] },
  { path: 'processus/index', component: IndexComponent, canActivate: [AuthGuard] },
  { path: 'processus/edit/:id', component: EditComponent, canActivate: [AuthGuard] },
  { path: 'processus/view/:id', component: ViewComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent},
  // { path: 'home', component: DisplayerComponent},

  
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
