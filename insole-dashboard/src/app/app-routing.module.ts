import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostListComponent } from './post/post-list/post-list.component';
import { PostCreateComponent } from './post/post-create/post-create.component';

import { AuthGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';


const routes: Routes = [
  {path: '', component: PostListComponent, canActivate: [AuthGuard]},
  {path: 'create', component: PostCreateComponent, canActivate: [AuthGuard]},
  {path: 'edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard]},
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'dashboard/:userId', component: DashboardComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
