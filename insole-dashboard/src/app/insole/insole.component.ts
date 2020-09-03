import { Component, OnInit } from '@angular/core';
import { InsoleService } from './insole.service';
import { convertActionBinding } from '@angular/compiler/src/compiler_util/expression_converter';
import { Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { environment } from '../../environments/environment';




@Component({
  selector: 'app-insole',
  templateUrl: './insole.component.svg',
  styleUrls: ['./insole.component.css']
})
export class InsoleComponent implements OnInit {
  SERVERURL = environment.serverURL;
  LsensorsColor = new Array<string>(32);
  RsensorsColor = new Array<string>(32);

  LmeanData: number[];
  RmeanData: number[];

  LmeanDataDay: number[];
  RmeanDataDay: number[];

  public leftMeanDataListener: Subscription;
  public rightMeanDataListener: Subscription;
  public leftMeanDayDataListener: Subscription;
  public rightMeanDayDataListener: Subscription;

  LAllMeanByHours: [];
  RAllMeanByHours: [];

  LAllMeanByDays: [];
  RAllMeanByDays: [];

  insolesId:{leftInsoleId: string, rightInsoleId: string};

  public leftAllMeanByHoursListener: Subscription;
  public rightAllMeanByHoursListener: Subscription;
  public leftAllMeanByDaysListener: Subscription;
  public rightAllMeanByDaysListener: Subscription;
  public insolesIdListener: Subscription;


  mode = false;

  public allDatesArrayListener: Subscription;
  public activeDateListener: Subscription;
  allDatesArray: any[] = [];
  public activeDate: number;
  insoleUser: number= 1;
  formGroup: FormGroup;
  dates = new FormControl();
  emptyArray = new Array<number>(32);

  constructor(public insoleService: InsoleService, formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      dates: '',
    });
  }

  ngOnInit(): void {

    for (let i = 0; i < this.emptyArray.length; i++) {
      this.emptyArray[i] = 0;
    }

    this.insolesIdListener = this.insoleService.getLInsolesIdListener()
      .subscribe((insolesId) => {
        this.insolesId = insolesId;
    });

    this.leftAllMeanByDaysListener = this.insoleService.getLAllMeanByDaysListener()
      .subscribe((LAllMeanByDays) => {
        this.LAllMeanByDays = LAllMeanByDays;
      });

      this.rightAllMeanByDaysListener = this.insoleService.getRAllMeanByDaysListener()
      .subscribe((RAllMeanByDays) => {
        this.RAllMeanByDays = RAllMeanByDays;
      });

      this.leftAllMeanByHoursListener = this.insoleService.getLAllMeanByHoursListener()
      .subscribe((LAllMeanByHours) => {
        this.LAllMeanByHours = LAllMeanByHours;
      });

      this.rightAllMeanByHoursListener = this.insoleService.getRAllMeanByHoursListener()
      .subscribe((RAllMeanByHours) => {
        this.RAllMeanByHours = RAllMeanByHours;
      });


    this.leftMeanDayDataListener = this.insoleService.getLMeanDayDataListener()
      .subscribe((meanDayData) => {
        //this.isLoading = false;
        this.LmeanDataDay = meanDayData;
        this.onChangeView(true);
      });

    this.rightMeanDayDataListener = this.insoleService.getRMeanDayDataListener()
      .subscribe((meanDayData) => {
        //this.isLoading = false;
        this.RmeanDataDay = meanDayData;
        this.onChangeView(true);
      });

    this.leftMeanDataListener = this.insoleService.getLmeanDataListener()
      .subscribe((meanData) => {
        //this.isLoading = false;
        this.LmeanData = meanData;
        this.onChangeView(false);
      });

    this.rightMeanDataListener = this.insoleService.getRmeanDataListener()
      .subscribe((meanData) => {
        //this.isLoading = false;
        this.RmeanData = meanData;
        this.onChangeView(false);
      });
    this.allDatesArrayListener = this.insoleService.getAllDatesArrayListener()
      .subscribe((allDatesArray) => {
        console.log(allDatesArray);
        this.allDatesArray = [];
        for (let i = 0; i < allDatesArray.length; i++) {
          let dateInfo = {
            key: new Date(parseInt(allDatesArray[i])).toDateString(),
            value: parseInt(allDatesArray[i])
          };
          this.allDatesArray.push(dateInfo)
        }

      });
    this.activeDateListener = this.insoleService.getActiveDateListener()
      .subscribe((activeDate) => {
        //this.isLoading = false;
        this.activeDate = activeDate;
        this.formGroup.controls.dates
          .patchValue(activeDate);
      });


  }


  changeActiveDate(date: number) {

    this.LmeanData = this.LAllMeanByDays[date];
    this.RmeanData =  this.RAllMeanByDays[date];

    this.onChangeView(false);

    //LLamar a solicitar datos por hora
    this.insoleService.getDataByHours(this.insolesId.leftInsoleId,
       this.insolesId.rightInsoleId, date, this.insoleUser);

  }


  changeHourData(hour: number, insoleUser?: number) {

    try {

        if (this.LAllMeanByHours[hour] && this.RAllMeanByHours[hour]) {
          this.LmeanDataDay = this.LAllMeanByHours[hour];
          this.RmeanDataDay = this.RAllMeanByHours[hour];
          this.onChangeView(true);

        }
        else {
          this.LmeanDataDay = this.emptyArray;
          this.RmeanDataDay = this.emptyArray;
          this.onChangeView(true);
        }


    } catch{

      this.LmeanDataDay = this.emptyArray;
      this.RmeanDataDay = this.emptyArray;
      this.onChangeView(true);
    }
  }

  // Metodo para cambiar valores despues de cambiar el filtro


  hsv2rgb(value) {
    //var hue = ((1 - value) * 160).toString(10);
    //return ["hsl(", hue, ",50%,50%)"].join('');
    var saturation = ((100 - value / 2)).toString() + "%";
    var light = ((100 - value)).toString() + "%";
    return ["hsl(261,", saturation, ",", light, ")"].join('');
  };


  transformNumberToColor(val: number) {
    let min = 0;
    let max = 4096;
    //normalizo los valores entre 0 y 100
    let valN = Math.round(((val - min) / (max - min)) * 100);
    //console.log(valN);
    if (valN > 100) {
      valN = 100;
    }
    else if (valN < 0) {
      valN = 0;
    }
    return this.hsv2rgb(valN);
  }

  selectionDayChanged(event: MatSelectChange) {
    console.log(event.value);
    this.changeActiveDate(event.value);
  }

  onHourChange(event) {
    console.log(event);
    this.changeHourData(parseInt(event.value), this.insoleUser);
  }
  onChangeView(mode: boolean) {


    this.mode = mode;
    //Si se pasa true se muestra el maximo, sino la media
    if (mode) {
      for (let i = 0; i < 32; i++) {
        if (this.LmeanDataDay) { this.LsensorsColor[i] = this.transformNumberToColor(this.LmeanDataDay[i]); }
        if (this.RmeanDataDay) { this.RsensorsColor[i] = this.transformNumberToColor(this.RmeanDataDay[i]); }
      }
    } else {
      for (let i = 0; i < 32; i++) {
        if (this.LmeanData) { this.LsensorsColor[i] = this.transformNumberToColor(this.LmeanData[i]); }
        if (this.RmeanData) { this.RsensorsColor[i] = this.transformNumberToColor(this.RmeanData[i]); }
      }
    }

  }
}

