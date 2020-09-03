import { Component, OnInit } from '@angular/core';
import { InsoleService } from './insole.service';
import { convertActionBinding } from '@angular/compiler/src/compiler_util/expression_converter';
import { Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { InsoleComponent } from './insole.component';


@Component({
  selector: 'app-second-insole',
  templateUrl: './insole.component.svg',
  styleUrls: ['./insole.component.css']
})

export class SecondInsoleComponent extends InsoleComponent {
  insoleUser: number= 2;

  ngOnInit(): void {


//hay que poner nginit especifico


for (let i = 0; i < this.emptyArray.length; i++) {
  this.emptyArray[i] = 0;
}

this.insolesIdListener = this.insoleService.getLInsolesIdListener2()
  .subscribe((insolesId) => {
    this.insolesId = insolesId;
});

this.leftAllMeanByDaysListener = this.insoleService.getLAllMeanByDaysListener2()
  .subscribe((LAllMeanByDays) => {
    this.LAllMeanByDays = LAllMeanByDays;
  });

  this.rightAllMeanByDaysListener = this.insoleService.getRAllMeanByDaysListener2()
  .subscribe((RAllMeanByDays) => {
    this.RAllMeanByDays = RAllMeanByDays;
  });

  this.leftAllMeanByHoursListener = this.insoleService.getLAllMeanByHoursListener2()
  .subscribe((LAllMeanByHours) => {
    this.LAllMeanByHours = LAllMeanByHours;
  });

  this.rightAllMeanByHoursListener = this.insoleService.getRAllMeanByHoursListener2()
  .subscribe((RAllMeanByHours) => {
    this.RAllMeanByHours = RAllMeanByHours;
  });


this.leftMeanDayDataListener = this.insoleService.getLMeanDayDataListener2()
  .subscribe((meanDayData) => {
    //this.isLoading = false;
    this.LmeanDataDay = meanDayData;
    this.onChangeView(true);
  });

this.rightMeanDayDataListener = this.insoleService.getRMeanDayDataListener2()
  .subscribe((meanDayData) => {
    //this.isLoading = false;
    this.RmeanDataDay = meanDayData;
    this.onChangeView(true);
  });

this.leftMeanDataListener = this.insoleService.getLmeanDataListener2()
  .subscribe((meanData) => {
    //this.isLoading = false;
    this.LmeanData = meanData;
    this.onChangeView(false);
  });

this.rightMeanDataListener = this.insoleService.getRmeanDataListener2()
  .subscribe((meanData) => {
    //this.isLoading = false;
    this.RmeanData = meanData;
    this.onChangeView(false);
  });
this.allDatesArrayListener = this.insoleService.getAllDatesArrayListener2()
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


}



