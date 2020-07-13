import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FiltersBarService } from './filters-bar.service';
import { MatSelectChange } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { Subscription } from 'rxjs';

//All Genders Icon
import { faVenusMars } from '@fortawesome/free-solid-svg-icons';
//Female Icon
import { faVenus } from '@fortawesome/free-solid-svg-icons';
//Male Icon
import { faMars } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-filters-bar',
  templateUrl: './filters-bar.component.html',
  styleUrls: ['./filters-bar.component.css']
})
export class FiltersBarComponent implements OnInit {

  //icons
  faVenusMars = faVenusMars;
  faVenus = faVenus;
  faMars = faMars;

  maxAge = 100;
  minAge = 0;
  genderList = [{ value: 'All', icon: faVenusMars },
  { value: 'Male', icon: faMars }, { value: 'Female', icon: faVenus }];
  minDate: Date;
  maxDate: Date;
  isChecked = true;
  formGroup: FormGroup;
  admDateRange: FormGroup;
  patologies = new FormControl();
  patologiesList: string[];
  @ViewChild('allSelected') private allSelected: MatOption;
  //tengo que cambiar luego a observable
  isLoading = false;
  typeOfBar = 'search';

  private maxAgeSub: Subscription;
  private minAgeSub: Subscription;
  private patologiesListSub: Subscription;

  constructor(public filtersService: FiltersBarService,
    formBuilder: FormBuilder, private authService: AuthService) {

    let date = new Date();
    const currentYear = date.getFullYear();
    this.minDate = new Date(currentYear - 130, 0, 1);
    this.maxDate = date;
    let rol = authService.getRolLogged();
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
    //controlo que los pacientes o undefined no puedan hacer peticiones de los campos de busqueda
    // esto tambien se controla en back
    if (rol !== 'patient' && rol !== 'undefined') {
      this.filtersService.findParams();
      this.maxAgeSub = this.filtersService.getMaxAgeListener()
        .subscribe(maxAge => {
          this.maxAge = maxAge;
        });
      this.minAgeSub = this.filtersService.getMinAgeListener()
        .subscribe(minAge => {
          this.minAge = minAge;
        });
      this.patologiesListSub = this.filtersService.getPatologiesListListener()
        .subscribe(patologiesList => {
          this.patologiesList = patologiesList;
          console.log(this.patologiesList);
        });
    }

  }

  formatLabel(value: number) {
    return value ;
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

    this.typeOfBar = this.filtersService.getTypeOfBar();
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
