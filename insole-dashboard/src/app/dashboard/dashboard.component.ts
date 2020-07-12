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
    this.dashboardService.getInsoleData(this.userId, this.days, this.selectedDate.getTime());
  }
  onDateChanged(event: MatDatepickerInputEvent<Date>){
    console.log(event.value);
    this.selectedDate=event.value;
    this.dashboardService.getInsoleData(this.userId, this.days, this.selectedDate.getTime());
  }
  ngOnInit() {
    //Suscripción para detectar cambios en route
    console.log("asdasdad");
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.userId = paramMap.get('userId');
    });
    this.dashboardService.getInsoleData(this.userId, this.days, new Date().getTime());

    this.formGroup.patchValue({
      'datePicked': new Date()
    });
  }
  /// BarChart
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false

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
