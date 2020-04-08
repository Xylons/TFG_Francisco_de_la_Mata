import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';


@Component({
  // no hace falta ya que se trabajara mediante route selector: 'app-login',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignupComponent {
  isLoading = false;

  constructor(public authService: AuthService){}

  onSignup(form: NgForm) {
    console.log(form.value)
    if(form.invalid){
      return;
    }
    this.isLoading=true;
    this.authService.createUser(form.value.email, form.value.password);
  }

}
