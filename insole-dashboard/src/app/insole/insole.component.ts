import { Component, OnInit } from '@angular/core';
import { InsoleService } from './insole.service';
import { convertActionBinding } from '@angular/compiler/src/compiler_util/expression_converter';
import { Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-insole',
  templateUrl: './insole.component.svg',
  styleUrls: ['./insole.component.css']
})
export class InsoleComponent implements OnInit {
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

  mode = false;

  public allDatesArrayListener: Subscription;
  public activeDateListener: Subscription;
  allDatesArray: any[] = [];
  public activeDate: number;

  formGroup: FormGroup;
  dates = new FormControl();

  constructor(public insoleService: InsoleService, formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      dates: '',
    });
  }

  ngOnInit(): void {

    this.leftMeanDayDataListener = this.insoleService.getLMeanDayDataListener()
      .subscribe((maxData) => {
        //this.isLoading = false;
        this.LmeanDataDay = maxData;
        //this.onChangeView(true);
      });

      this.rightMeanDayDataListener = this.insoleService.getRMeanDayDataListener()
      .subscribe((maxData) => {
        //this.isLoading = false;
        this.RmeanDataDay = maxData;
        //this.onChangeView(true);
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
    this.insoleService.changeActiveDate(event.value);
  }

  onHourChange(event){
    console.log(event);
    this.insoleService.changeHourData(parseInt(event.value));
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

