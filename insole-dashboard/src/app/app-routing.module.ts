import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommentListComponent } from './comment/comment-list/comment-list.component';
import { ProfileListComponent } from './profile/profile-list/profile-list.component';
import { CommentCreateComponent } from './comment/comment-create/comment-create.component';

import { AuthGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfilePageComponent } from './profile/profile-page/profile-page.component';


const routes: Routes = [
  //{path: '', component: PostListComponent, canActivate: [AuthGuard]},
  {path: '', component: ProfileListComponent, canActivate: [AuthGuard]},
  {path: 'create', component: CommentCreateComponent, canActivate: [AuthGuard]},
  {path: 'edit/:commentId', component: CommentCreateComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: ProfilePageComponent, canActivate: [AuthGuard]},
  {path: 'profile/:userId', component: ProfilePageComponent, canActivate: [AuthGuard]},
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'dashboard/:userId', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'dashboard/compare', component: DashboardComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
