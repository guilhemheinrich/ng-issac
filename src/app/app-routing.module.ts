import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './authentification/register/register.component';
import { HttpClientModule } from '@angular/common/http'; 

const routes: Routes = [
  { path: 'authentification/register', component: RegisterComponent },
  
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
