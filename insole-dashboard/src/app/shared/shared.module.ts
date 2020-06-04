import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordValidator } from './passwordValidator';

@NgModule({
 declarations: [PasswordValidator],
 exports:[PasswordValidator, CommonModule, FormsModule ]
})
export class SharedModule{}
