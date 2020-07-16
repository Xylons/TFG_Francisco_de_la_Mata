import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

//Servicio
import { PostsService } from '../posts.service';
import { Post } from '../post.model';

//Validator personalizado
import {mimeType} from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';







@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {

  enteredTitle = '';
  enteredContent = '';
  post: Post;
  isLoading = false;
  form: FormGroup;
  private mode = 'create';
  private postId: string;

  //Suscripcion para control de errores
  private authStatusSub: Subscription;
  @ViewChild('formDirective') formDirective;
  constructor(
    public postsService: PostsService,
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
      // revisa si existe el parametro postId definidio en app-routing
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId')
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          // hay que cambiar null luego
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            creator: postData.creator
          }
          this.form.setValue({
            'title': this.post.title,
            'content': this.post.content,
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }

    });
  }



  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    //this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(this.form.value.title, this.form.value.content);

    } else {
      this.postsService.updatePost(
        this.postId,
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
