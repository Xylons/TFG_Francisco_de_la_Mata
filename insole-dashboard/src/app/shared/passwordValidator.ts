import { Directive } from '@angular/core';
import { AbstractControl, FormGroup, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from "@angular/forms";

function validatePassword(): ValidatorFn {
  return (control: AbstractControl) => {
    let isValid = false;
    if (control && control instanceof FormGroup) {
      let group = control as FormGroup;
      if (group.controls['password'] && group.controls['passwordConfirm']) {
        isValid = group.controls['password'].value == group.controls['passwordConfirm'].value;
        if(!isValid){
          group.controls['passwordConfirm'].setErrors({'incorrect': true});
        }else{
          group.controls['passwordConfirm'].setErrors(null);
        }
      }
    }
    if (isValid) {

      return null;
    } else {

      return { 'passwordCheck': 'failed' }
    }
  }
}

@Directive({
  selector: '[appPasswordsMatches]',
  providers: [{ provide: NG_VALIDATORS, useExisting: PasswordValidator, multi: true }]
})
export class PasswordValidator implements Validator {
  private valFn;

  constructor() {
    this.valFn = validatePassword();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return this.valFn(c);
  }
}

