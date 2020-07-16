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
//hay que poner nginit especifico
  }

}

