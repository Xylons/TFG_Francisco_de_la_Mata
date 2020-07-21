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

  private leftInsoleId;
  private rightInsoleId;

  private LmeanData = new Subject<number[]>();
  private RmeanData = new Subject<number[]>();

  private LmeanDayData = new Subject<number[]>();
  private RmeanDayData = new Subject<number[]>();


  private LAllMeanDays;
  private RAllMeanDays;

  private LAllMeanByHours;
  private RAllMeanByHours;

  private allDatesArray = new Subject<string[]>();
  private activeDate = new Subject<number>();

  /////////////////
  private leftInsoleId2;
  private rightInsoleId2;

  private LmeanData2 = new Subject<number[]>();
  private RmeanData2 = new Subject<number[]>();

  private LmeanDayData2 = new Subject<number[]>();
  private RmeanDayData2 = new Subject<number[]>();


  private LAllMeanDays2;
  private RAllMeanDays2;

  private LAllMeanByHours2;
  private RAllMeanByHours2;

  private allDatesArray2 = new Subject<string[]>();

  private emptyArray = new Array<number>(32);

  getLmeanDataListener2() {
    return this.LmeanData2.asObservable();
  }
  getRmeanDataListener2() {
    return this.RmeanData2.asObservable();
  }

  getLMeanDayDataListener2() {
    return this.LmeanDayData2.asObservable();
  }
  getRMeanDayDataListener2() {
    return this.RmeanDayData2.asObservable();
  }

  getAllDatesArrayListener2() {
    return this.allDatesArray2.asObservable();
  }
  /////////////////

  public changed: boolean;
  private pressureByHour = new Subject<[{ hours: number, meanPressure: [] }]>();

  constructor(private http: HttpClient, private router: Router) {
    this.changed = false;
    for(let i=0; i< this.emptyArray.length; i++ ){
      this.emptyArray[i]=0;
    }

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

  setPressureData(leftInsoleData, rightInsoleData, allUniqueDates, leftInsoleData2?, rightInsoleData2?, allUniqueDates2?) {
    try {
      console.log("Pressure recieved in Insole Service");
      this.LAllMeanDays = leftInsoleData;
      this.RAllMeanDays = rightInsoleData;
      allUniqueDates.sort().reverse();
      this.allDatesArray.next(allUniqueDates);

      if (allUniqueDates[0]) {
        this.LmeanData.next(leftInsoleData.meanByDay[allUniqueDates[0]]);
        this.RmeanData.next(rightInsoleData.meanByDay[allUniqueDates[0]]);

        this.activeDate.next(parseInt(allUniqueDates[0]));
      }
      this.leftInsoleId = leftInsoleData.insoleId;
      this.rightInsoleId = rightInsoleData.insoleId;

      this.getDataByHours(leftInsoleData.insoleId, rightInsoleData.insoleId, parseInt(allUniqueDates[0]));

      if (leftInsoleData2 && rightInsoleData2 && allUniqueDates2) {
        this.LAllMeanDays2 = leftInsoleData2;
        this.RAllMeanDays2 = rightInsoleData2;
        allUniqueDates2.sort().reverse();
        this.allDatesArray2.next(allUniqueDates2);

        if (allUniqueDates2[0]) {
          this.LmeanData2.next(leftInsoleData2.meanByDay[allUniqueDates[0]]);
          this.RmeanData2.next(rightInsoleData2.meanByDay[allUniqueDates[0]]);

        }
        this.leftInsoleId2 = leftInsoleData2.insoleId;
        this.rightInsoleId2 = rightInsoleData2.insoleId;

        this.getDataByHours(leftInsoleData2.insoleId, rightInsoleData2.insoleId, parseInt(allUniqueDates2[0]));
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
    if(!Number.isNaN(day)){
    this.http.get<{
      insoleData: {
        allDatesArray: [], daysAndSteps: {},
        leftInsole: { insoleId: string, meanByDay: [] },
        rightInsole: { insoleId: string, meanByDay: [] }
      }
    }>(BACKEND_URL + "hourdata" + queryParams)
      .subscribe((response) => {
        //esto servira para extraer el maximo el minimo de horas
        this.LAllMeanByHours = response.insoleData.leftInsole.meanByDay;
        this.RAllMeanByHours = response.insoleData.rightInsole.meanByDay;

        this.LmeanDayData.next(this.LAllMeanByHours[0]);
        this.RmeanDayData.next(this.RAllMeanByHours[0]);
      });}
  }



  changeActiveDate(date: number) {
    this.LmeanData.next(this.LAllMeanDays[date]);
    this.RmeanData.next(this.RAllMeanDays[date]);

    //LLamar a solicitar datos por hora
    this.getDataByHours(this.leftInsoleId, this.rightInsoleId, date);

  }

  changeHourData(hour: number) {
    try {
      if (this.LAllMeanByHours[hour] && this.RAllMeanByHours[hour]) {
        this.LmeanDayData.next(this.LAllMeanByHours[hour]);
        this.RmeanDayData.next(this.RAllMeanByHours[hour]);
      }
      else {

        this.LmeanDayData.next(this.emptyArray);
        this.RmeanDayData.next(this.emptyArray);
      }
    } catch{

      this.LmeanDayData.next(this.emptyArray);
      this.RmeanDayData.next(this.emptyArray);
    }
  }


}
