import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';
import { Profile } from './profile.model';

// Uso variables de entorno para obtener la direccion API
import{ environment } from '../../environments/environment';

//Observable
import { Subject } from 'rxjs';
// Map se usa para transformar arrays en otros nuevos
import { map } from 'rxjs/operators'

const BACKEND_URL = environment.apiURL + "/profile/"

//This adds the service in the provide list at app.module.ts
@Injectable({ providedIn: 'root' })

export class ProfilesService {
  private profiles: Profile[] = [];
  private profilesUpdated = new Subject<{profiles:Profile[], profileCount: number}>();


  constructor(private http: HttpClient, private router: Router) { }
  getProfiles(profilesPerPage: number, currentPage: number) {
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams= `?pagesize=${profilesPerPage}&page=${currentPage}`
    // En este no hace falta unscribe ya que se desuscribe solo
    this.http.get<{ message: string, profiles: any , maxProfiles: number}>(BACKEND_URL+ queryParams)
      .pipe(map((profilesData) => {
        return {profiles: profilesData.profiles.map(profile => {
          return {
            name: profile.name,
            surname: profile.surname,
            userImagePath: profile.imagePath,
            userId: profile.linkedAccount
          };
        }), maxProfiles: profilesData.maxProfiles};

      }))
      .subscribe((transformedProfileData) => {
        console.log(transformedProfileData);
        this.profiles = transformedProfileData.profiles;
        this.profilesUpdated.next({profiles:[...this.profiles], profileCount: transformedProfileData.maxProfiles});
      });
  }
  getProfileUpdatedListener() {
    return this.profilesUpdated.asObservable();
  }
  getProfile(id: string){
    return this.http.get<{
      name: string,
      surname: string,
      phone: string,
      userImagePath: string,
      linkedAccount:string
    }>(BACKEND_URL + id);

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

  updateProfile(id: string, name: string, surname: string, phone: string,userImagePath: File | string){
    let profileData: Profile | FormData;
    // Si el objeto es un archivo significa que se ha cambiado
    if(typeof(userImagePath)=== 'object'){
      profileData = new FormData();
      profileData.append("userId", id);
      profileData.append("name", name);
      profileData.append("surname", surname);
      profileData.append("phone", phone);
      profileData.append("userImagePath", userImagePath, name);

    }else{
      profileData=  {
        userId:id,
        name:name,
        surname: surname,
        phone: phone,
        userImagePath: userImagePath
      }

    }

    this.http.put(BACKEND_URL + id, profileData)
    .subscribe(response =>{
      this.router.navigate(["/"]);
    });
  }
  /*deleteProfile(userId: string) {
    return this.http.delete(BACKEND_URL + userId);
  }*/

}
