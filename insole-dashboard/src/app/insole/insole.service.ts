import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';


// Uso variables de entorno para obtener la direccion API
import { environment } from '../../environments/environment';
import { FormGroup } from '@angular/forms';

//Observable
import { Subject } from 'rxjs';


const BACKEND_URL = environment.apiURL + "/dashboard/"

@Injectable({
  providedIn: 'root'
})
export class InsoleService {

  private LmeanData = new Subject<number[]>();
  private RmeanData = new Subject<number[]>();

  private LmeanDayData = new Subject<number[]>();
  private RmeanDayData = new Subject<number[]>();



  private LAllMeanDays;
  private RAllMeanDays;

  private allDatesArray = new Subject<string[]>();
  private activeDate = new Subject<number>();
  public changed: boolean;
  private pressureByHour = new Subject<[{ hours: number, meanPressure: [] }]>();

  constructor(private http: HttpClient, private router: Router) {
    this.changed = false;
  }



  getLmeanDataListener() {
    return this.LmeanData.asObservable();
  }
  getRmeanDataListener() {
    return this.RmeanData.asObservable();
  }

  getLMeanDayDataListener() {
    return this.LmeanDayData.asObservable();
  }
  getRMeanDayDataListener() {
    return this.RmeanDayData.asObservable();
  }


  getActiveDateListener() {
    return this.activeDate.asObservable();
  }
  getAllDatesArrayListener() {
    return this.allDatesArray.asObservable();
  }

  setPressureData(leftInsoleData, rightInsoleData, allUniqueDates, allUniqueDates2?) {
    try {
      console.log("Pressure recieved in Insole Service");
      this.LAllMeanDays = leftInsoleData;
      this.RAllMeanDays = rightInsoleData;
      this.allDatesArray.next(allUniqueDates);

      this.LmeanData.next(leftInsoleData.meanByDay[allUniqueDates[0]]);
      this.RmeanData.next(rightInsoleData.meanByDay[allUniqueDates[0]]);

      this.activeDate.next(parseInt(allUniqueDates[0]));

      this.getDataByHours(leftInsoleData.insoleId, rightInsoleData.insoleId, parseInt(allUniqueDates[0]))

      if (allUniqueDates2) {

      }
    } catch (error) {

    }

  }
  getDataByHours(leftInsoleId: string, rightInsoleId: string, day: number) {
    //esto se lanza si elige un dia
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams = `?leftInsoleId=${leftInsoleId}&rightInsoleId=${rightInsoleId}&day=${day}`
    // En este no hace falta unscribe ya que se desuscribe solo
    console.log(BACKEND_URL + "hourdata" + queryParams);

    this.http.get<{
    }>(BACKEND_URL + "hourdata" + queryParams)
      .subscribe((insoleData) => {
        console.log(insoleData);
        let temporalStepsByHour;

      });
  }



  changeActiveDate(date: number) {
    this.LmeanData.next(this.LAllMeanDays[date]);
      this.RmeanData.next(this.RAllMeanDays[date]);

    //LLamar a solicitar datos por hora
  }

  changeHourData(date: number) {
    this.LmeanDayData.next();
      this.RmeanDayData.next();
  }


}
