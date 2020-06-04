import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

//Servicio
import { ProfilesService } from '../profiles.service';
import { Profile } from '../profile.model';

//Validator personalizado
import {mimeType} from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';







@Component({
  selector: 'app-profile-check',
  templateUrl: './profile-check.component.html',
  styleUrls: ['./profile-check.component.css']
})
export class ProfileCheckComponent implements OnInit, OnDestroy {

  enteredTitle = '';
  enteredContent = '';
  profile: Profile;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'check';
  private userId: string;
  //Suscripcion para control de errores
  private authStatusSub: Subscription;

  constructor(
    public profilesService: ProfilesService,
    public route: ActivatedRoute,
    private authService: AuthService
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
      'name': new FormControl(null, {
        validators: [Validators.required,
        Validators.minLength(3)]
      }),
      'surname': new FormControl(null, { validators: Validators.required }),
      'phone': new FormControl(null, { validators: [Validators.required, Validators.minLength(9)]}),
      'image': new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]})
    });

    //Suscripción para detectar cambios en route
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // revisa si existe el parametro userId definidio en app-routing
      if (paramMap.has('userId')) {
        this.mode = 'edit';
        this.userId = paramMap.get('userId')
        this.isLoading = true;
        this.profilesService.getProfile(this.userId).subscribe(profileData => {
          this.isLoading = false;
          // hay que cambiar null luego
          this.profile = {
            name: profileData.name,
            surname: profileData.surname,
            phone: profileData.phone,
            userImagePath: profileData.userImagePath,
            userId: profileData.linkedAccount
          }
          this.form.setValue({
            'name': this.profile.name,
            'surname': this.profile.surname,
            'phone': this.profile.phone,
            'userImagePath': this.profile.userImagePath
          });
        });
      } else {
        this.mode = 'check';
        this.userId = null;
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


  onSaveProfile() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    /*if (this.mode === 'create') {
      this.profilesService.addProfile(this.form.value.title, this.form.value.content, this.form.value.image);

    } else {*/
      this.profilesService.updateProfile(
        this.userId,
        this.form.value.name,
        this.form.value.surname,
        this.form.value.phone,
        this.form.value.image
        );

    this.form.reset();
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }
}
