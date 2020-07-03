import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FiltersBarService } from './filters-bar.service';
import { MatSelectChange } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'app-filters-bar',
  templateUrl: './filters-bar.component.html',
  styleUrls: ['./filters-bar.component.css']
})
export class FiltersBarComponent implements OnInit {

  genderList: string[] = ['All', 'Male', 'Female'];
  minDate: Date;
  maxDate: Date;
  isChecked = true;
  formGroup: FormGroup;
  admDateRange: FormGroup;
  patologies = new FormControl();
  patologiesList: string[] = ['Dementia', 'Diabetes', 'Parkinson'];
  @ViewChild('allSelected') private allSelected: MatOption;
  //tengo que cambiar luego a observable
  isLoading = false;




  constructor(public filtersService: FiltersBarService,
    formBuilder: FormBuilder) {

    let date = new Date();
    const currentYear = date.getFullYear();
    this.minDate = new Date(currentYear - 130, 0, 1);
    this.maxDate = date;

    this.formGroup = formBuilder.group({
      myPatients: '',
      searchField: '',
      /* dateRange: formBuilder.group({
         startDate: '',
         endDate: ''
       }),*/
      age: '',
      selectedGender: '',
      patologies: '',
      datePicked: '',
    });
    //Guardo el formGroup en service
    this.filtersService.setSearchForm(this.formGroup);

  }

  formatLabel(value: number) {

    return value + 'Y';

  }
  onApplyFilters() {
    console.log(this.formGroup);

  }
  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.formGroup.controls.patologies
        .patchValue(['All']);
    }
  }

  toggleOtherSelection() {
    if (this.allSelected.selected) {
    let valuesArray = this.formGroup.controls.patologies.value;
      const index = this.formGroup.controls.patologies.value.indexOf('All');
      if (index > -1) {
        valuesArray.splice(index, 1);
      }
      this.formGroup.controls.patologies.patchValue(valuesArray);
    }
  }

  ngOnInit(): void {
  }

  //metodo que captura el cambio de patologia
  selectionChanged(event: MatSelectChange) {
    console.log(this.allSelected.selected);
    /*if (event.value.includes('All')) {
      this.formGroup.controls.patologies
        .patchValue(['All']);

      let valuesArray = this.formGroup.controls.patologies.value;
      const index = this.formGroup.controls.patologies.value.indexOf('All');
      if (index > -1) {
        valuesArray.splice(index, 1);
      }
      this.formGroup.controls.patologies.patchValue(valuesArray);
    }*/
  }
  // Metodo para cambiar valores despues de cambiar el filtro
  onChangedDate() {

  }



}
