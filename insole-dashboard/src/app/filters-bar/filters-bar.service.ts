import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';


// Uso variables de entorno para obtener la direccion API
import { environment } from '../../environments/environment';
import { FormGroup } from '@angular/forms';

//Observable
import { Subject } from 'rxjs';


const PROFILES_BACKEND_URL = environment.apiURL + "/profile/"
const INSOLEDATA_BACKEND_URL = environment.apiURL + "/INSOLE/"

@Injectable({
  providedIn: 'root'
})
export class FiltersBarService {
  public patologies: string[];
  public maxAge= new Subject<number>();
  public minAge= new Subject<number>();

  public patologiesList = new Subject<string[]>();
  private searchForm: FormGroup;
  private typeOfBar= 'profiles';
  constructor(private http: HttpClient, private router: Router) { }

  getMinAgeListener(){
    return this.minAge.asObservable();
  }

  getMaxAgeListener(){
    return this.maxAge.asObservable();
  }
  getPatologiesListListener(){
    return this.patologiesList.asObservable();
  }
  getTypeOfBar(){
    return this.typeOfBar;
  }

  setTypeOfBar(type: string){
    this.typeOfBar= type;
  }
  setSearchForm(form: FormGroup){

    this.searchForm= form;
  }
  getSearchForm(){
    console.log(this.searchForm);
    return this.searchForm;
  }
  findParams(){

      // En este no hace falta unscribe ya que se desuscribe solo
      this.http.get<{ maxAge: number, minAge: number, patologies: string[] }>(PROFILES_BACKEND_URL +"params" )

        .subscribe((paramsData) => {
          console.log(paramsData);
          this.maxAge.next(paramsData.maxAge);
          this.minAge.next(paramsData.minAge);
          this.patologiesList.next(paramsData.patologies);
          console.log(paramsData.patologies);
        });
  }


}
