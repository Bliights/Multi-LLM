import { Routes } from '@angular/router';
import {SignUpPageComponent} from './sign-up-page/sign-up-page.component';
import {LoginPageComponent} from './login-page/login-page.component';
import {HomePageComponent} from './home-page/home-page.component';
import {AccountPageComponent} from './account-page/account-page.component';
import { AuthGuard } from './auth.service';

export const routes: Routes = [
  {path: 'sign-up', component: SignUpPageComponent},
  {path: 'login', component: LoginPageComponent},
  {path:'',component: HomePageComponent, canActivate: [AuthGuard]},
  {path:'conv/:id',component: HomePageComponent, canActivate: [AuthGuard] },
  {path:'account',component: AccountPageComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
