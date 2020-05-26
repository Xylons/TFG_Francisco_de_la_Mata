import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';



@Component({

  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.css']
})

export class RecoverComponent implements OnInit, OnDestroy {
  isLoading = false;
  messageSended = false;
  private authStatusSub: Subscription;
  private messageSendedStatusSub: Subscription;

  constructor(public authService: AuthService, private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.messageSendedStatusSub = this.authService.getSendedtatusListener()
      .subscribe((sendedStatus) => {
        this.messageSended = sendedStatus;
        this.isLoading = false;
      });

  }

  openSnackBar(message: string, action: string, form: NgForm) {
    let mySnackBar = this._snackBar.open(message, action);
    this.isLoading = false;
    if (action === 'Resend') {
      mySnackBar.onAction().subscribe(() => {
        this.onRecovery(form);
      });
    }

  }

  onRecovery(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    console.log(this.messageSended);
    this.authService.recover(form.value.email);
    console.log(this.messageSended);
    this.openSnackBar("Message Sended to " + form.value.email, "Resend", form);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.messageSendedStatusSub.unsubscribe();
  }

}
