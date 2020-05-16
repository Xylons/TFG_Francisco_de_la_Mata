import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';



@Component({
  // no hace falta ya que se trabajara mediante route selector: 'app-login',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.css']
})

export class RecoverComponent implements OnInit, OnDestroy {
  isLoading = false;
  messageSended= false;
  private authStatusSub: Subscription;
  private messageSendedStatusSub: Subscription;

  constructor(public authService: AuthService) { }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });

  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    let datos=this.authService.recover(form.value.email);
    console.log(datos);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
