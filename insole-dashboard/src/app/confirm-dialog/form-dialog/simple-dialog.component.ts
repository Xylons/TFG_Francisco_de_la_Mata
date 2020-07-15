import {Component, Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

/**
 * @title Dialog elements
 */
@Component({
  selector: 'dialog-elements-example',
  templateUrl: 'simple-dialog.component.html',
  //styleUrls: ['simple-dialog-component.css'],
})

export class SimpleDialogComponent {
  constructor(public dialog: MatDialogRef<SimpleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string) { }
    closeDialog(): void {
      this.dialog.close();
    }
}
