import { NgModule } from "@angular/core";
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { RecoverComponent } from './recover/recover.component';
import { ResetPasswordComponent } from './resetPassword/resetPassword.component';
import { AngularMaterialModule } from '../angular-material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';


@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    RecoverComponent,
    ResetPasswordComponent,

  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    FormsModule,
    AuthRoutingModule

  ]
})
export class AuthModule{}
