import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';


// Uso variables de entorno para obtener la direccion API
import { environment } from '../../environments/environment';
import { FormGroup } from '@angular/forms';


const BACKEND_URL = environment.apiURL + "/search/"

@Injectable({
  providedIn: 'root'
})
export class FiltersBarService {
  public diseases: string[];
  public maxAge: number;
  public minAge: number;
  private searchForm: FormGroup;
  constructor(private http: HttpClient, private router: Router) { }

  setSearchForm(form: FormGroup){
    this.searchForm= form;
  }
  getSearchForm(){
    return this.searchForm;
  }
  findDiseases(){
    return this.http.get<{
      diseases: string[]
    }>(BACKEND_URL );
  }
  findAges(){

  }
}
