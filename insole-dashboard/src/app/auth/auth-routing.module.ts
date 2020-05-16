import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { RecoverComponent } from './recover/recover.component';
import { ResetPasswordComponent } from './resetPassword/resetPassword.component';

const routes: Routes= [
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'recover', component: RecoverComponent},
  {path: 'reset/:token', component: ResetPasswordComponent},
];

/// forClid anade la ruta como subruta
@NgModule({
 imports: [
   RouterModule.forChild(routes)
 ],
 exports: [RouterModule]
})
export class AuthRoutingModule{}
