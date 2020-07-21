import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';
import { Profile } from './profile.model';

// Uso variables de entorno para obtener la direccion API
import { environment } from '../../environments/environment';

//Observable
import { Subject } from 'rxjs';
// Map se usa para transformar arrays en otros nuevos
import { map } from 'rxjs/operators'
// SnackBar
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { FormGroup } from '@angular/forms';
// Dialog


const BACKEND_URL = environment.apiURL + "/profile/"

//This adds the service in the provide list at app.module.ts
@Injectable({ providedIn: 'root' })

export class ProfilesService {
  private profiles: Profile[] = [];
  private profilesUpdated = new Subject<{ profiles: Profile[], profileCount: number }>();

  //Valores sobre los usuarios para filtrar en la barra de busqueda
  /*private maxAge = new Subject<number>();
  private minAge = new Subject<number>();
  private patologiesList = new Subject<string[]>();*/


  constructor(private http: HttpClient, private router: Router, private _snackBar: MatSnackBar,
    public dialog: MatDialog) { }
  getProfiles(profilesPerPage: number, currentPage: number) {
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams = `?pagesize=${profilesPerPage}&page=${currentPage}`
    // En este no hace falta unscribe ya que se desuscribe solo
    this.http.get<{ message: string, profiles: any, maxProfiles: number }>(BACKEND_URL + queryParams)
      .pipe(map((profilesData) => {

        return {

          profiles: profilesData.profiles.map(profile => {
            return {
              name: profile.name,
              surname: profile.surname,
              userImagePath: profile.userImagePath,
              userId: profile.linkedAccount,
              responsibles: profile.responsibles,
              rol: profile.__t
            };
          }), maxProfiles: profilesData.maxProfiles
        };

      }))
      .subscribe((transformedProfileData) => {
        //console.log(transformedProfileData);
        this.profiles = transformedProfileData.profiles;
        this.profilesUpdated.next({ profiles: [...this.profiles], profileCount: transformedProfileData.maxProfiles });

      });
  }
  /* Esto si en caso de hacerlo dinamico
  updatePatologiesList(transformedProfileData) {
    let agesList = transformedProfileData.profiles.map(profile => {

        age: profile.bornDate
    });
    let uniqueArray = [...new Set(agesList)];
  }
  updateMinMaxAge(transformedProfileData) {
    let agesList = transformedProfileData.profiles.map(profile => {
        console.log(profile.bornDate);
    });
    console.log(agesList);
    let min= Math.min(...agesList);
    let max= Math.max(...agesList);
  }
  //Este metodo de updateMiMaxAge es para cuando el array es superior a 500 usuarios
  // ya que reduce proporciona mejor rendimiento con muchos usuarios

  updateMinMaxAgeHighNumber(transformedProfileData){
    let min= transformedProfileData.reduce((min, p) => p.bornDate < min ? p.bornDate : min, transformedProfileData[0].bornDate);
    let max=  transformedProfileData.reduce((max, p) => p.bornDate > max ? p.bornDate : max, transformedProfileData[0].bornDate);
  }
  getMaxAgeListener() {
    return this.maxAge.asObservable();
  }
  getMinAgeListener() {
    return this.minAge.asObservable();
  }
  getPatologiesListListener() {
    return this.patologiesList.asObservable();
  }*/
  getProfileUpdatedListener() {
    return this.profilesUpdated.asObservable();
  }
  getProfile(id: string) {
    return this.http.get<{
      //AQUI FALTA METER LOS CAMPOS POSIBLES
      __t: string,
      name: string,
      surname: string,
      phone: string,
      userImagePath: string,
      linkedAccount: string,
      bornDate: number,
      contactPhone: string,
      typeOfResponsible: string,
      personalId?: string;
      height?: number;
      weight?: number;
      gender?: string;
      tinetti?: number;
      getuptest?: number;
      mms?: number;
      description?: string,
      leftInsole?: number;
      rightInsole?: number;
      timestamp?: Date;
    }>(BACKEND_URL + "single/" + id);

  }
  /*addProfile(title: string, content: string, image:File) {
    const profileData= new FormData();
    profileData.append("title", title),
    profileData.append("content", content),
    // se llama image ya que accedemos desde back con single("image")
    profileData.append("image", image, title);
    this.http.post<{ message: string, profile: Profile }>(BACKEND_URL, profileData)
      .subscribe((responseData) => {
        this.router.navigate(["/"]);
      });

  }*/

