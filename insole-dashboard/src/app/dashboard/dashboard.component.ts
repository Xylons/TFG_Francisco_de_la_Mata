import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
//import * as Chart from 'chart.js'
import { Chart } from "chart.js";
import { ChartOptions } from 'chart.js';
import { InsoleService } from '../insole/insole.service';
import { DashboardService } from './dashboard.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Subscription, Observable } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent } from '../confirm-dialog/form-dialog/simple-dialog.component';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userId: string;
  formGroup: FormGroup;
  minDate: Date;
  maxDate: Date = new Date();
  days: number = 1;
  selectedDate: Date = new Date();
  mode: string;
  rol: string;
  //valores para un unico paciente
  private descriptionDataListener: Subscription;
  private allDatesArrayListener: Subscription;
  private nameAndSurnameListener: Subscription;
  private daysAndStepsListener: Subscription;
  private daysAndSteps2Listener: Subscription;
  private infoFormAllUsersListener: Subscription;
  nameAndSurname: string;
  nameAndSurname2: string;
  allDatesArray: any[] = [];
  daysAndSteps = {};
  daysAndSteps2 = {};
  // Datos para descripcion
  name: string;
  surname: string;
  description:string;
  mms: number;
  getuptest: number;
  tinetti: number;

  name2: string;
  surname2: string;
  description2:string;
  mms2: number;
  getuptest2: number;
  tinetti2: number;



  //Valores para comparar pacientes
  private patientsListener: Subscription;
  patients: { _id: string, name: string, surname: string, bornDate: number, leftInsole: string, rightInsole: string, linkedAccount: string }[];

  patient1Info: {
    _id: string, name: string, surname: string,
    bornDate: number, leftInsole: string, rightInsole: string, linkedAccount: string
  };
  patient2Info: {
    _id: string, name: string, surname: string,
    bornDate: number, leftInsole: string, rightInsole: string, linkedAccount: string
  };

  selectedPatient1Params;
   selectedPatient2Params;
  //Valores del primer chart
  lineChartLabels: string[];
  lineChartData: { data: number[], label: string }[] = [{ data: [], label: "" }];
  oneLineChartData: { data: number[], label: string } = { data: [], label: "" };
  twoLineChartData: { data: number[], label: string } = { data: [], label: "" };
  cards: Observable<{
    title: string;
    cols: number;
    rows: number;
  }[]>;
  // Valores chart lineas

  @ViewChild('myCanvas')
  public canvas: ElementRef;
  public context: CanvasRenderingContext2D;
  public chartType: string = 'line';
  public chartData: any[];
  public chartLabels: any[];
  public chartColors: any[];
  public chartOptions: any;

  constructor(private breakpointObserver: BreakpointObserver, private insoleService: InsoleService,
    private dashboardService: DashboardService,
    public route: ActivatedRoute,
    private authService: AuthService, formBuilder: FormBuilder, public dialog: MatDialog) {
      this.rol= authService.getRolLogged();
    this.formGroup = formBuilder.group({
      datePicked: '',
      patient1: '',
      patient2: ''
    });
    this.chartData = [{
      data: [3, 1, 4, 2, 5],
      label: 'Test',
      fill: false
    },
    {
      data: [8, 4, 1, 5, 2],
      label: 'Test',
      fill: false
    },
    ];
    this.chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

    this.chartOptions = {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            stepSize: 100,

          },

          scaleLabel: {
            display: true,
            labelString: 'Steps'
          }
        }],
        xAxes: [{


          scaleLabel: {
            display: true,
            labelString: 'Hours or days'
          }
        }]
      },
      annotation: {
        drawTime: 'beforeDatasetsDraw',
        annotations: [{
          type: 'box',
          id: 'a-box-1',
          yScaleID: 'y-axis-0',
          yMin: 0,
          yMax: 1,
          backgroundColor: '#4cf03b'
        }, {
          type: 'box',
          id: 'a-box-2',
          yScaleID: 'y-axis-0',
          yMin: 1,
          yMax: 2.7,
          backgroundColor: '#fefe32'
        }, {
          type: 'box',
          id: 'a-box-3',
          yScaleID: 'y-axis-0',
          yMin: 2.7,
          yMax: 5,
          backgroundColor: '#fe3232'
        }]
      }
    }

  }



  onChangeDays(days: number) {
    this.days = days;
    if (this.mode === 'single') {
      this.dashboardService.getInsoleData(this.userId, this.days, this.selectedDate.getTime());
    }
    if (this.mode === 'compare') {
      this.dashboardService.getCompareInsoleData(JSON.stringify(this.selectedPatient1Params), JSON.stringify(this.selectedPatient2Params), this.days, this.selectedDate.getTime());

    }
    if(this.mode === 'multiple'){
      this.dashboardService.getAllInsoleData(this.days, this.selectedDate.getTime());
    }
  }
  onDateChanged(event: MatDatepickerInputEvent<Date>) {
    console.log(event.value);
    this.selectedDate = event.value;
    if (this.mode === 'single') {
      this.dashboardService.getInsoleData(this.userId, this.days, this.selectedDate.getTime());
    }
    if (this.mode === 'compare') {
      this.dashboardService.getCompareInsoleData(JSON.stringify(this.selectedPatient1Params), JSON.stringify(this.selectedPatient2Params), this.days, this.selectedDate.getTime());

    }
    if(this.mode === 'multiple'){
      this.dashboardService.getAllInsoleData(this.days, this.selectedDate.getTime());

    }
  }
  ngOnInit() {



    //Suscripción para detectar cambios en route
    console.log("asdasdad");
    // Si la segunda parte de la url es compare es para comparar,
    //si no tiene nada es dashboard general
    this.route.url.subscribe((url) => {
      if (url[1] && url[1].path === "compare") {
        let changed = this.mode !== undefined && this.mode !== 'compare';

        this.mode = 'compare';
        if (changed) { this.ngOnInit(); }

      } else {

        this.mode = 'multiple';

      }
    });
    // si la url contiene un parametro es el dashboard personal
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.userId = paramMap.get('userId');

      if (this.userId && this.userId!== 'compare') {

        this.mode = 'single';
        this.dashboardService.setUserId(this.userId);

      }
    });

    /** Based on the screen size, switch from standard to one column per row */
    this.cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(({ matches }) => {
        if (this.mode === 'single') {
          if (matches) {
            return [
              { title: 'Evolution', cols: 1, rows: 1 },
              { title: 'Comments', cols: 1, rows: 1 },
              { title: 'Insole', cols: 1, rows: 1 },
            ];
          }

          return [
            { title: 'Evolution', cols: 2, rows: 1 },
            { title: 'Comments', cols: 1, rows: 2 },
            { title: 'Insole', cols: 1, rows: 2 },
          ];
        }
        if (this.mode === 'compare') {
          if (matches) {
            return [
              { title: 'Evolution', cols: 1, rows: 1 },
              { title: 'Insole', cols: 1, rows: 1 },
              { title: 'Insole2', cols: 1, rows: 1 },
            ];
          }

          return [
            { title: 'Evolution', cols: 2, rows: 1 },
            { title: 'Insole', cols: 1, rows: 2 },
            { title: 'Insole2', cols: 1, rows: 2 },
          ];
        }

        if (this.mode === 'multiple') {
          if (matches) {
            return [
              { title: 'All Users Data', cols: 1, rows: 1 },

            ];
          }

          return [
            { title: 'All Users Data', cols: 2, rows: 2 },

          ];
        }
      })
    );

    if (this.mode === 'single') {
      this.dashboardService.getInsoleData(this.userId, this.days, new Date().getTime());
    }
      this.nameAndSurnameListener = this.dashboardService.getNameAndSurnameListener()
        .subscribe((nameAndSurname) => {
          this.nameAndSurname = nameAndSurname;
          this.oneLineChartData.label = nameAndSurname;

        });

        this.descriptionDataListener = this.dashboardService.getDescriptionDataListener()
        .subscribe((descriptionData) => {
          this.name= descriptionData.name;
          this.surname= descriptionData.surname;
          this.mms= descriptionData.mms;
          this.getuptest= descriptionData.getuptest;
          this.tinetti= descriptionData.tinetti;
          this.description= descriptionData.description;
        });

      this.daysAndStepsListener = this.dashboardService.getDaysAndStepsListener()
        .subscribe((daysAndSteps) => {
          this.daysAndSteps = daysAndSteps;
          let firstCharData = []
          this.allDatesArray.forEach((day) => {
            firstCharData.push(this.daysAndSteps[day]);
          })
          console.log(daysAndSteps);
          //Hago reverse() para que coincida con los valores de las label
          this.oneLineChartData.data = [];
          //Si son horas no hay que hacer reverse ya que llega correcto
          if (this.days === 1) {
            this.oneLineChartData.data = [...firstCharData];
          } else {
            this.oneLineChartData.data = [...firstCharData.reverse()];
          }

          //this.barChartData.push(this.onebarChartData);
          this.lineChartData = [this.oneLineChartData];
        });





    if (this.mode === 'compare') {
      this.dashboardService.getMyPatientsInfo();
      this.patientsListener = this.dashboardService.getPatientsListener()
        .subscribe((patients) => {
          this.patients = patients;

        });

        this.daysAndSteps2Listener = this.dashboardService.getDaysAndSteps2Listener()
        .subscribe((daysAndSteps2) => {
          this.daysAndSteps2 = daysAndSteps2;
          let firstCharData = []
          this.allDatesArray.forEach((day) => {
            firstCharData.push(this.daysAndSteps2[day]);
          })
          console.log(daysAndSteps2);
          //Hago reverse() para que coincida con los valores de las label
          this.twoLineChartData.data = [];
          this.twoLineChartData.label = this.nameAndSurname2;
          //Si son horas no hay que hacer reverse ya que llega correcto
          if (this.days === 1) {
            this.twoLineChartData.data = [...firstCharData];
          } else {
            this.twoLineChartData.data = [...firstCharData.reverse()];
          }

          this.lineChartData = [this.oneLineChartData, this.twoLineChartData];
        });
    }
    if(this.mode==='multiple'){
      this.infoFormAllUsersListener = this.dashboardService.getInfoFormAllUsersListener()
        .subscribe((allUsersInfo) => {
          this.barChartData=allUsersInfo.allData;
          this.barChartLabels=allUsersInfo.allLabels;
        });
      this.dashboardService.getAllInsoleData(this.days, this.selectedDate.getTime());

    }
    this.formGroup.patchValue({
      'datePicked': new Date()

    });

    this.allDatesArrayListener = this.dashboardService.getAllDatesArrayListener()
      .subscribe((allDatesArray) => {
        this.lineChartLabels = [];
        console.log(allDatesArray);
        this.allDatesArray = allDatesArray;
        // For inverso para respetar el orden de fechas
        for (let i = allDatesArray.length - 1; i >= 0; i--) {

          let dayAndMonth;
          if (this.days == 1) {
            dayAndMonth = allDatesArray[(i - (allDatesArray.length - 1)) * -1];
          } else {
            let dateInfo = new Date(parseInt(allDatesArray[i]));
            dayAndMonth = dateInfo.getDate() + "/" + (dateInfo.getMonth() + 1);
          }
          this.lineChartLabels.push(dayAndMonth);
          //console.log(this.lineChartLabels);
        }

      });


  }

  selectionChanged(event: MatSelectChange, numberOfPatient: number) {
    console.log(event);
    this.patient1Info = this.formGroup.get('patient1').value;
    this.patient2Info = this.formGroup.get('patient2').value;
    //comprobacion de usuarios sin plantillas asignadas
    if (numberOfPatient === 1 && !this.patient1Info.leftInsole && !this.patient1Info.rightInsole) {
      this.dialog
        .open(SimpleDialogComponent, {
          data: 'The user ' + this.patient1Info.name + ' ' + this.patient1Info.surname + ' does not have Insoles'
        });
      this.formGroup.get('patient1').patchValue("");
    }
    else if (numberOfPatient === 2 && !this.patient2Info.leftInsole && !this.patient2Info.rightInsole) {
      this.dialog
        .open(SimpleDialogComponent, {
          data: 'The user ' + this.patient2Info.name + ' ' + this.patient2Info.surname + ' does not have Insoles'
        });
      this.formGroup.get('patient2').patchValue("");
    }

    else if (this.patient1Info && this.patient2Info) {
      if (this.patient1Info !== this.patient2Info) {
        this.nameAndSurname = this.patient1Info.name + ' ' + this.patient1Info.surname.charAt(0);
        this.oneLineChartData.label = this.nameAndSurname;
        this.nameAndSurname2 = this.patient2Info.name + ' ' + this.patient2Info.surname.charAt(0);
        //Hago copia profunda del objeto para modificarlo
        let sendedPatient1 = JSON.parse(JSON.stringify(this.patient1Info));
        delete sendedPatient1.__t,
          delete sendedPatient1._id, delete sendedPatient1.name,
          delete sendedPatient1.surname, delete sendedPatient1.bornDate;
        let sendedPatient2 = JSON.parse(JSON.stringify(this.patient2Info));
        delete sendedPatient2.__t,
          delete sendedPatient2._id, delete sendedPatient2.name,
          delete sendedPatient2.surname, delete sendedPatient2.bornDate;
        this.selectedPatient1Params= sendedPatient1;
        this.selectedPatient2Params= sendedPatient2;
        console.log(sendedPatient1);
        this.dashboardService.getCompareInsoleData(JSON.stringify(sendedPatient1), JSON.stringify(sendedPatient2), this.days, this.selectedDate.getTime());


      } else {
        this.dialog
          .open(SimpleDialogComponent, {
            data: 'Choose diferent users'
          });
      }

    }


  }
  /// BarChart
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,

     scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          stepSize: 200,

        },

        scaleLabel: {
          display: true,
          labelString: 'Steps'
        }
      }],
      xAxes: [{


        scaleLabel: {
          display: true,
          labelString: 'Days'
        }
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }

  };
  public barChartLabels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType = 'bar';
  public barChartLegend = true;

   public barChartData = [
     { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
     { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
   ];

  ///INSOLE svg

}
