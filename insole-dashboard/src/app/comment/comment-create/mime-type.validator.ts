import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';


//<{[key: string]}> indica que da igual el objeto, pero debe tener key de tipo string
export const mimeType= (control: AbstractControl):
Promise<{[key: string]: any }> | Observable <{[key: string]: any }> => {
if(typeof(control.value)=== 'string'){
  //retorna un observable inmediato
  return of(null);
}
  const file = control.value as File;
  const fileReader= new FileReader();
  //creacion de observable
  const frObs= Observable.create((observer: Observer<{[key: string]: any }>)=>{

    fileReader.addEventListener("loadend", () => {
      //Se mira dentro del archivo si es un archivo de imagen conviertendo a bits
      const arr= new Uint8Array(fileReader.result as ArrayBuffer).subarray(0,4);
      let header= "";
      let isValid= false;
      for(let i= 0; i < arr.length; i++){
        header+= arr[i].toString(16);
      }
      switch(header){
        case "89504e47":
            isValid = true;
            break;
          case "ffd8ffe0":
          case "ffd8ffe1":
          case "ffd8ffe2":
          case "ffd8ffe3":
          case "ffd8ffe8":
            isValid = true;
            break;
          default:
            isValid = false; // Or you can use the blob.type as fallback
            break;
      }
      if (isValid) {
        observer.next(null);
      } else {
        observer.next({ invalidMimeType: true });
      }
      observer.complete();
    });
    fileReader.readAsArrayBuffer(file);
  });
  return frObs;
};
