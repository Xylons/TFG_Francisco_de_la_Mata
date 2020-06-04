import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

// Uso variables de entorno para obtener la direccion API
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiURL + "/user/"

@Injectable({
  providedIn: "root"
})

export class AuthService {
  private isAuthenticated = false;
  private token: string;

  //se puede cambiar por any y luego usar window.setTimeout()
  private tokenTimer: any;
  private userId: string;
  //Aqui se crearia un objeto user con mas atributos definidos en un user.model.ts
  // El tipo se cambia si hay mas usuarios
  private authStatusListener = new Subject<boolean>();
  //Variable para almacenar el rol autenticado
  private rolLogged: string;
  // Clase para verificar si se ha enviado el mensaje
  private sendedStatusListener= new Subject<boolean>();
  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }


  getRolLogged() {
    return this.rolLogged;
  }

  getUserId() {
    return this.userId;
  }



  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }
  getSendedtatusListener() {
    return this.sendedStatusListener.asObservable();
  }


  createUser(email: string, password: string, name: string, surname: string) {
    const initialAuthData=  {
      email: email,
      password: password,
      name: name,
      surname:surname
    };

    // aqui retorno el objeto observable y lo recibe en sigunpcomponent
    return this.http.post(BACKEND_URL + "signup", initialAuthData)
      .subscribe(() => {
        this.router.navigate(["auth/login"]);
      }, error => {
        this.authStatusListener.next(false);
      });

  }

  createProfile(email: string, password: string, name: string, surname: string) {
    const authData = {
      email: email,
      password: password,
      name:name,
      surname:surname
    };

    // aqui retorno el objeto observable y lo recibe en sigunpcomponent
    return this.http.post(BACKEND_URL + "signup", authData)
      .subscribe(() => {
        this.router.navigate(["auth/login"]);
      }, error => {
        this.authStatusListener.next(false);
      });

  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password,

    };
    this.http.post<{ token: string, expiresIn: number, userId: string, rol: string }>(BACKEND_URL + "login", authData)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.rolLogged = response.rol;
          this.setAuthTimer(expiresInDuration);
          this.userId = response.userId;
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          console.log(expirationDate);
          this.saveAuthData(token, expirationDate, this.userId, this.rolLogged);
          console.log(response);
          this.router.navigate(["/"]);
        }

      }, error => {
        this.authStatusListener.next(false);
      });
  }

  //Metodo para comprobar si existe un token
  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    //Si el valor es negativo esta caducado
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.rolLogged = authInformation.rolLogged;
      // Divido ya que get.time() devuelve en milisegundos
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    this.rolLogged = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/auth/login"]);
  }

  private setAuthTimer(duration: number) {
    console.log("setting timeer in " + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, rol: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('rol', rol);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('rol');
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    const rol = localStorage.getItem("rol");
    if (!token || !expirationDate) {
      return;
    }
    //retorno objeto javascript
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      rolLogged: rol
    }
  }

  reset(password: string, token: string) {
    console.log(token);
    const resetData= {
      password: password,
      token: token,
    };

    // aqui retorno el objeto observable y lo recibe en resetcomponent
    return this.http.post<{token: string, expiresIn: number, userId: string, rol: string }>(BACKEND_URL + "reset", resetData)
    .subscribe(response => {
      const token = response.token;
      this.token = token;
      if (token) {
        const expiresInDuration = response.expiresIn;
        this.rolLogged = response.rol;
        this.setAuthTimer(expiresInDuration);
        this.userId = response.userId;
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        console.log(expirationDate);
        this.saveAuthData(token, expirationDate, this.userId, this.rolLogged);
        console.log(response);
        this.router.navigate(["/"]);
      }

    }, error => {
      this.authStatusListener.next(false);
    });

  }
  recover(email: string) {
    const emailData= {
      email: email,
    };
    // aqui retorno el objeto observable y lo recibe en recovercomponent
    this.http.post<{ sended: boolean}>(BACKEND_URL + "recover", emailData)
      .subscribe((response) => {
        console.log(response.sended);
        this.sendedStatusListener.next(response.sended);
      }, error => {
        this.sendedStatusListener.next(false);
      });

  }
}
