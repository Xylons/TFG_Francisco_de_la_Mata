import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

//Servicio
import { CommentsService } from '../comments.service';
import { Comment } from '../comment.model';

//Validator personalizado
import {mimeType} from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';







@Component({
  selector: 'app-comment-create',
  templateUrl: './comment-create.component.html',
  styleUrls: ['./comment-create.component.css']
})
export class CommentCreateComponent implements OnInit, OnDestroy {

  enteredTitle = '';
  enteredContent = '';
  comment: Comment;
  isLoading = false;
  form: FormGroup;
  private mode = 'create';
  private commentId: string;

  //Suscripcion para control de errores
  private authStatusSub: Subscription;
  @ViewChild('formDirective') formDirective;
  constructor(
    public commentsService: CommentsService,
    public route: ActivatedRoute,
    private authService: AuthService,
     ) { }

  //route contiene información sobre nuestras rutas
  //En este tipo de observable no hace falta desuscribirse
  //La función de dentro de subscribe se ejecutará cuando cambie la ruta

  ngOnInit() {

    //Me suscribo para detectar si hay cambios en el estado de autenticacion
   this.authStatusSub= this.authService.getAuthStatusListener().subscribe(authStatus =>{
     this.isLoading =false;
   });
    this.form = new FormGroup({
      /// Se puede añadir updateOn para ver cuando se valida
      //null es el valor inicial
      'title': new FormControl(null, {
        validators: [Validators.required,
        Validators.minLength(3)]
      }),
      'content': new FormControl(null, { validators: Validators.required }),

    });
    //Suscripción para detectar cambios en route
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // revisa si existe el parametro commentId definidio en app-routing
      if (paramMap.has('commentId')) {
        this.mode = 'edit';
        this.commentId = paramMap.get('commentId')
        this.isLoading = true;
        this.commentsService.getComment(this.commentId).subscribe(commentData => {
          this.isLoading = false;
          // hay que cambiar null luego
          this.comment = {
            id: commentData._id,
            title: commentData.title,
            content: commentData.content,
            creator: commentData.creator
          }
          this.form.setValue({
            'title': this.comment.title,
            'content': this.comment.content,
          });
        });
      } else {
        this.mode = 'create';
        this.commentId = null;
      }

    });
  }



  onSaveComment() {
    if (this.form.invalid) {
      return;
    }
    //this.isLoading = true;
    if (this.mode === 'create') {
      this.commentsService.addComment(this.form.value.title, this.form.value.content);

    } else {
      this.commentsService.updateComment(
        this.commentId,
        this.form.value.title,
        this.form.value.content,

        );
    }
    this.form.reset();
    this.formDirective.resetForm();
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }
}
