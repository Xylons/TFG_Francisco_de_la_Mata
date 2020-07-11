import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';


// Uso variables de entorno para obtener la direccion API
import { environment } from '../../environments/environment';
import { FormGroup } from '@angular/forms';

//Observable
import { Subject } from 'rxjs';
import { InsoleService } from '../insole/insole.service';


const BACKEND_URL = environment.apiURL + "/dashboard/"


@Injectable({
  providedIn: 'root'
})
export class DashboardService {


  constructor(private http: HttpClient, private router: Router, private insoleService: InsoleService) { }

  getInsoleData(id: string, days: number, customDay:number ) {
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams = `?id=${id}&range=${days}&customday=${customDay}`
    // En este no hace falta unscribe ya que se desuscribe solo
    console.log(BACKEND_URL + "single" + queryParams);

    this.http.get<{ leftInsole:{meanPressureData: number[], maxPressureData: number[], day: number
      insoleId: string, steps: number}, rightInsole:{meanPressureData: number[], maxPressureData: number[], day: number
        insoleId: string, steps: number}

    }>(BACKEND_URL + "single" + queryParams)
      .subscribe((insoleData) => {
        console.log(insoleData);
        this.insoleService.setPressureData(insoleData.leftInsole, insoleData.rightInsole);
      });
  }

}
