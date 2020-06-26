import { Component, OnInit } from '@angular/core';
import { InsoleService } from './insole.service';

@Component({
  selector: 'app-insole',
  templateUrl: './insole.component.svg',
  styleUrls: ['./insole.component.css']
})
export class InsoleComponent implements OnInit {
  LsensorsColor = new Array<string>(32);
  RsensorsColor = new Array<string>(32);
  constructor(public insoleService: InsoleService) { }

  ngOnInit(): void {
  }

  // Metodo para cambiar valores despues de cambiar el filtro
  onChangedDate() {

  }

}
