import { NgModule } from '@angular/core';


import { FiltersBarComponent } from './filters-bar.component';
import { AngularMaterialModule } from '../angular-material.module';

//Material de este modulo
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import {SliderModule} from 'primeng/slider';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatGridListModule} from '@angular/material/grid-list';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
  declarations: [
    FiltersBarComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    AngularMaterialModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    MatSelectModule,
    MatGridListModule,
    FontAwesomeModule

  ],
  exports: [
    FiltersBarComponent
  ]
})
export class FiltersBarModule { }
