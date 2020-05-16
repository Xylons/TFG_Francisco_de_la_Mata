import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription, from } from 'rxjs';

import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  // no hace falta ya que se trabajara mediante route selector: 'app-login',
  templateUrl: './resetPassword.component.html',
  styleUrls: ['./resetPassword.component.css']
})

export class ResetPasswordComponent implements OnInit, OnDestroy {
  isLoading = false;
  passwordsMatch= true;
  private token:string;
  private authStatusSub: Subscription;


  constructor(public authService: AuthService, public route: ActivatedRoute) { }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
      //Suscripción para detectar cambios en route
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // revisa si existe el parametro postId definidio en app-routing
      if (paramMap.has('token')) {
        this.token = paramMap.get('token')

      } else {
        this.token = null;
      }
      console.log(this.token);
    });
  }

  onReset(form: NgForm) {
    this.passwordsMatch= form.value.password === form.value.password2;

    if (form.invalid || !this.passwordsMatch) {
      form.reset();
      return;
    }
    console.log(this.token);
    this.isLoading = true;
    this.authService.reset(form.value.password, form.value.password2, this.token);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }



}
