import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

//Servicio
import { PostsService } from '../posts.service';
import { Post } from '../post.model';

//Validator personalizado
import {mimeType} from './mime-type.validator';







@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

  enteredTitle = '';
  enteredContent = '';
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string;

  constructor(public postsService: PostsService, public route: ActivatedRoute) { }

  //route contiene información sobre nuestras rutas
  //En este tipo de observable no hace falta desuscribirse
  //La función de dentro de subscribe se ejecutará cuando cambie la ruta

  ngOnInit() {
    this.form = new FormGroup({
      /// Se puede añadir updateOn para ver cuando se valida
      //null es el valor inicial
      'title': new FormControl(null, {
        validators: [Validators.required,
        Validators.minLength(3)]
      }),
      'content': new FormControl(null, { validators: Validators.required }),
      'image': new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]})
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
          this.post = { id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath}
          this.form.setValue({
            'title': this.post.title,
            'content': this.post.content,
            'image': this.post.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }

    });
  }

  onImagePicked(event: Event){
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({'image': file});
    this.form.get('image').updateValueAndValidity();
   const reader= new FileReader();
   reader.onload= () =>{

     this.imagePreview = (reader.result as string);
   };
   reader.readAsDataURL(file);
  }


  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);

    } else {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
        );
    }
    this.form.reset();
  }

}
