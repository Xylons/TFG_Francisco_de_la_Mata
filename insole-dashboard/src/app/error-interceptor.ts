import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from './error/error.component';


// Esto permite injectar otros servicios

// este servicio permite interceptar las peticiones enviadas con http y anadirle el token de usuario
@Injectable()
export class ErrorInterceptor implements HttpInterceptor{
  constructor(private dialog: MatDialog){}

  intercept(req: HttpRequest<any>, next: HttpHandler){
    // pipe permite añadir un elemento al stream
    return next.handle(req).pipe(
      // operador que nos permite manejar los errores mostrados
      catchError((error: HttpErrorResponse)=> {
        let errorMessage= "An unknow error ocurred!";
        if(error.error.message){
          errorMessage= error.error.message;

        }
        this.dialog.open(ErrorComponent, {data: {message:errorMessage}});
        // esto retorna un observable con el error
        return throwError(error);
      })
    );
  }
}
