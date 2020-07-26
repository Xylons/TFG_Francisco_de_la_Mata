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
  private descriptionData = new Subject<{name: string,
    surname:string, mms: number,
    getuptest: number, tinetti: number,
    description: string
  }>();
  private stepsByHour = new Subject<{ steps: [], hours: [] }>();

  private leftDatesArray = {};
  private rightDatesArray = {};

  private daysAndSteps = new Subject<{}>();
  private daysAndSteps2 = new Subject<{}>();
  //Variables usadas en modo compare
  private patients = new Subject<{ _id: string; name: string; surname: string; bornDate: number; leftInsole: string; rightInsole: string; linkedAccount: string }[]>();
  private leftDatesArray2 = {};
  private rightDatesArray2 = {};


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
    return this.daysAndSteps2.asObservable();
  }

  getPatientsListener() {
    return this.patients.asObservable();
  }
  getDescriptionDataListener() {
    return this.descriptionData.asObservable();
  }
  constructor(private http: HttpClient, private router: Router, private insoleService: InsoleService,
    private postService: PostsService) {
    console.log(this.router.url);
  }

  setUserId(userId: string) {
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
      name: string, surname: string,
      mms?: number,
      getuptest?:number,
      tinetti?: number,
      description?: string,
      insoleData: {
        allDatesArray: [],
        daysAndSteps: {},
        leftInsole: { insoleId: string, meanByDay: [] },
        rightInsole: { insoleId: string, meanByDay: [] },

      }
    }>(BACKEND_URL + "single" + queryParams)
      .subscribe((response) => {
        console.log(response);
        this.nameAndSurname.next(response.name + " " + response.surname.charAt(0));
        this.allDatesArray.next(response.insoleData.allDatesArray);
        this.daysAndSteps.next(response.insoleData.daysAndSteps);
        if(response.mms || response.tinetti || response.getuptest){
          this.descriptionData.next({
            name: response.name,
            surname: response.surname,
            mms: response.mms,
            tinetti: response.tinetti,
            getuptest: response.getuptest,
            description: response.description
          })
        }
        //Mando la informacion diaria de la presion al componente insole
        this.insoleService.setPressureData(response.insoleData.leftInsole,
          response.insoleData.rightInsole, response.insoleData.allDatesArray);
        if (days === 1) {
          this.getStepsByDay(response.insoleData.leftInsole.insoleId, response.insoleData.rightInsole.insoleId, customDay)
        }
      });
  }

  getStepsByDay(leftInsoleId: string, rightInsoleId: string, day: number) {
    let date = new Date(day);
    date.setDate(date.getDate() - 1);
    day = date.getTime();
    //esto se lanza si elige un dia
    /// `` sirve añadir valores a un string dinamicamente
    const queryParams = `?leftInsoleId=${leftInsoleId}&rightInsoleId=${rightInsoleId}&day=${day}`
    // En este no hace falta unscribe ya que se desuscribe solo
    console.log(BACKEND_URL + "hourdata" + queryParams);
    console.log(day);
    if (!Number.isNaN(day)) {
      this.http.get<{
        insoleData: {
          allDatesArray: [],
          daysAndSteps: {},
          leftInsole: { insoleId: string, meanByDay: [] },
          rightInsole: { insoleId: string, meanByDay: [] },
        }
      }>(BACKEND_URL + "hourdata" + queryParams)
        .subscribe((response) => {
          console.log(response);
          this.allDatesArray.next(response.insoleData.allDatesArray);
          this.daysAndSteps.next(response.insoleData.daysAndSteps);
        });
    }
  }

  getCompareInsoleData(patient1, patient2, days: number, customDay: number) {

    /// `` sirve añadir valores a un string dinamicamente
    const queryParams = `?patient1=${patient1}&patient2=${patient2}&range=${days}&customday=${customDay}`
    // En este no hace falta unscribe ya que se desuscribe solo
    console.log(BACKEND_URL + "compare");

    this.http.get<{
      patient1: {
        name: string, surname: string,

        allDatesArray: [],
        daysAndSteps: {},
        leftInsole: { insoleId: string, meanByDay: [] },
        rightInsole: { insoleId: string, meanByDay: [] },

      }, patient2: {
        name: string, surname: string,

        allDatesArray: [],
        daysAndSteps: {},
        leftInsole: { insoleId: string, meanByDay: [] },
        rightInsole: { insoleId: string, meanByDay: [] },

      }

    }>(BACKEND_URL + "compare" + queryParams)
      .subscribe((response) => {

        let bothDates = [
          ...response.patient1.allDatesArray,
          ...response.patient2.allDatesArray,
        ];
        let allDatesArray = Array.from(new Set([...bothDates]));
        this.allDatesArray.next(allDatesArray);

        console.log(response);
        this.daysAndSteps.next(response.patient1.daysAndSteps);
        //Mando la informacion diaria de la presion al componente insole
        this.daysAndSteps2.next(response.patient2.daysAndSteps);
        let allDatesArray1;
        let allDatesArray2;
        if (days === 1) {
          allDatesArray1 = allDatesArray2 = customDay;
        } else {
          allDatesArray1 = response.patient1.allDatesArray;
          allDatesArray2 = response.patient2.allDatesArray;
        }
        ///hay que pasar a insole los array de cada plantilla NO EL UNIFICADO
        //leftInsoleData, rightInsoleData, allUniqueDates, leftInsoleData2?, rightInsoleData2?, allUniqueDates2?
        this.insoleService.setPressureData(
          response.patient1.leftInsole, response.patient1.rightInsole,
          allDatesArray1, response.patient2.leftInsole,
          response.patient2.rightInsole, allDatesArray2);


        /*this.insoleService.setPressureData(response.patient1.insoleData.leftInsole,
          response.patient1.insoleData.rightInsole, response.patient1.insoleData.allDatesArray);


        /*this.leftInsoleData = response.patient1.insoleData.leftInsole;
        this.rightInsoleData = response.patient1.insoleData.rightInsole;
        this.leftInsoleData2 = response.patient2.insoleData.leftInsole;
        this.rightInsoleData2 = response.patient2.rightInsole;
        //let allCompareUniqueDates = this.getAllUniqueDates(true);
        this.insoleService.setPressureData(this.leftInsoleData,
          this.rightInsoleData, this.patient1AllUniqueDates, this.patient2AllUniqueDates);*/

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


}
