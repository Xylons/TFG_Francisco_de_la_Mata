import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router, ActivatedRoute } from '@angular/router';


// Uso variables de entorno para obtener la direccion API
import { environment } from '../../environments/environment';
import { FormGroup } from '@angular/forms';

//Observable
import { Subject } from 'rxjs';
import { InsoleService } from '../insole/insole.service';
import { PostsService } from '../post/posts.service';


const BACKEND_URL = environment.apiURL + "/dashboard/"
const PATIENTS_BACKEND_URL = environment.apiURL + "/profile/"

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  //Variables usadas en modo single
  private userId = new Subject<string>();
  private allDatesArray = new Subject<string[]>();
  private allDatesArray2 = new Subject<string[]>();
  private allCompareDatesArray = new Subject<string[]>();

  private nameAndSurname = new Subject<string>();

  private leftDatesArray = {};
  private rightDatesArray = {};

  private daysAndSteps = new Subject<{}>();
  private daysAndSteps2 = new Subject<{}>();
  //Variables usadas en modo compare
  private patients = new Subject<{ _id: string; name: string; surname: string; bornDate: number; leftInsole: string; rightInsole: string; linkedAccount: string }[]>();
  private leftDatesArray2 = {};
  private rightDatesArray2 = {};
  private leftInsoleData: {
    meanPressureData: number[], maxPressureData: number[], day: number
    insoleId: string, steps: number
  }[];
  private rightInsoleData: {
    meanPressureData: number[], maxPressureData: number[], day: number
    insoleId: string, steps: number
  }[];

  private leftInsoleData2: {
    meanPressureData: number[], maxPressureData: number[], day: number
    insoleId: string, steps: number
  }[];
  private rightInsoleData2: {
    meanPressureData: number[], maxPressureData: number[], day: number
    insoleId: string, steps: number
  }[];

  patient1AllUniqueDates = [];
  patient2AllUniqueDates = [];

  getUserIdListener() {
    return this.userId.asObservable();
  }
  getAllDatesArrayListener() {
    return this.allDatesArray.asObservable();
  }
  getAllDatesArray2Listener() {
    return this.allDatesArray2.asObservable();
  }
  getAllCompareDatesArrayListener() {
    return this.allCompareDatesArray.asObservable();
  }
  getNameAndSurnameListener() {
    return this.nameAndSurname.asObservable();
  }
  getDaysAndStepsListener() {
    return this.daysAndSteps.asObservable();
  }
  getDaysAndSteps2Listener() {
    return this.daysAndSteps.asObservable();
  }

  getPatientsListener() {
    return this.patients.asObservable();
  }
  constructor(private http: HttpClient, private router: Router, private insoleService: InsoleService,
    private postService: PostsService) {
    console.log(this.router.url);
  }

  setUserId(userId:string){
    console.log(userId);
    this.postService.setPatientId(userId);
    this.userId.next(userId);
  }
  getInsoleData(id: string, days: number, customDay: number) {
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams = `?id=${id}&range=${days}&customday=${customDay}`
    // En este no hace falta unscribe ya que se desuscribe solo
    console.log(BACKEND_URL + "single" + queryParams);

    this.http.get<{
      name: string, surname: string, leftInsole: {
        meanPressureData: number[], maxPressureData: number[], day: number
        insoleId: string, steps: number, name: string, surname: string
      }[], rightInsole: {
        meanPressureData: number[], maxPressureData: number[], day: number
        insoleId: string, steps: number
      }[]

    }>(BACKEND_URL + "single" + queryParams)
      .subscribe((insoleData) => {
        console.log(insoleData);
        this.nameAndSurname.next(insoleData.name + " " + insoleData.surname.charAt(0));
        this.leftInsoleData = insoleData.leftInsole;
        this.rightInsoleData = insoleData.rightInsole;
        let allUniqueDates = this.getAllUniqueDates();
        this.insoleService.setPressureData(insoleData.leftInsole, insoleData.rightInsole, allUniqueDates);
        this.getStepsByDay(insoleData.leftInsole[0].insoleId, insoleData.rightInsole[0].insoleId, customDay)
      });
  }

  getStepsByDay(leftInsoleId: string, rightInsoleId:string, day:number){
    //esto se lanza si elige un dia
   /// `` sirve añadir valores a un string dinamicamente
   const queryParams = `?leftInsoleId=${leftInsoleId}&rightInsoleId=${rightInsoleId}&day=${day}`
   // En este no hace falta unscribe ya que se desuscribe solo
   console.log(BACKEND_URL + "hourdata" + queryParams);

   this.http.get<{
   }>(BACKEND_URL + "hourdata" + queryParams)
     .subscribe((insoleData) => {
       console.log(insoleData);

     });
  }

  getCompareInsoleData(patient1, patient2, days: number, customDay: number) {
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams = `?patient1=${patient1}&patient2=${patient2}&range=${days}&customday=${customDay}`
    // En este no hace falta unscribe ya que se desuscribe solo
    console.log(BACKEND_URL + "compare" + queryParams);

    this.http.get<{
      patient1: {
        leftInsole: {
          meanPressureData: number[], maxPressureData: number[], day: number
          insoleId: string, steps: number
        }[], rightInsole: {
          meanPressureData: number[], maxPressureData: number[], day: number
          insoleId: string, steps: number
        }[]
      }, patient2: {
        leftInsole: {
          meanPressureData: number[], maxPressureData: number[], day: number
          insoleId: string, steps: number,
        }[], rightInsole: {
          meanPressureData: number[], maxPressureData: number[], day: number
          insoleId: string, steps: number
        }[]
      }

    }>(BACKEND_URL + "compare" + queryParams)
      .subscribe((patientsData) => {
        console.log(patientsData);

        this.leftInsoleData = patientsData.patient1.leftInsole;
        this.rightInsoleData = patientsData.patient1.rightInsole;
        this.leftInsoleData2 = patientsData.patient1.leftInsole;
        this.rightInsoleData2 = patientsData.patient1.rightInsole;
        let allCompareUniqueDates = this.getAllUniqueDates(true);
        this.insoleService.setPressureData(this.leftInsoleData,
          this.rightInsoleData, this.patient1AllUniqueDates, this.patient2AllUniqueDates);

      });
  }


  getMyPatientsInfo() {

    // En este no hace falta unscribe ya que se desuscribe solo
    console.log(PATIENTS_BACKEND_URL + "patients");
    //name surname bornDate leftinsole rightinsole
    this.http.get<{
      patients: {
        _id: string, name: string, surname: string,
        bornDate: number, leftInsole: string, rightInsole: string, linkedAccount: string
      }[]

    }>(PATIENTS_BACKEND_URL + "patients")
      .subscribe((response) => {
        console.log(response);
        let patientsList = response.patients;
        this.patients.next(patientsList)
        //this.nameAndSurname.next(insoleData.name + " " + insoleData.surname.charAt(0));

      });
  }

  getAllUniqueDates(compare?: boolean) {
    let daysAndStepsTemp = {};
    this.leftDatesArray=[];
    this.rightDatesArray=[];
    //Anado los datos un array indicando como indice el dia
    for (let i = 0; i < this.leftInsoleData.length; i++) {
      this.leftDatesArray[this.leftInsoleData[i].day] = this.leftInsoleData[i].steps;
      if (daysAndStepsTemp[this.leftInsoleData[i].day]) {
        daysAndStepsTemp[this.leftInsoleData[i].day] += this.leftInsoleData[i].steps;
      } else {
        daysAndStepsTemp[this.leftInsoleData[i].day] = this.leftInsoleData[i].steps;
      }
    }
    for (let i = 0; i < this.rightInsoleData.length; i++) {
      this.rightDatesArray[this.rightInsoleData[i].day] = this.rightInsoleData[i].steps;
      if (daysAndStepsTemp[this.rightInsoleData[i].day]) {
        daysAndStepsTemp[this.rightInsoleData[i].day] += this.rightInsoleData[i].steps;
      } else {
        daysAndStepsTemp[this.rightInsoleData[i].day] = this.rightInsoleData[i].steps;
      }
    }
    //Si esta en modo compare calculo el segundo paciente
    if (compare) {
      let daysAndStepsTemp2 = {};
      this.leftDatesArray2=[];
    this.rightDatesArray2=[];
      for (let i = 0; i < this.leftInsoleData2.length; i++) {
        this.leftDatesArray2[this.leftInsoleData2[i].day] = this.leftInsoleData2[i].steps;
        if (daysAndStepsTemp2[this.leftInsoleData2[i].day]) {
          daysAndStepsTemp2[this.leftInsoleData2[i].day] += this.leftInsoleData2[i].steps;
        } else {
          daysAndStepsTemp2[this.leftInsoleData2[i].day] = this.leftInsoleData2[i].steps;
        }
      }
      for (let i = 0; i < this.rightInsoleData2.length; i++) {
        this.rightDatesArray2[this.rightInsoleData2[i].day] = this.rightInsoleData2[i].steps;
        if (daysAndStepsTemp2[this.rightInsoleData2[i].day]) {
          daysAndStepsTemp2[this.rightInsoleData2[i].day] += this.rightInsoleData2[i].steps;
        } else {
          daysAndStepsTemp2[this.rightInsoleData2[i].day] = this.rightInsoleData2[i].steps;
        }
      }
      let bothDates = [...Object.keys(this.leftDatesArray), ...Object.keys(this.rightDatesArray)];
      let uniqueDates = Array.from(new Set([...bothDates]));
      let bothDates2 = [...Object.keys(this.leftDatesArray2), ...Object.keys(this.rightDatesArray2)];
      let uniqueDates2 = Array.from(new Set([...bothDates2]));

      this.allDatesArray.next(uniqueDates);
      this.allDatesArray2.next(uniqueDates2);
      let bothUsersDates = [...Object.keys(uniqueDates), ...Object.keys(uniqueDates2)]
      this.allCompareDatesArray.next(bothUsersDates);

      this.patient1AllUniqueDates = [...uniqueDates];
      this.patient2AllUniqueDates = [...uniqueDates2];

      this.daysAndSteps.next(daysAndStepsTemp);
    } else {
      //Extraigo las fechas de las dos plantillas y descarto las repetidas con set
      let bothDates = [...Object.keys(this.leftDatesArray), ...Object.keys(this.rightDatesArray)];
      let uniqueDates = Array.from(new Set([...bothDates]));
      this.allDatesArray.next(uniqueDates);
      this.daysAndSteps.next(daysAndStepsTemp);
      return uniqueDates;
    }
  }

}
