import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Componentes
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from './app-routing.module';
import { PostModule } from './post/post.module';
import { ProfileModule } from './profile/profile.module';

//Interceptors
import { AuthInterceptor } from './auth/auth-interceptor';
import { ErrorInterceptor } from './error-interceptor';
import { ErrorComponent } from './error/error.component';

//AngularMaterial
import { AngularMaterialModule } from './angular-material.module';

import { MainNavComponent } from './main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChartsModule } from "ng2-charts";
import { InsoleComponent } from './insole/insole.component';
import { SharedModule } from './shared/shared.module';


//Flexlayout
import {FlexLayoutModule} from '@angular/flex-layout';

// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DialogModule } from './confirm-dialog/dialog.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { SecondInsoleComponent } from './insole/second-insole.component';
//Added validators in sharedModule

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ErrorComponent,
    MainNavComponent,
    DashboardComponent,
    InsoleComponent,
    SecondInsoleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularMaterialModule,
    PostModule,
    ProfileModule,
    LayoutModule,
    ChartsModule,
    SharedModule,
    FlexLayoutModule,
    FontAwesomeModule,
    DialogModule,
    ReactiveFormsModule,
    FormsModule,
    MatGridListModule,
    FlexLayoutModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],

  entryComponents: [
    ErrorComponent,
    DialogModule
  ]
})
export class AppModule { }
