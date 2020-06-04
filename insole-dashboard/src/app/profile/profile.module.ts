import { NgModule } from '@angular/core';

import { ProfileCheckComponent } from './profile-check/profile-check.component';
import { ProfileListComponent } from './profile-list/profile-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
//Common permite usar ngIf
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    ProfileCheckComponent,
    ProfileListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule]
})
export class ProfileModule { }

