import { NgModule } from '@angular/core';

import { ProfilePageComponent } from './profile-page/profile-page.component';
import { ProfileListComponent } from './profile-list/profile-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
//Common permite usar ngIf
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDividerModule} from '@angular/material/divider';



import { MatButtonModule } from '@angular/material/button';
//FlexLayout
import {FlexLayoutModule} from '@angular/flex-layout';

// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FiltersBarModule } from '../filters-bar/filters-bar.module';
import { PostListComponent } from '../post/post-list/post-list.component';
import { PostModule } from '../post/post.module';
import {MatInputModule} from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import {MatChipsModule} from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

//Formatos de fecha-- no usados de momento
//import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
//import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';


@NgModule({
  declarations: [
    ProfilePageComponent,
    ProfileListComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatButtonModule,
    RouterModule,
    FlexLayoutModule,
    MatDividerModule,
    FontAwesomeModule,
    FiltersBarModule,
    MatInputModule,
    MatRadioModule,
    MatChipsModule,
    MatAutocompleteModule
    ],

})
export class ProfileModule { }

