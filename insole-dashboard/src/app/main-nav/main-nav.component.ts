import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent {
  userIsAuthenticated=false;
  private authListenerSubs: Subscription;
  private nameListenerSubs: Subscription;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private authService: AuthService) {}

  userName: string;
  userImage: string;
  rol: string;

  ngOnInit() {
    this.userIsAuthenticated= this.authService.getIsAuth();
    this.userName= this.authService.getName();
    this.userImage = this.authService.getImage();
    this.rol= this.authService.getRolLogged();
    this.authListenerSubs = this.authService
    .getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated= isAuthenticated;

    });
    this.nameListenerSubs = this.authService
    .getNameListener()
    .subscribe(name => {
      this.userName= name;

    });
  }

  onLogout(){
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }

}