  updateProfile(id: string, name: string, surname: string, phone: string, userImagePath: File | string,
    profileRol?: string, cPhoneOrTypeOfRes?: string, bornDate?: number,
    personalId?: string,
    height?: number,
    weight?: number,
    gender?: string,
    tinetti?: number,
    getuptest?:number,
    mms?: number,
    description?: string,
    leftInsole?: number,
    rightInsole?: number
) {
    let profileData: Profile | FormData;
    console.log('editInfo');
    // Si el objeto es un archivo significa que se ha cambiado
    if (typeof (userImagePath) === 'object') {
      profileData = new FormData();
      profileData.append("userId", id);
      profileData.append("name", name);
      profileData.append("surname", surname);
      profileData.append("phone", phone);
      profileData.append("image", userImagePath, name);
      if (profileRol === 'patient') {
        profileData.append("bornDate", bornDate.toString());
        profileData.append("contactPhone", cPhoneOrTypeOfRes);
        profileData.append("personalId", personalId);
        profileData.append("height", height.toString());
        profileData.append("weight", weight.toString());
        profileData.append("gender", gender);
        profileData.append("tinetti", tinetti.toString());
        profileData.append("getuptest", getuptest.toString());
        profileData.append("mms", mms.toString());
        profileData.append("description", description);
        profileData.append("leftInsole", leftInsole.toString());
        profileData.append("rightInsole", rightInsole.toString());


      } else if (profileRol === 'responsible') {
        profileData.append("typeOfResponsible", cPhoneOrTypeOfRes);
      }
    } else {
      profileData = {
        userId: id,
        name: name,
        surname: surname,
        phone: phone,
        userImagePath: userImagePath
      }
      if (profileRol === 'patient') {
        profileData["contactPhone"] = cPhoneOrTypeOfRes;
        profileData["bornDate"] = bornDate;
        profileData["personalId"] = personalId;
        profileData["height"] = height;
        profileData["weight"] = weight;
        profileData["gender"] = gender;
        profileData["tinetti"] = tinetti;
        profileData["getuptest"] = getuptest;
        profileData["mms"] = mms;
        profileData["description"] = description;
        profileData["leftInsole"] = leftInsole;
        profileData["rightInsole"] = rightInsole;

      } else if (profileRol === 'responsible') {
        profileData["typeOfResponsible"] = cPhoneOrTypeOfRes;
      }

    }
    this.http.put(BACKEND_URL + id, profileData)
      .subscribe((response: any) => {
        console.log(response);
        this.router.navigate(["/"]);
        this.openSnackBar(response.message, "Ok");
      });
  }

  deleteProfile(userId: string) {
    return this.http.delete(BACKEND_URL + userId);
  }
  changeUserRol(userId: string, newRol: string) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: 'Change this user to ' + newRol + '?'
      })
      .afterClosed()
      .subscribe((confirmed: Boolean) => {
        if (confirmed) {
          console.log(confirmed);
          this.http.post(BACKEND_URL + "changeRol", { newRol: newRol, userId: userId })
            .subscribe(response => {
              this.router.navigate(["/"]);
            });
        } else {
          this.router.navigate(["/"]);
          return confirmed;
        }

      });
    /*
    */
  }

  searchWithFilters(searchFilters, profilesPerPage: number, currentPage: number) {
    if (searchFilters.datePicked !== "") {
      searchFilters.datePicked = searchFilters.datePicked.getTime();
    }
    searchFilters.age = this.ageToEpochDate(searchFilters.age)
    console.log(searchFilters);
    const queryParams = `/?pagesize=${profilesPerPage}&page=${currentPage}` +
      `&searchfield=${searchFilters.searchField}&mypatients=${searchFilters.myPatients}` +
      `&age=${searchFilters.age}&gender=${searchFilters.selectedGender}` +
      `&patologies=${searchFilters.patologies}&datepicked=${searchFilters.datePicked}`

    console.log(queryParams);
    // En este no hace falta unscribe ya que se desuscribe solo
    this.http.get<{ message: string, profiles: any, maxProfiles: number }>(BACKEND_URL + "search" + queryParams)
      .pipe(map((profilesData) => {
        return {
          profiles: profilesData.profiles.map(profile => {
            return {
              name: profile.name,
              surname: profile.surname,
              userImagePath: profile.userImagePath,
              userId: profile.linkedAccount,
              responsibles: profile.responsibles,
              rol: profile.__t
            };
          }), maxProfiles: profilesData.maxProfiles
        };

      }))
      .subscribe((transformedProfileData) => {
        //console.log(transformedProfileData);
        this.profiles = transformedProfileData.profiles;
        this.profilesUpdated.next({ profiles: [...this.profiles], profileCount: transformedProfileData.maxProfiles });
      });
  }


  ageToEpochDate(age) {
    //Datos en epoch
    let actualDate = new Date();
    let epochAge = actualDate.setFullYear(actualDate.getFullYear() - age);
    return epochAge;
  }

  modifyMyPatientsRequest(userId: string, mode: boolean) {
    //Si mode es true se anade como responsible
    let editInfo = {
      userId: userId,
      mode: mode
    }
    this.http.post(BACKEND_URL + "editResponsible", editInfo)
      .subscribe((response: any) => {
        console.log(response);
        this.router.navigate(["/"]);
        if (mode) {
          this.openSnackBar("Patient Added", "Ok");
        } else {
          this.openSnackBar("Patient Removed", "Ok");
        }

      });


  }


  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
  /*
    showDialog() {
      this.dialog
        .open(ConfirmDialogComponent, {
          data: `text`
        })
        .afterClosed()
        .subscribe((confirmed: Boolean) => {

         return confirmed;
        });
    }*/
}
