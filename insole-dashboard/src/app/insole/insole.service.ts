import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';


// Uso variables de entorno para obtener la direccion API
import { environment } from '../../environments/environment';
import { FormGroup } from '@angular/forms';

//Observable
import { Subject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class InsoleService {
  private LmaxData = new Subject<number[]>();
  private LmeanData = new Subject<number[]>();
  private RmaxData = new Subject<number[]>();
  private RmeanData = new Subject<number[]>();
  private leftInsoleData: {
    meanPressureData: number[], maxPressureData: number[], day: number
    insoleId: string, steps: number
  }[];
  private rightInsoleData: {
    meanPressureData: number[], maxPressureData: number[], day: number
    insoleId: string, steps: number
  }[];

  private leftDatesArray = {};
  private rightDatesArray = {};
  private allDatesArray = new Subject<string[]>();
  private activeDate = new Subject<number>();
  public changed: boolean;

  constructor(private http: HttpClient, private router: Router) {
    this.changed = false;
  }

  getLmaxDataListener() {
    return this.LmaxData.asObservable();
  }

  getLmeanDataListener() {
    return this.LmeanData.asObservable();
  }

  getRmaxDataListener() {
    return this.RmaxData.asObservable();
  }

  getRmeanDataListener() {
    return this.RmeanData.asObservable();
  }
  getActiveDateListener() {
    return this.activeDate.asObservable();
  }
  getAllDatesArrayListener() {
    return this.allDatesArray.asObservable();
  }

  setPressureData(leftInsoleData, rightInsoleData) {
    try{
    this.leftInsoleData = leftInsoleData;
    this.rightInsoleData = rightInsoleData;
    if (rightInsoleData[0].day === rightInsoleData[0].day) {
      this.LmaxData.next(leftInsoleData[0].maxPressureData);
      this.LmeanData.next(leftInsoleData[0].meanPressureData);
      this.RmaxData.next(rightInsoleData[0].maxPressureData);
      this.RmeanData.next(rightInsoleData[0].meanPressureData);
      this.activeDate.next(rightInsoleData[0].day);
      this.getAllUniqueDates();
    } else {
      this.LmaxData.next(leftInsoleData[0].maxPressureData);
      this.LmeanData.next(leftInsoleData[0].meanPressureData);
      this.activeDate.next(rightInsoleData[0].day);
    }
    }catch (error) {

    }

  }

  changeActiveDate(date: number) {

  }

  getAllUniqueDates() {
    for (let i = 0; i < this.leftInsoleData.length; i++) {
      this.leftDatesArray[this.leftInsoleData[i].day] = i;
    }
    for (let i = 0; i < this.rightInsoleData.length; i++) {
      this.rightDatesArray[this.rightInsoleData[i].day] = i;
    }
    //Extraigo las fechas de las dos plantillas y descarto las repetidas con set
    let bothDates = [...Object.keys(this.leftDatesArray), ...Object.keys(this.rightDatesArray)]
    this.allDatesArray.next(Array.from(new Set([...bothDates])));

  }
}
