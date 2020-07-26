import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
//Servicio
import { ProfilesService } from '../profiles.service';
import { Profile } from '../profile.model';

//Validator personalizado
import { mimeType } from './mime-type.validator';
import { Subscription, Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

//All Genders Icon
import { faVenusMars } from '@fortawesome/free-solid-svg-icons';
//Female Icon
import { faVenus } from '@fortawesome/free-solid-svg-icons';
//Male Icon
import { faMars } from '@fortawesome/free-solid-svg-icons';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { startWith, map } from 'rxjs/operators';
//import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
//import {default as _rollupMoment, Moment} from 'moment';

//const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit, OnDestroy {


  //icons
  faVenusMars = faVenusMars;
  faVenus = faVenus;
  faMars = faMars;

  genderList = [{ value: 'All', icon: faVenusMars },
  { value: 'male', icon: faMars }, { value: 'female', icon: faVenus }];

  minDate: Date;
  maxDate: Date;
  enteredName = '';
  enteredSurname = '';
  profile: Profile;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  imageInputText: string= "Upload your image";
  private mode = 'myProfile';
  private userId: string;
  //private token: string;
  rol: string;
  public profileRol: string;
  //Suscripcion para control de errores
  private authStatusSub: Subscription;
  // Variables para chiplist



  constructor(
    public profilesService: ProfilesService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Set the minimum to January 1st 20 years in the past and December 31st a year in the future.
    let date = new Date();
    const currentYear = date.getFullYear();
    this.minDate = new Date(currentYear - 130, 0, 1);
    this.maxDate = date;
    console.log(currentYear);
    let epochTime = date.getTime();
    let serializedDate = date.toISOString();
    this.filteredPatologies = this.patologiesCtrl.valueChanges.pipe(
      startWith(null),
      map((patologie: string | null) => patologie ? this._filter(patologie) : this.patologiesList.slice()));
  }

  //route contiene información sobre nuestras rutas
  //En este tipo de observable no hace falta desuscribirse
  //La función de dentro de subscribe se ejecutará cuando cambie la ruta

  ngOnInit() {
    //Me suscribo para detectar si hay cambios en el estado de autenticacion
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(authStatus => {
      this.isLoading = false;
    });
    this.form = new FormGroup({
      /// Se puede añadir updateOn para ver cuando se valida
      //null es el valor inicial
      'name': new FormControl(null, {
        validators: [Validators.required,
        Validators.minLength(3)]
      }),
      'surname': new FormControl(null, { validators: Validators.required }),
      'phone': new FormControl(null, { validators: [Validators.required, Validators.minLength(9)] }),
      'image': new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      }),
      /*'bornDate': new FormControl(null, null),
      'contactPhone': new FormControl(null, { validators: [ Validators.minLength(9)] }),
      'typeOfResponsible': new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      }),*/
    });

    this.rol = this.authService.getRolLogged();
    //Suscripción para detectar cambios en route
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // revisa si existe el parametro userId definidio en app-routing
      if (paramMap.has('userId') && this.rol !== 'undefined' && this.rol !== 'patient') {
        this.mode = 'check';
        this.userId = paramMap.get('userId')
        this.isLoading = true;

      } else {
        this.mode = 'myProfile';
        this.userId = localStorage.getItem('userId');
      }
      this.profilesService.getProfile(this.userId).subscribe(profileData => {
        this.isLoading = false;
        this.profileRol = profileData.__t;

        this.profile = {
          name: profileData.name,
          surname: profileData.surname,
          phone: profileData.phone,
          userImagePath: profileData.userImagePath,
          userId: profileData.linkedAccount,
          bornDate: profileData.bornDate,
          contactPhone: profileData.contactPhone,
          typeOfResponsible: profileData.typeOfResponsible,

         personalId: profileData.personalId,
        height :profileData.height,
        weight: profileData.weight,
        gender : profileData.gender,
        tinetti : profileData.tinetti,
        getuptest : profileData.getuptest,
        mms : profileData.mms,
        description : profileData.description,
        leftInsole: profileData.leftInsole,
        rightInsole: profileData.rightInsole,
        patologies: profileData.patologies
        }
        this.imagePreview=profileData.userImagePath;
        // Controlo que no tenga campos en undefined
        Object.keys(this.profile).forEach(key => {
          this.profile[key] === undefined ? this.profile[key] = "" : null;
        });

        this.form.setValue({
          'name': this.profile.name,
          'surname': this.profile.surname,
          'phone': this.profile.phone,
          'image': this.profile.userImagePath,


        });
        if (this.profileRol === 'patient') {
          //puede que haga falta transformar la fecha
          //let date = new Date(this.profile.bornDate);
          //let serializedDate = date.toISOString();

          this.form.addControl('contactPhone', new FormControl(null, Validators.minLength(9)));
          this.form.addControl('bornDate', new FormControl({ value: '', disabled: true }));
          this.form.addControl('personalId', new FormControl(false));
          this.form.addControl('height', new FormControl(false));
          this.form.addControl('weight', new FormControl(false));
          this.form.addControl('selectedGender', new FormControl(false));

          if(this.rol === 'responsible'){
          this.form.addControl('tinetti', new FormControl(false));
          this.form.addControl('getuptest',new FormControl(false));
          this.form.addControl('mms', new FormControl(false));
          this.form.addControl('description', new FormControl(false));
          this.form.addControl('leftInsole', new FormControl(false));
          this.form.addControl('rightInsole', new FormControl(false));
          this.form.addControl('patologies', new FormControl(false));
          this.form.patchValue({
            'tinetti': this.profile.tinetti,
            'getuptest': this.profile.getuptest,
            'mms': this.profile.mms,
            'description': this.profile.description,
            'leftInsole': this.profile.leftInsole,
            'rightInsole': this.profile.rightInsole,
            'patologies': this.profile.patologies

          });
          this.patologies= this.profile.patologies;
}
          this.form.patchValue({
            'contactPhone': this.profile.contactPhone,
            'bornDate': new Date(this.profile.bornDate),
            'personalId': this.profile.personalId,
            'height': this.profile.height,
            'weight': this.profile.weight,
            'selectedGender': this.profile.gender,

          });
        } else if (this.profileRol === 'responsible') {
          this.form.addControl('typeOfResponsible', new FormControl(null, null));
          this.form.patchValue({
            'typeOfResponsible': this.profile.typeOfResponsible,
          });
        }
        console.log(this.form);
      });
    });
  }


  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ 'image': file });
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {

      this.imagePreview = (reader.result as string);
    };
    console.log(this.form.get('image'));
    this.imageInputText= (<HTMLInputElement>event.target).files[0].name;
    reader.readAsDataURL(file);
  }

  onSaveProfile() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    switch (this.profileRol) {
      case 'patient': {
        if(this.rol=== 'responsible'){
          this.profilesService.updateProfile(
            this.userId,
            this.form.value.name,
            this.form.value.surname,
            this.form.value.phone,
            this.form.value.image,
            this.profileRol,
            this.form.value.contactPhone,
            this.form.getRawValue().bornDate.getTime(),
            this.form.value.personalId,
            this.form.value.height,
            this.form.value.weight,
            this.form.value.selectedGender,
            this.form.value.tinetti,
            this.form.value.getuptest,
            this.form.value.mms,
            this.form.value.description,
            this.form.value.leftInsole,
            this.form.value.rightInsole,
            this.form.value.patologies
          );

        }else{
        this.profilesService.updateProfile(
          this.userId,
          this.form.value.name,
          this.form.value.surname,
          this.form.value.phone,
          this.form.value.image,
          this.profileRol,
          this.form.value.contactPhone,
          this.form.getRawValue().bornDate.getTime(),
          this.form.value.personalId,
          this.form.value.height,
          this.form.value.weight,
          this.form.value.selectedGender
        );}
          break;
      }
      case 'responsible': {
        this.profilesService.updateProfile(
          this.userId,
          this.form.value.name,
          this.form.value.surname,
          this.form.value.phone,
          this.form.value.image,
          this.profileRol,
          this.form.value.typeOfResponsible
        );
          break;
      }
      default: {
        this.profilesService.updateProfile(
          this.userId,
          this.form.value.name,
          this.form.value.surname,
          this.form.value.phone,
          this.form.value.image
        );

      }
        //this.form.reset();
    }
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  patologiesCtrl = new FormControl();
  filteredPatologies: Observable<string[]>;
  patologies: string[] ;
  patologiesList: string[] = ['Parkinson', 'Dementia', 'Diabetes', 'Cardiopathy', 'Foot Issues'];


  @ViewChild('patologiesInput') patologiesInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;



  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our patologie
    if ((value || '').trim()) {
      this.patologies.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.patologiesCtrl.setValue(null);
  }

  remove(patologie: string): void {
    const index = this.patologies.indexOf(patologie);

    if (index >= 0) {
      this.patologies.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.patologies.push(event.option.viewValue);
    this.patologiesInput.nativeElement.value = '';
    this.patologiesCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.patologiesList.filter(patologie => patologie.toLowerCase().indexOf(filterValue) === 0);
  }
}
