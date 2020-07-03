import { Component, OnInit, OnDestroy } from "@angular/core";
//Subscrition
import { Subscription } from 'rxjs';
//Inferfaz de Perfil
import { Profile } from '../profile.model';
//Servicio
import { ProfilesService } from '../profiles.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';

//Patient Icon
import { faWalking } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
//Responsible Icon
import { faUserMd } from '@fortawesome/free-solid-svg-icons';
//Undefined Icon
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
//Admin Icon
import { faUserCog } from '@fortawesome/free-solid-svg-icons';

import { FiltersBarService } from '../../filters-bar/filters-bar.service';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.css']
})
export class ProfileListComponent implements OnInit, OnDestroy {

  //Patient Icon
  faWalking = faWalking;
  faUser = faUser;
  //Responsible Icon
  faUserMd = faUserMd;
  //Undefined Icon
  faQuestion = faQuestion;
  //Admin Icon
  faUserCog = faUserCog;

  profiles: Profile[] = [];
  isLoading = false;
  //controladores de paginator
  totalProfiles = 0;
  profilesPerPage = 4;
  currentPage = 1;
  pageSizeOptions = [4, 6, 8, 12];
  userIsAuthenticated = false;
  userId: string;
  rol: string;
  withFilters: boolean;
  filters:object;
  private profilesSub: Subscription;
  //Aqui se usara para que solo pueda crear un gestor
  private authStatusSub: Subscription;
  private searchForm: FormGroup;


  constructor(public profilesService: ProfilesService, private authService: AuthService, private filtersService: FiltersBarService) { }

  ngOnInit() {
    this.isLoading = true;
    this.profilesService.getProfiles(this.profilesPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
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
    this.rol = this.authService.getRolLogged();

    this.searchForm= this.filtersService.getSearchForm();

    /// Estoy hay que solucionar, envia dos peticiones con cada cambio
    this.searchForm.valueChanges.subscribe(changes => {
      // do what you need with the form fields here
      // you can access a form field via changes.fieldName
      this.onFiltersChanged(changes);
  });
  }

  onFiltersChanged(changes){
    this.filters=changes;
    let allArray=['All'];
    // Controlo que no tenga campos en undefined
    Object.keys(changes).forEach(key => {
      if(changes[key] === "" || changes[key]=== allArray) this.withFilters= true ;
      console.log(changes[key]===allArray)
    });
    if(this.withFilters){
      this.profilesService.searchWithFilters(changes, this.profilesPerPage, this.currentPage);
    }else{
      this.profilesService.getProfiles(this.profilesPerPage, this.currentPage);
    }

    console.log(changes);

  }

  onChangeUserRol(userId: string, newRol: string) {
    this.profilesService.changeUserRol(userId, newRol);
  }
  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.profilesPerPage = pageData.pageSize;
    if(this.withFilters){
      this.profilesService.searchWithFilters(this.filters, this.profilesPerPage, this.currentPage);
    }else{
    this.profilesService.getProfiles(this.profilesPerPage, this.currentPage);
    }
  }

  ngOnDestroy() {
    this.profilesSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
  onDelete(userId: string) {
    //falta anadir modal para confirmar
    this.isLoading = true;
    // Cada vez que se elimina se actualiza

    this.profilesService.dialog
      .open(ConfirmDialogComponent, {
        data: 'Do you want to remove this user?'
      })
      .afterClosed()
      .subscribe((confirmed: Boolean) => {
        if (confirmed) {
          this.profilesService.deleteProfile(userId).subscribe(() => {
            this.profilesService.openSnackBar("User removed", "Ok");
            this.profilesService.getProfiles(this.profilesPerPage, this.currentPage);
          }, () => {
            // si falla se quita el spinner
            this.isLoading = false;
          });

        } else {
          this.isLoading = false;
        }
      });


  }
}
