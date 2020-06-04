import { Component, OnInit, OnDestroy } from "@angular/core";
//Subscrition
import { Subscription } from 'rxjs';
//Inferfaz de Perfil
import { Profile } from '../profile.model';
//Servicio
import { ProfilesService } from '../profiles.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.css']
})
export class ProfileListComponent implements OnInit, OnDestroy {


  profiles: Profile[] = [];
  isLoading = false;
  //controladores de paginator
  totalProfiles = 0;
  profilesPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;

  private profilesSub: Subscription;
  //Aqui se usara para que solo pueda crear un gestor
  private authStatusSub: Subscription;
  constructor(public profilesService: ProfilesService, private authService: AuthService) { }
  ngOnInit() {
    this.isLoading = true;
    this.profilesService.getProfiles(this.profilesPerPage, this.currentPage);
    this.userId= this.authService.getUserId();
    // Subscribes to the observable
    // subscribe (funcion, error, funcion complete)
    this.profilesSub = this.profilesService.getProfileUpdatedListener()
      .subscribe((profileData: { profiles: Profile[], profileCount: number }) => {
        this.isLoading = false;
        this.profiles = profileData.profiles;
        this.totalProfiles = profileData.profileCount;
      });
    // Ahora mismo no hace nada pero servira para controlar cuando existan roles
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.profilesPerPage = pageData.pageSize;
    this.profilesService.getProfiles(this.profilesPerPage, this.currentPage);
  }

  ngOnDestroy() {
    this.profilesSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
  /*onDelete(userId: string) {
    this.isLoading = true;
    // Cada vez que se elimina se actualiza
    this.profilesService.deleteProfile(userId).subscribe(() => {
      this.profilesService.getProfile(this.profilesPerPage, this.currentPage);
    },()=>{
      // si falla se quita el spinner
      this.isLoading=false;
    });

  }*/
}
