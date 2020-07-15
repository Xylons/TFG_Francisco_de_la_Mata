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
export class SecondInsoleComponent extends InsoleComponent{


  ngOnInit(): void {

    this.leftMaxDataListener = this.insoleService.getLmaxDataListener()
      .subscribe((maxData) => {
        //this.isLoading = false;
        this.LmaxData = maxData;
        this.onChangeView(true);
      });
    this.leftMeanDataListener = this.insoleService.getLmeanDataListener()
      .subscribe((meanData) => {
        //this.isLoading = false;
        this.LmeanData = meanData;
      });
    this.rightMaxDataListener = this.insoleService.getRmaxDataListener()
      .subscribe((maxData) => {
        //this.isLoading = false;
        this.RmaxData = maxData;
        this.onChangeView(true);
      });
    this.rightMeanDataListener = this.insoleService.getRmeanDataListener()
      .subscribe((meanData) => {
        //this.isLoading = false;
        this.RmeanData = meanData;
      });
      this.allDatesArrayListener = this.insoleService.getAllDatesArrayListener()
      .subscribe((allDatesArray) => {
        this.allDatesArray=[];
        for (let i = 0; i < allDatesArray.length; i++) {
          let dateInfo= {
            key: new Date(parseInt(allDatesArray[i])).toDateString() ,
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

