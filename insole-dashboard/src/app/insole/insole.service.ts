import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';


// Uso variables de entorno para obtener la direccion API
import { environment } from '../../environments/environment';
import { FormGroup } from '@angular/forms';

//Observable
import { Subject } from 'rxjs';


const BACKEND_URL = environment.apiURL + "/dashboard/";

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




  private allDatesArray = new Subject<string[]>();
  private activeDate = new Subject<number>();

  /////////////////
  private leftInsoleId2;
  private rightInsoleId2;

  private LmeanData2 = new Subject<number[]>();
  private RmeanData2 = new Subject<number[]>();

  private LmeanDayData2 = new Subject<number[]>();
  private RmeanDayData2 = new Subject<number[]>();




  private allDatesArray2 = new Subject<string[]>();

  ///
  private lAllMeanByHours2 = new Subject<[]>();
  private rAllMeanByHours2 = new Subject<[]>();

  private lAllMeanByDays2 = new Subject<[]>();
  private rAllMeanByDays2 = new Subject<[]>();


  private lAllMeanByHours = new Subject<[]>();
  private rAllMeanByHours = new Subject<[]>();

  private lAllMeanByDays = new Subject<[]>();
  private rAllMeanByDays = new Subject<[]>();


  private emptyArray = new Array<number>(32);



  getLAllMeanByHoursListener() {
    return this.lAllMeanByHours.asObservable();
  }
  getRAllMeanByHoursListener() {
    return this.rAllMeanByHours.asObservable();
  }

  getLAllMeanByDaysListener() {
    return this.lAllMeanByDays.asObservable();
  }
  getRAllMeanByDaysListener() {
    return this.rAllMeanByDays.asObservable();
  }


  getLAllMeanByHoursListener2() {
    return this.lAllMeanByHours2.asObservable();
  }
  getRAllMeanByHoursListener2() {
    return this.rAllMeanByHours2.asObservable();
  }

  getLAllMeanByDaysListener2() {
    return this.lAllMeanByDays2.asObservable();
  }
  getRAllMeanByDaysListener2() {
    return this.rAllMeanByDays2.asObservable();
  }


  private insolesId = new Subject<{ leftInsoleId: string, rightInsoleId: string }>();
  private insolesId2 = new Subject<{ leftInsoleId: string, rightInsoleId: string }>();


  getLInsolesIdListener() {
    return this.insolesId.asObservable();
  }
  getLInsolesIdListener2() {
    return this.insolesId2.asObservable();
  }

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
    for (let i = 0; i < this.emptyArray.length; i++) {
      this.emptyArray[i] = 0;
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

      this.lAllMeanByDays.next(leftInsoleData.meanByDay);
      this.rAllMeanByDays.next(rightInsoleData.meanByDay);

      if (typeof allUniqueDates !== "object") {
        allUniqueDates = [allUniqueDates.toString()]
      }
      allUniqueDates.sort().reverse();
      this.allDatesArray.next(allUniqueDates);

      if (allUniqueDates[0]) {
        this.LmeanData.next(leftInsoleData.meanByDay[allUniqueDates[0]]);
        this.RmeanData.next(rightInsoleData.meanByDay[allUniqueDates[0]]);

        this.activeDate.next(parseInt(allUniqueDates[0]));
      }


      this.insolesId.next({ leftInsoleId: leftInsoleData.insoleId, rightInsoleId: rightInsoleData.insoleId });

      this.getDataByHours(leftInsoleData.insoleId, rightInsoleData.insoleId, parseInt(allUniqueDates[0]), 1);

      if (leftInsoleData2 && rightInsoleData2 && allUniqueDates2) {
        this.lAllMeanByDays2.next(leftInsoleData2.meanByDay);
        this.rAllMeanByDays2.next(rightInsoleData2.meanByDay);
        if (typeof allUniqueDates2 !== "object") {
          allUniqueDates2 = [allUniqueDates2.toString()]
        }
        allUniqueDates2.sort().reverse();
        this.allDatesArray2.next(allUniqueDates2);

        if (allUniqueDates2[0]) {
          this.LmeanData2.next(leftInsoleData2.meanByDay[allUniqueDates2[0]]);
          this.RmeanData2.next(rightInsoleData2.meanByDay[allUniqueDates2[0]]);

        }

        this.insolesId2.next({ leftInsoleId: leftInsoleData2.insoleId, rightInsoleId: rightInsoleData2.insoleId });

        this.getDataByHours(leftInsoleData2.insoleId, rightInsoleData2.insoleId, parseInt(allUniqueDates2[0]), 2);
      }
    } catch (error) {

    }

  }
  getDataByHours(leftInsoleId: string, rightInsoleId: string, day: number, insoleUser: number) {
    //esto se lanza si elige un dia
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams = `?leftInsoleId=${leftInsoleId}&rightInsoleId=${rightInsoleId}&day=${day}`
    // En este no hace falta unscribe ya que se desuscribe solo
    console.log(BACKEND_URL + "hourdata" + queryParams);
    if (!Number.isNaN(day)) {
      this.http.get<{
        insoleData: {
          allDatesArray: [], daysAndSteps: {},
          leftInsole: { insoleId: string, meanByDay: [] },
          rightInsole: { insoleId: string, meanByDay: [] }
        }
      }>(BACKEND_URL + "hourdata" + queryParams)
        .subscribe((response) => {
          if (insoleUser === 1) {
            //esto servira para extraer el maximo el minimo de horas
            this.lAllMeanByHours.next(response.insoleData.leftInsole.meanByDay);
            this.rAllMeanByHours.next(response.insoleData.rightInsole.meanByDay);
            let firstValueLAllMeanByHours;
            let firstValueRAllMeanByHours;
            firstValueLAllMeanByHours = response.insoleData.leftInsole.meanByDay;
            firstValueRAllMeanByHours = response.insoleData.rightInsole.meanByDay;
            this.LmeanDayData.next(firstValueLAllMeanByHours[Object.keys(firstValueLAllMeanByHours)[0]]);
            this.RmeanDayData.next(firstValueRAllMeanByHours[Object.keys(firstValueRAllMeanByHours)[0]]);
          } else {
            this.lAllMeanByHours2.next(response.insoleData.leftInsole.meanByDay);
            this.rAllMeanByHours2.next(response.insoleData.rightInsole.meanByDay);
            let firstValueLAllMeanByHours;
            let firstValueRAllMeanByHours;
            firstValueLAllMeanByHours = response.insoleData.leftInsole.meanByDay;
            firstValueRAllMeanByHours = response.insoleData.rightInsole.meanByDay;
            this.LmeanDayData2.next(firstValueLAllMeanByHours[Object.keys(firstValueLAllMeanByHours)[0]]);
            this.RmeanDayData2.next(firstValueRAllMeanByHours[Object.keys(firstValueRAllMeanByHours)[0]]);
          }
        });
    }
  }







}
