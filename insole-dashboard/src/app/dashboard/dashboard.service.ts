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
  private allDatesArray = new Subject<string[]>();
  private nameAndSurname = new Subject<string>();

  private leftDatesArray = {};
  private rightDatesArray = {};

  private daysAndSteps=new Subject<{}>();

  private leftInsoleData: {
    meanPressureData: number[], maxPressureData: number[], day: number
    insoleId: string, steps: number
  }[];
  private rightInsoleData: {
    meanPressureData: number[], maxPressureData: number[], day: number
    insoleId: string, steps: number
  }[];

  getAllDatesArrayListener() {
    return this.allDatesArray.asObservable();
  }
  getNameAndSurnameListener() {
    return this.nameAndSurname.asObservable();
  }
  getDaysAndStepsListener() {
    return this.daysAndSteps.asObservable();
  }
  constructor(private http: HttpClient, private router: Router, private insoleService: InsoleService) { }

  getInsoleData(id: string, days: number, customDay:number ) {
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams = `?id=${id}&range=${days}&customday=${customDay}`
    // En este no hace falta unscribe ya que se desuscribe solo
    console.log(BACKEND_URL + "single" + queryParams);

    this.http.get<{ name: string, surname:string, leftInsole:{meanPressureData: number[], maxPressureData: number[], day: number
      insoleId: string, steps: number, name: string, surname:string}[], rightInsole:{meanPressureData: number[], maxPressureData: number[], day: number
        insoleId: string, steps: number }[]

    }>(BACKEND_URL + "single" + queryParams)
      .subscribe((insoleData) => {
        console.log(insoleData);
        this.nameAndSurname.next(insoleData.name + " " + insoleData.surname.charAt(0));
        this.leftInsoleData = insoleData.leftInsole;
        this.rightInsoleData = insoleData.rightInsole;
        let allUniqueDates= this.getAllUniqueDates();
        this.insoleService.setPressureData(insoleData.leftInsole, insoleData.rightInsole, allUniqueDates);
      });
  }
  getAllUniqueDates() {
    let daysAndStepsTemp={};
    //Anado los datos un array indicando como indice el dia
    for (let i = 0; i < this.leftInsoleData.length; i++) {
      this.leftDatesArray[this.leftInsoleData[i].day] = this.leftInsoleData[i].steps;
      if(daysAndStepsTemp[this.leftInsoleData[i].day]){
      daysAndStepsTemp[this.leftInsoleData[i].day] += this.leftInsoleData[i].steps;}else{
        daysAndStepsTemp[this.leftInsoleData[i].day] = this.leftInsoleData[i].steps;
      }
    }
    for (let i = 0; i < this.rightInsoleData.length; i++) {
      this.rightDatesArray[this.rightInsoleData[i].day] = this.rightInsoleData[i].steps;
      if(daysAndStepsTemp[this.rightInsoleData[i].day]){
      daysAndStepsTemp[this.rightInsoleData[i].day] += this.rightInsoleData[i].steps;}else{
        daysAndStepsTemp[this.rightInsoleData[i].day] = this.rightInsoleData[i].steps;
      }
    }
    //Extraigo las fechas de las dos plantillas y descarto las repetidas con set
    let bothDates = [...Object.keys(this.leftDatesArray), ...Object.keys(this.rightDatesArray)]
    let uniqueDates= Array.from(new Set([...bothDates]));
    this.allDatesArray.next(uniqueDates);
    this.daysAndSteps.next(daysAndStepsTemp);
    return  uniqueDates;
  }
}
