import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
//import * as Chart from 'chart.js'
import { Chart } from "chart.js";
import { InsoleService } from '../insole/insole.service';
import { DashboardService } from './dashboard.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userId: string;
  formGroup: FormGroup;
  minDate: Date;
  maxDate: Date= new Date();
  days:number=1;
  selectedDate: Date=new Date();
  mode: string;

  //valores para un unico paciente
  private allDatesArrayListener: Subscription;
  private nameAndSurnameListener: Subscription;
  private daysAndStepsListener: Subscription;
  nameAndSurname:string;
  allDatesArray:any[]=[];
  daysAndSteps={}

  //Valores del primer chart
  barChartLabels: string[];
  barChartData:[{data: number[], label: string}]=[{data:[0], label:""}];
  onebarChartData:{data: number[], label: string}={data: [], label:""};

  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Card 1', cols: 1, rows: 1 },
          { title: 'Card 2', cols: 1, rows: 1 },
          { title: 'Insole', cols: 1, rows: 1 },
          { title: 'Card 4', cols: 1, rows: 1 }
        ];
      }

      return [
        { title: 'Card 1', cols: 2, rows: 1 },
        { title: 'Card 2', cols: 1, rows: 1 },
        { title: 'Insole', cols: 1, rows: 2 },
        { title: 'Card 4', cols: 1, rows: 1 }
      ];
    })
  );

  constructor(private breakpointObserver: BreakpointObserver, private insoleService: InsoleService,
    private dashboardService: DashboardService,
    public route: ActivatedRoute,
    private authService: AuthService, formBuilder: FormBuilder) {
      this.formGroup = formBuilder.group({
        datePicked: '',
      });
    }


  onChangeDays(days: number){
    this.days=days;
    if(this.mode=== 'single'){
    this.dashboardService.getInsoleData(this.userId, this.days, this.selectedDate.getTime());
  }
  }
  onDateChanged(event: MatDatepickerInputEvent<Date>){
    console.log(event.value);
    this.selectedDate=event.value;
    if(this.mode=== 'single'){
    this.dashboardService.getInsoleData(this.userId, this.days, this.selectedDate.getTime());
    }
  }
  ngOnInit() {

    //Suscripción para detectar cambios en route
    console.log("asdasdad");
    // Si la segunda parte de la url es compare es para comparar,
    //si no tiene nada es dashboard general
    this.route.url.subscribe((url) => {
      if(url[1].path === "compare"){
        this.mode= 'compare';
      }else{
        this.mode= 'multiple';
      }
    });
    // si la url contiene un parametro es el dashboard personal
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.userId = paramMap.get('userId');
      if(this.userId !== 'compare'  ){
        this.mode= 'single';

      }
    });
    if(this.mode=== 'single'){
    this.dashboardService.getInsoleData(this.userId, this.days, new Date().getTime());

    this.nameAndSurnameListener = this.dashboardService.getNameAndSurnameListener()
    .subscribe((nameAndSurname) => {
   this.nameAndSurname=nameAndSurname;
   this.onebarChartData.label=nameAndSurname;

    });

    this.daysAndStepsListener = this.dashboardService.getDaysAndStepsListener()
    .subscribe((daysAndSteps) => {
   this.daysAndSteps=daysAndSteps;
   let firstCharData=[]
      this.allDatesArray.forEach((day) =>{
        firstCharData.push(this.daysAndSteps[day]);
      })
      console.log(daysAndSteps);
   this.onebarChartData.data=[...firstCharData];
   //this.barChartData.push(this.onebarChartData);
   this.barChartData=[this.onebarChartData];
    });

}
    this.formGroup.patchValue({
      'datePicked': new Date()
    });

    this.allDatesArrayListener = this.dashboardService.getAllDatesArrayListener()
      .subscribe((allDatesArray) => {
        this.barChartLabels=[];
        this.allDatesArray=allDatesArray;
        for (let i = 0; i < allDatesArray.length; i++) {
          let dateInfo= new Date(parseInt(allDatesArray[i]));
          let dayAndMonth= dateInfo.getDay() + "/"+ dateInfo.getMonth();
          this.barChartLabels.push(dayAndMonth);
          console.log(this.barChartLabels);
        }

      });

  }
  /// BarChart
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: { xAxes: [{}], yAxes: [{ ticks: {beginAtZero: true  } }] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }

  };
  //public barChartLabels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType = 'bar';
  public barChartLegend = true;

 /* public barChartData = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];*/

  ///INSOLE svg

}
