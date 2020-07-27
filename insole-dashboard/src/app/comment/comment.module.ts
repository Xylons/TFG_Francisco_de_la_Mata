import { NgModule } from '@angular/core';

import { CommentCreateComponent } from './comment-create/comment-create.component';
import { CommentListComponent } from './comment-list/comment-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
//Common permite usar ngIf
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    CommentCreateComponent,
    CommentListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule],
  exports: [
    CommentCreateComponent,
    CommentListComponent
  ],
})
export class CommentModule { }

