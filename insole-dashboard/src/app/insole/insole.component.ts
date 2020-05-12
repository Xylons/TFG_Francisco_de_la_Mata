import { Component, OnInit } from '@angular/core';
import { InsoleService } from './insole.service';

@Component({
  selector: 'app-insole',
  templateUrl: './insole.component.svg',
  styleUrls: ['./insole.component.css']
})
export class InsoleComponent implements OnInit {
  Lsensor0: string;Lsensor1: string;Lsensor2: string;Lsensor3: string;
  Lsensor4: string;Lsensor5: string;Lsensor6: string;Lsensor7: string;
  Lsensor8: string;Lsensor9: string;Lsensor10: string;Lsensor11: string;
  Lsensor12: string;Lsensor13: string;Lsensor14: string;Lsensor15: string;
  Lsensor16: string;Lsensor17: string;Lsensor18: string;Lsensor19: string;
  Lsensor20: string;Lsensor21: string;Lsensor22: string;Lsensor23: string;
  Lsensor24: string;Lsensor25: string;Lsensor26: string;Lsensor27: string;
  Lsensor28: string;Lsensor29: string;Lsensor30: string;Lsensor31: string;
  Rsensor0: string;Rsensor1: string;Rsensor2: string;Rsensor3: string;
  Rsensor4: string;Rsensor5: string;Rsensor6: string;Rsensor7: string;
  Rsensor8: string;Rsensor9: string;Rsensor10: string;Rsensor11: string;
  Rsensor12: string;Rsensor13: string;Rsensor14: string;Rsensor15: string;
  Rsensor16: string;Rsensor17: string;Rsensor18: string;Rsensor19: string;
  Rsensor20: string;Rsensor21: string;Rsensor22: string;Rsensor23: string;
  Rsensor24: string;Rsensor25: string;Rsensor26: string;Rsensor27: string;
  Rsensor28: string;Rsensor29: string;Rsensor30: string;Rsensor31: string;
  constructor(public insoleService : InsoleService) { }

  ngOnInit(): void {
  }

  onChangedDate(){

  }

}
