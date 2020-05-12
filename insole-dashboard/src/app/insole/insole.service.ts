import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InsoleService {
  public date: Date;
  public changed: boolean;
  constructor() {
    this.changed= false;
  }
}
