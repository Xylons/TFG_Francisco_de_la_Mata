import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';


//Permite inyectar servicios dentro de servicios
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router){}
  canActivate(route: ActivatedRouteSnapshot,
     state: RouterStateSnapshot):
      boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const isAuth =this.authService.getIsAuth();
        const rol=this.authService.getRolLogged();
        const url= state.url;
        const idUser= this.authService.getUserId();
        // falta meter las rutas de gestion de usuarios
        const admin=[''];
        // falta meter control de rutas de responsable
        const responsible=['create', 'edit/', "dashboard"]

        // Si es usuario y accede dashboard se redirecciona a "dashboard/"+idUser
        // Comprobando si tiene usuario sino se manda a una ventana con un mensaje

        // Falta añadir los controles en el backend

        if(!isAuth){
          this.router.navigate(['/auth/login']);
        }


        return isAuth;
  }



}
